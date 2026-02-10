/**
 * CxN Wiki - Shared Navigation Component
 * 
 * This script dynamically injects the navigation and footer into all pages,
 * eliminating the need to duplicate HTML across every file.
 * 
 * Configuration is loaded from site.json in the project root.
 * 
 * Usage: Include this script in every page and add placeholder elements:
 *   <nav id="main-nav"></nav>
 *   <footer id="main-footer"></footer>
 * 
 * Authentication: This script now checks for authentication via CxNAuth module.
 * Pages that don't require authentication should not include this script or
 * handle authentication separately.
 */

(function() {
    'use strict';

    // Site configuration (loaded from site.json)
    let siteConfig = null;

    // Pages that don't require authentication (relative paths)
    const PUBLIC_PAGES = [
        '/login.html'
    ];

    // Check if current page is public (no auth required)
    function isPublicPage() {
        const path = window.location.pathname.toLowerCase();
        return PUBLIC_PAGES.some(page => path.endsWith(page));
    }

    // Determine the base path based on current page location
    function getBasePath() {
        const path = window.location.pathname;
        
        // Check if we're in a subdirectory by looking for known section paths
        const sections = ['about', 'wiki', 'strategy', 'faq', 'announcements', 'tools', 'downloads', 'roe', 'trophy-room', 'sitemap', 'admin'];
        for (const section of sections) {
            if (path.includes('/' + section + '/')) {
                return '../';
            }
        }
        return '';
    }

    // Determine active page from URL
    function getActivePage(navItems) {
        const path = window.location.pathname.toLowerCase();
        for (const item of navItems) {
            if (path.includes('/' + item.id + '/')) {
                return item.id;
            }
        }
        return null;
    }

    // Generate navigation HTML (with optional user info for authenticated users)
    function generateNavHTML(basePath, config, session) {
        const activePage = getActivePage(config.navigation);
        
        const navLinksHTML = config.navigation.map(item => {
            const isActive = item.id === activePage ? ' active' : '';
            return `<li class="nav-item"><a href="${basePath}${item.href}" class="nav-link${isActive}">${item.text}</a></li>`;
        }).join('\n                ');

        // Add user info and logout if authenticated
        let userInfoHTML = '';
        if (session && session.displayName) {
            userInfoHTML = `
        <div class="nav-user-info">
            <span class="nav-user-name">${escapeHtml(session.displayName)}</span>
            <button class="nav-logout-btn" onclick="CxNAuth.logout()">Logout</button>
        </div>`;
        }

        return `
    <div class="nav-wrapper">
        <div class="nav-logo">
            <a href="${basePath}index.html" class="logo-link">
                <img src="${basePath}${config.branding.logo}" alt="${config.branding.logoAlt}" class="header-logo">
            </a>
        </div>
        <button class="nav-hamburger" id="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        </button>
        <div class="nav-body" id="nav-body">
            <ul class="nav-menu">
                ${navLinksHTML}
            </ul>
            <div class="nav-actions">
                <button class="nav-search-btn" id="search-btn" type="button" aria-label="Search">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <span class="nav-search-text">Search</span> <span class="nav-search-kbd">Ctrl K</span>
                </button>
                ${userInfoHTML}
            </div>
        </div>
    </div>`;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generate footer HTML (basePath for Admin link)
    function generateFooterHTML(basePath, config) {
        const currentYear = new Date().getFullYear();
        const yearDisplay = config.copyright.startYear === currentYear 
            ? currentYear 
            : `${config.copyright.startYear}-${currentYear}`;
        return `
    <p class="footer-text">${config.copyright.holder} &copy; ${yearDisplay} | ${config.copyright.suffix} | <a href="${basePath}admin/index.html" class="footer-admin-link">Admin</a></p>`;
    }

    // Load site configuration and initialize
    async function loadConfigAndInit() {
        const basePath = getBasePath();
        
        // Check authentication first (unless on public page)
        if (!isPublicPage()) {
            // Check if CxNAuth is available
            if (typeof CxNAuth !== 'undefined') {
                const authenticated = await CxNAuth.isAuthenticated();
                if (!authenticated) {
                    // Store the intended destination for redirect after login
                    const currentPath = window.location.pathname + window.location.search;
                    sessionStorage.setItem('cxn_redirect_after_login', currentPath);
                    window.location.href = basePath + 'login.html';
                    return;
                }
            } else {
                // CxNAuth not loaded - redirect to login
                // This ensures auth.js must be loaded before nav.js on protected pages
                console.warn('CxNAuth not available, redirecting to login');
                window.location.href = basePath + 'login.html';
                return;
            }
        }
        
        try {
            const url = basePath + 'site.json';
            const cacheBustedUrl = url + (url.includes('?') ? '&' : '?') + '_v=' + Date.now();
            const response = await fetch(cacheBustedUrl);
            if (!response.ok) {
                throw new Error('Failed to load site.json');
            }
            siteConfig = await response.json();
            init(basePath, siteConfig);
        } catch (error) {
            console.error('Error loading site configuration:', error);
            // Fallback to hardcoded defaults if config fails to load
            initWithDefaults(basePath);
        }
    }

    // Initialize with loaded configuration
    function init(basePath, config) {
        // Get session for user info display
        const session = (typeof CxNAuth !== 'undefined') ? CxNAuth.getSession() : null;
        
        // Inject navigation
        const navContainer = document.getElementById('main-nav');
        if (navContainer) {
            navContainer.className = 'nav-container';
            navContainer.innerHTML = generateNavHTML(basePath, config, session);
        }

        // Inject footer
        const footerContainer = document.getElementById('main-footer');
        if (footerContainer) {
            footerContainer.className = 'footer';
            footerContainer.innerHTML = generateFooterHTML(basePath, config);
        }

        // Inject search overlay and initialize Pagefind
        initSearch(basePath);

        // Wire up hamburger menu toggle for mobile/tablet
        const navToggle = document.getElementById('nav-toggle');
        const navBody = document.getElementById('nav-body');
        if (navToggle && navBody) {
            navToggle.addEventListener('click', function() {
                const expanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', String(!expanded));
                navToggle.classList.toggle('active');
                navBody.classList.toggle('active');
            });
            // Close mobile menu when a nav link is clicked
            navBody.querySelectorAll('.nav-link').forEach(function(link) {
                link.addEventListener('click', function() {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.classList.remove('active');
                    navBody.classList.remove('active');
                });
            });
            // Close mobile menu when clicking outside the nav
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.nav-container') && navBody.classList.contains('active')) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.classList.remove('active');
                    navBody.classList.remove('active');
                }
            });
        }
    }

    // ── Pagefind search integration ──
    function initSearch(basePath) {
        // Build and inject the search overlay into the DOM
        const overlay = document.createElement('div');
        overlay.id = 'search-overlay';
        overlay.className = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-overlay-inner">
                <button class="search-close-btn" id="search-close" aria-label="Close search">&times; ESC</button>
                <div id="pagefind-search"></div>
            </div>`;
        document.body.appendChild(overlay);

        // Load Pagefind CSS
        const pfCSS = document.createElement('link');
        pfCSS.rel = 'stylesheet';
        pfCSS.href = basePath + 'pagefind/pagefind-ui.css';
        document.head.appendChild(pfCSS);

        // Load our search theme overrides
        const themeCSS = document.createElement('link');
        themeCSS.rel = 'stylesheet';
        themeCSS.href = basePath + 'css/search.css';
        document.head.appendChild(themeCSS);

        // Load Pagefind UI JS, then initialize
        const pfScript = document.createElement('script');
        pfScript.src = basePath + 'pagefind/pagefind-ui.js';
        pfScript.onload = function() {
            if (typeof PagefindUI !== 'undefined') {
                // Don't pass bundlePath — Pagefind auto-detects it from
                // the pagefind-ui.js script src, which works for any page depth.
                new PagefindUI({
                    element: '#pagefind-search',
                    showSubResults: true,
                    showImages: false,
                    resetStyles: false
                });
            }
        };
        document.head.appendChild(pfScript);

        // Wire up open / close behaviour
        const openSearch = function() {
            overlay.classList.add('active');
            // Focus the Pagefind input after a tick (DOM paint)
            setTimeout(function() {
                const input = overlay.querySelector('.pagefind-ui__search-input');
                if (input) input.focus();
            }, 100);
        };

        const closeSearch = function() {
            overlay.classList.remove('active');
        };

        // Search button in nav
        var searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', openSearch);
        }

        // Close button
        var closeBtn = document.getElementById('search-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSearch);
        }

        // Click on backdrop to close
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeSearch();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl+K or Cmd+K to open
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (overlay.classList.contains('active')) {
                    closeSearch();
                } else {
                    openSearch();
                }
            }
            // Escape to close
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeSearch();
            }
        });
    }

    // Fallback initialization with hardcoded defaults
    function initWithDefaults(basePath) {
        const defaultConfig = {
            branding: {
                logo: 'assets/branding/cxn_clan_icon_photorealistic.png',
                logoAlt: 'CxN Clan Icon'
            },
            navigation: [
                { href: 'about/index.html', text: 'About', id: 'about' },
                { href: 'strategy/index.html', text: 'Strategy', id: 'strategy' },
                { href: 'announcements/index.html', text: 'Announcements', id: 'announcements' },
                { href: 'tools/index.html', text: 'Tools', id: 'tools' },
                { href: 'downloads/index.html', text: 'Downloads', id: 'downloads' },
                { href: 'roe/index.html', text: 'ROE', id: 'roe' },
                { href: 'trophy-room/index.html', text: 'Trophy Room', id: 'trophy-room' }
            ],
            copyright: {
                holder: 'CxN Clan Wiki',
                startYear: 2026,
                suffix: 'Total Battle Strategy Resource'
            }
        };
        init(basePath, defaultConfig);
    }

    // Expose config getter for other scripts
    window.CxNWiki = {
        getConfig: () => siteConfig,
        getBasePath: getBasePath,
        isPublicPage: isPublicPage
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadConfigAndInit);
    } else {
        loadConfigAndInit();
    }
})();
