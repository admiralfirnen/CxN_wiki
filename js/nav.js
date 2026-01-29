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
 */

(function() {
    'use strict';

    // Site configuration (loaded from site.json)
    let siteConfig = null;

    // Determine the base path based on current page location
    function getBasePath() {
        const path = window.location.pathname;
        
        // Check if we're in a subdirectory by looking for known section paths
        const sections = ['about', 'wiki', 'strategy', 'faq', 'announcements', 'tools', 'downloads', 'roe', 'trophy-room', 'admin'];
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

    // Generate navigation HTML
    function generateNavHTML(basePath, config) {
        const activePage = getActivePage(config.navigation);
        
        const navLinksHTML = config.navigation.map(item => {
            const isActive = item.id === activePage ? ' active' : '';
            return `<li class="nav-item"><a href="${basePath}${item.href}" class="nav-link${isActive}">${item.text}</a></li>`;
        }).join('\n                ');

        return `
    <div class="nav-wrapper">
        <div class="nav-logo">
            <a href="${basePath}index.html" class="logo-link">
                <img src="${basePath}${config.branding.logo}" alt="${config.branding.logoAlt}" class="header-logo">
            </a>
        </div>
        <ul class="nav-menu">
            ${navLinksHTML}
        </ul>
    </div>`;
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
        
        try {
            const response = await fetch(basePath + 'site.json');
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
        // Inject navigation
        const navContainer = document.getElementById('main-nav');
        if (navContainer) {
            navContainer.className = 'nav-container';
            navContainer.innerHTML = generateNavHTML(basePath, config);
        }

        // Inject footer
        const footerContainer = document.getElementById('main-footer');
        if (footerContainer) {
            footerContainer.className = 'footer';
            footerContainer.innerHTML = generateFooterHTML(basePath, config);
        }
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
        getBasePath: getBasePath
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadConfigAndInit);
    } else {
        loadConfigAndInit();
    }
})();
