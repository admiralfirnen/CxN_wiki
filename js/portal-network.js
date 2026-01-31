const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const portalCanvas = document.getElementById('portalCanvas');
    const portalCtx = portalCanvas.getContext('2d');
    const statusDiv = document.getElementById('status');
    const calcBtn = document.getElementById('calcBtn');
    
    let img = new Image();
    let portalIcon = new Image();
    portalIcon.src = '../portal_icon.png';
    let landPoints = []; // Stores {x, y} for Land pixels
    let allLandPoints = []; // High-res fallback for final snapping
    let originalWidth = 0;
    let originalHeight = 0;
    let currentPortals = [];
    let glowAnimationId = null;

    // --- 1. IMAGE HANDLING ---
    // Use embedded data URL when available so canvas is never tainted (getImageData works with file:// and any server)
    img.onload = function() { initMap(); };
    img.onerror = function() {
        statusDiv.innerText = "Failed to load map image.";
    };
    if (typeof window.K277_MAP_DATA_URL === 'string' && window.K277_MAP_DATA_URL.length > 0) {
        img.src = window.K277_MAP_DATA_URL;
    } else {
        img.src = '../K277_map.png';
    }

    function initMap() {
        // Limit internal resolution to keep calculations fast (Max width 1000px)
        const MAX_WIDTH = 1000;
        let scale = 1;
        
        if (img.width > MAX_WIDTH) {
            scale = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scale;
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }

        originalWidth = canvas.width;
        originalHeight = canvas.height;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        portalCanvas.width = canvas.width;
        portalCanvas.height = canvas.height;
        portalCtx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);

        statusDiv.innerText = "Map loaded. Ready to analyze.";
        calcBtn.disabled = false;
        landPoints = [];
        document.getElementById('portal-coordinates').innerHTML = '';
        if (glowAnimationId != null) {
            cancelAnimationFrame(glowAnimationId);
            glowAnimationId = null;
        }
        currentPortals = [];
    }

    // --- 2. MAIN LOGIC ---
    calcBtn.addEventListener('click', () => {
        const n = parseInt(document.getElementById('portalCount').value);
        if (isNaN(n) || n < 1) return;

        if (glowAnimationId != null) {
            cancelAnimationFrame(glowAnimationId);
            glowAnimationId = null;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        portalCanvas.width = canvas.width;
        portalCanvas.height = canvas.height;
        portalCtx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);
        currentPortals = [];
        document.getElementById('portal-coordinates').innerHTML = '';

        setStatus(true, "Scanning terrain geometry...");
        
        setTimeout(() => {
            const result = scanTerrain();
            if (!result.ok) {
                setStatus(false, result.message || "Error: No land found.");
                return;
            }

            setStatus(true, `Optimizing locations for ${n} portals...`);
            
            setTimeout(() => {
                const portals = runConstrainedKMeans(n);
                drawResults(portals);
                setStatus(false, "Optimization Complete!");
            }, 50);

        }, 50);
    });

    function setStatus(loading, text) {
        if (loading) {
            statusDiv.innerHTML = `<span class="spinner" style="display:inline-block"></span> ${text}`;
            calcBtn.disabled = true;
        } else {
            statusDiv.innerText = text;
            calcBtn.disabled = false;
        }
    }

    // --- 3. TERRAIN ANALYSIS ---
    // Fixed threshold: pixels within this RGB distance of top-left are "water"; rest = land. No user input.
    const WATER_COLOR_DISTANCE = 15;
    function scanTerrain() {
        const w = canvas.width;
        const h = canvas.height;
        if (w === 0 || h === 0) {
            return { ok: false, message: "Map not ready. Wait for the map to load." };
        }
        ctx.drawImage(img, 0, 0, w, h);
        let imageData;
        try {
            imageData = ctx.getImageData(0, 0, w, h);
        } catch (e) {
            return { ok: false, message: "Cannot read map pixels (canvas restricted)." };
        }
        const data = imageData.data;
        landPoints = [];

        const waterR = data[0];
        const waterG = data[1];
        const waterB = data[2];

        const totalPixels = w * h;
        const step = Math.max(2, Math.floor(Math.sqrt(totalPixels / 5000)));

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];

                const dist = Math.sqrt((r - waterR)**2 + (g - waterG)**2 + (b - waterB)**2);
                if (dist > WATER_COLOR_DISTANCE) {
                    if (x % step === 0 && y % step === 0) {
                        landPoints.push({x, y});
                    }
                }
            }
        }
        if (landPoints.length === 0) {
            for (let y = 0; y < h; y += step) {
                for (let x = 0; x < w; x += step) {
                    landPoints.push({x, y});
                }
            }
        }
        return { ok: true };
    }

    // --- 4. ALGORITHM: CONSTRAINED K-MEANS ---
    function runConstrainedKMeans(k) {
        // A. Initialization: Pick k random land points
        let centroids = [];
        for(let i=0; i<k; i++) {
            centroids.push({ ...landPoints[Math.floor(Math.random() * landPoints.length)] });
        }

        let iterations = 0;
        const maxIter = 20;

        while(iterations < maxIter) {
            // B. Assignment: Group points to nearest centroid
            let clusters = Array.from({length: k}, () => ({sumX:0, sumY:0, count:0}));

            for(let p of landPoints) {
                let minDist = Infinity;
                let cIndex = 0;
                
                for(let i=0; i<k; i++) {
                    const d = (p.x - centroids[i].x)**2 + (p.y - centroids[i].y)**2;
                    if(d < minDist) {
                        minDist = d;
                        cIndex = i;
                    }
                }
                clusters[cIndex].sumX += p.x;
                clusters[cIndex].sumY += p.y;
                clusters[cIndex].count++;
            }

            // C. Update: Move centroid to average position AND Snap to Land
            let maxShift = 0;

            for(let i=0; i<k; i++) {
                if(clusters[i].count === 0) continue; // Should be rare

                const avgX = clusters[i].sumX / clusters[i].count;
                const avgY = clusters[i].sumY / clusters[i].count;

                // CRITICAL STEP: The "Average" might be in the water.
                // We must find the nearest valid land point to this average
                // to ensure the portal is placed on solid ground.
                const snapped = findNearestLandPoint({x: avgX, y: avgY});

                const shift = Math.sqrt((snapped.x - centroids[i].x)**2 + (snapped.y - centroids[i].y)**2);
                if(shift > maxShift) maxShift = shift;

                centroids[i] = snapped;
            }

            if(maxShift < 2) break; // Converged
            iterations++;
        }
        return centroids;
    }

    // Helper: Find nearest land pixel to a target coordinate
    function findNearestLandPoint(target) {
        let nearest = null;
        let minD = Infinity;

        // Efficient linear search over our sampled land points
        for(let p of landPoints) {
            const d = (p.x - target.x)**2 + (p.y - target.y)**2;
            if(d < minD) {
                minD = d;
                nearest = p;
            }
        }
        return nearest;
    }

    // --- 5. VISUALIZATION ---
    const PORTAL_ICON_SIZE = Math.round(32 * 0.85 * 0.85); // 15% smaller twice

    function drawPortalFrame(portals, t) {
        portalCtx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);
        const iconW = PORTAL_ICON_SIZE;
        const iconH = PORTAL_ICON_SIZE;
        const pulse = 0.35 + 0.35 * Math.sin(t * 0.004);
        const drawIcon = (px, py) => {
            if (portalIcon.complete && portalIcon.naturalWidth) {
                portalCtx.drawImage(portalIcon, px - iconW / 2, py - iconH / 2, iconW, iconH);
            } else {
                portalCtx.beginPath();
                portalCtx.arc(px, py, 8, 0, Math.PI * 2);
                portalCtx.fillStyle = "#e74c3c";
                portalCtx.strokeStyle = "#fff";
                portalCtx.lineWidth = 2;
                portalCtx.fill();
                portalCtx.stroke();
            }
        };
        portals.forEach((p) => {
            const r = 34;
            const g = portalCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
            g.addColorStop(0, `rgba(100, 180, 255, ${pulse * 0.85})`);
            g.addColorStop(0.35, `rgba(70, 140, 235, ${pulse * 0.6})`);
            g.addColorStop(0.65, `rgba(50, 110, 200, ${pulse * 0.3})`);
            g.addColorStop(1, 'rgba(40, 80, 180, 0)');
            portalCtx.beginPath();
            portalCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
            portalCtx.fillStyle = g;
            portalCtx.fill();
            drawIcon(p.x, p.y);
        });
    }

    function drawResults(portals) {
        currentPortals = portals;
        if (glowAnimationId != null) cancelAnimationFrame(glowAnimationId);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        function glowLoop(t) {
            drawPortalFrame(currentPortals, t);
            glowAnimationId = requestAnimationFrame(glowLoop);
        }
        glowAnimationId = requestAnimationFrame(glowLoop);

        // Normalized coordinates: 0–1000 (origin top-left; e.g. 755 = 75.5%)
        const coordEl = document.getElementById('portal-coordinates');
        const w = canvas.width;
        const h = canvas.height;
        coordEl.innerHTML = portals.map((p, i) => {
            const normX = Math.round((p.x / w) * 1000);
            const normY = Math.round((p.y / h) * 1000);
            const xStr = String(Math.min(1000, Math.max(0, normX))).padStart(3, '0');
            const yStr = String(Math.min(1000, Math.max(0, normY))).padStart(3, '0');
            return `<span>${i + 1}. [X: ${xStr}, Y: ${yStr}]</span>`;
        }).join('');
    }