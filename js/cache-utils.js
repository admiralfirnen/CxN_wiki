/**
 * CxN Wiki - Cache Utilities
 * 
 * Provides cache-busting functionality for fetch requests.
 * This ensures users always get fresh data when they visit the site,
 * while maintaining consistency during a single browsing session.
 * 
 * IMPORTANT: This script must be loaded before any other scripts that fetch JSON data.
 * 
 * Usage:
 *   // Instead of: fetch('data/file.json')
 *   // Use: fetch(CxNCache.bust('data/file.json'))
 */

(function() {
    'use strict';

    // Generate a session-based cache key
    // This timestamp is created once per page load, so:
    // - Fresh data on every new visit/page refresh
    // - Consistent data during a single session
    const SESSION_CACHE_KEY = Date.now().toString();

    /**
     * Add cache-busting query parameter to a URL
     * @param {string} url - The URL to add cache-busting to
     * @returns {string} - URL with cache-busting parameter
     */
    function bust(url) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}_v=${SESSION_CACHE_KEY}`;
    }

    /**
     * Get the current session cache key
     * Useful for debugging or manual cache control
     * @returns {string} - The session cache key
     */
    function getSessionKey() {
        return SESSION_CACHE_KEY;
    }

    // Expose the cache utilities globally
    window.CxNCache = {
        bust: bust,
        getSessionKey: getSessionKey
    };

})();
