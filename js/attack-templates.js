// Toggle template section
function toggleTemplateSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// Lightbox functionality
let lightbox = null;

function initLightbox() {
    // Create lightbox if it doesn't exist
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'template-lightbox';
        lightbox.innerHTML = `
            <span class="template-lightbox-close">&times;</span>
            <img class="template-lightbox-img" src="" alt="Template Screenshot">
        `;
        document.body.appendChild(lightbox);

        // Close on click outside or on close button
        const closeBtn = lightbox.querySelector('.template-lightbox-close');
        closeBtn.onclick = closeLightbox;
        lightbox.onclick = function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        };

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
}

function openLightbox(imgSrc) {
    initLightbox();
    const img = lightbox.querySelector('.template-lightbox-img');
    img.src = imgSrc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Add template card to gallery
function addTemplateCard(galleryId, template) {
    const gallery = document.getElementById(galleryId);
    if (!gallery) return;

    const card = document.createElement('div');
    card.className = 'template-card';
    
    // Build tags HTML if provided
    let tagsHTML = '';
    if (template.tags && template.tags.length > 0) {
        tagsHTML = '<div class="template-tags">';
        template.tags.forEach(tag => {
            tagsHTML += `<span class="template-tag">${tag}</span>`;
        });
        tagsHTML += '</div>';
    }
    
    // Build images HTML - support single or multiple images
    let imagesHTML = '';
    if (Array.isArray(template.images)) {
        // Multiple images - stack vertically
        template.images.forEach(imgSrc => {
            imagesHTML += `
                <img class="template-screenshot" 
                     src="${imgSrc}" 
                     alt="${template.title}"
                     onclick="openLightbox('${imgSrc}')">`;
        });
    } else if (template.image) {
        // Single image (backward compatibility)
        imagesHTML = `
            <img class="template-screenshot" 
                 src="${template.image}" 
                 alt="${template.title}"
                 onclick="openLightbox('${template.image}')">`;
    }
    
    card.innerHTML = `
        <h4 class="template-card-title">${template.title}</h4>
        ${tagsHTML}
        ${template.description ? `<p class="template-card-description">${template.description}</p>` : ''}
        <div class="template-screenshots-container">
            ${imagesHTML}
        </div>
    `;
    
    gallery.appendChild(card);
}

// Initialize G5 templates on page load
document.addEventListener('DOMContentLoaded', function() {
    // G5 - Elven Citadel Level 10
    addTemplateCard('g5-gallery', {
        title: 'G5 - Elven Citadel Level 10',
        tags: ['Griffens', 'Mercs'],
        images: [
            '../assets/screenshots/citadels/g5/lvl-10-citadel-1a.png',
            '../assets/screenshots/citadels/g5/lvl-10-citadel-1b.png'
        ]
    });
    
    // G6 - Elven Citadel Level 15
    addTemplateCard('g6-gallery', {
        title: 'G6 - Elven Citadel Level 15',
        tags: ['Mercs'],
        images: [
            '../assets/screenshots/citadels/g6/lvl-15-citadel-1a.png'
        ]
    });
    
    // G6 - Elven Citadel Level 20
    addTemplateCard('g6-gallery', {
        title: 'G6 - Elven Citadel Level 20',
        tags: ['Griffens', 'Mercs'],
        images: [
            '../assets/screenshots/citadels/g6/lvl-20-citadel-1a.png',
            '../assets/screenshots/citadels/g6/lvl-20-citadel-1b.png'
        ]
    });
    
    // G6 - Cursed Citadel Level 20
    addTemplateCard('g6-gallery', {
        title: 'G6 - Cursed Citadel Level 20',
        tags: ['Mercs'],
        images: [
            '../assets/screenshots/citadels/g6/lvl-20-cursed-citadel-1a.png'
        ]
    });
});
