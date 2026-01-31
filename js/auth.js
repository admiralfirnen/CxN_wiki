/**
 * CxN Wiki - Site Authentication Module
 * 
 * Handles member authentication for the entire site.
 * 
 * Authentication Flow:
 * 1. User enters their clan name (case-insensitive)
 * 2. System checks if name exists in clan_members.json
 * 3. If first login (no password set), prompt to create password
 * 4. If returning, validate password against stored hash
 * 5. Create session on successful authentication
 * 
 * SECURITY NOTE: This uses SHA-256 hashed passwords with client-side validation.
 * Appropriate for a collaborative clan wiki, not for sensitive data protection.
 */

(function() {
    'use strict';

    // Configuration
    const SESSION_KEY = 'cxn_member_session';
    const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
    const PASSWORDS_KEY = 'cxn_member_passwords';

    // Pages that don't require authentication
    const PUBLIC_PAGES = [
        '/login.html'
    ];

    // Cache for clan members data
    let membersCache = null;

    /**
     * Compute SHA-256 hash of a string
     * Uses the Web Crypto API for secure hashing
     */
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Normalize a member name for consistent lookup
     * Converts to lowercase and trims whitespace
     */
    function normalizeName(name) {
        return name.toLowerCase().trim();
    }

    /**
     * Get the base path based on current page location
     */
    function getBasePath() {
        const path = window.location.pathname;
        const sections = ['about', 'wiki', 'strategy', 'faq', 'announcements', 'tools', 'downloads', 'roe', 'trophy-room', 'admin'];
        for (const section of sections) {
            if (path.includes('/' + section + '/')) {
                return '../';
            }
        }
        return '';
    }

    /**
     * Load clan members from JSON file
     */
    async function loadMembers() {
        if (membersCache) {
            return membersCache;
        }

        const basePath = getBasePath();
        try {
            const response = await fetch(basePath + 'data/clan_members.json');
            if (!response.ok) {
                throw new Error('Failed to load clan members');
            }
            membersCache = await response.json();
            return membersCache;
        } catch (error) {
            console.error('Error loading clan members:', error);
            return null;
        }
    }

    /**
     * Find a member by name (case-insensitive)
     * Returns the member object and their rank if found
     */
    async function findMember(name) {
        const members = await loadMembers();
        if (!members) return null;

        const normalizedInput = normalizeName(name);
        const ranks = ['leader', 'superiors', 'officers', 'veterans', 'soldiers'];

        for (const rank of ranks) {
            if (members[rank]) {
                for (const member of members[rank]) {
                    if (normalizeName(member.name) === normalizedInput) {
                        return { ...member, rank: rank };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Get stored passwords from localStorage
     */
    function getStoredPasswords() {
        try {
            const data = localStorage.getItem(PASSWORDS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Error loading passwords:', e);
            return {};
        }
    }

    /**
     * Save passwords to localStorage
     */
    function savePasswords(passwords) {
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
    }

    /**
     * Check if a member has set their password
     */
    function hasPassword(memberName) {
        const passwords = getStoredPasswords();
        const normalizedName = normalizeName(memberName);
        return passwords.hasOwnProperty(normalizedName);
    }

    /**
     * Get password hash for a member
     */
    function getPasswordHash(memberName) {
        const passwords = getStoredPasswords();
        return passwords[normalizeName(memberName)] || null;
    }

    /**
     * Set password hash for a member
     */
    async function setPassword(memberName, password) {
        const passwords = getStoredPasswords();
        const hash = await sha256(password);
        passwords[normalizeName(memberName)] = hash;
        savePasswords(passwords);
        return hash;
    }

    /**
     * Validate password for a member
     */
    async function validatePassword(memberName, password) {
        const storedHash = getPasswordHash(memberName);
        if (!storedHash) return false;
        
        const inputHash = await sha256(password);
        return inputHash === storedHash;
    }

    /**
     * Create a session for authenticated member
     */
    function createSession(memberName, memberData) {
        const session = {
            token: btoa(Date.now() + '_' + Math.random().toString(36).substr(2)),
            memberName: memberName,
            displayName: memberData.name,
            rank: memberData.rank,
            expires: Date.now() + SESSION_DURATION
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    /**
     * Get current session data
     */
    function getSession() {
        try {
            const sessionData = localStorage.getItem(SESSION_KEY);
            if (!sessionData) return null;
            
            const session = JSON.parse(sessionData);
            if (Date.now() > session.expires) {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }
            return session;
        } catch (e) {
            return null;
        }
    }

    /**
     * Check if user is authenticated
     * Also verifies the user is still a clan member
     */
    async function isAuthenticated() {
        const session = getSession();
        if (!session) return false;

        // Verify user is still a clan member
        const member = await findMember(session.memberName);
        if (!member) {
            // User was removed from clan, clear session
            localStorage.removeItem(SESSION_KEY);
            return false;
        }

        return true;
    }

    /**
     * Check if user is authenticated (synchronous version for quick checks)
     * Note: Does not verify clan membership, use isAuthenticated() for full check
     */
    function isAuthenticatedSync() {
        const session = getSession();
        return session !== null;
    }

    /**
     * Logout - clear session
     */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        const basePath = getBasePath();
        window.location.href = basePath + 'login.html';
    }

    /**
     * Check if current page requires authentication
     */
    function isPublicPage() {
        const path = window.location.pathname.toLowerCase();
        return PUBLIC_PAGES.some(page => path.endsWith(page));
    }

    /**
     * Redirect to login if not authenticated
     * Called by nav.js on page load
     */
    async function requireAuth() {
        if (isPublicPage()) {
            return true;
        }

        const authenticated = await isAuthenticated();
        if (!authenticated) {
            const basePath = getBasePath();
            // Store the intended destination for redirect after login
            const currentPath = window.location.pathname + window.location.search;
            sessionStorage.setItem('cxn_redirect_after_login', currentPath);
            window.location.href = basePath + 'login.html';
            return false;
        }
        return true;
    }

    /**
     * Get redirect path after login
     */
    function getRedirectPath() {
        const redirect = sessionStorage.getItem('cxn_redirect_after_login');
        sessionStorage.removeItem('cxn_redirect_after_login');
        return redirect || 'index.html';
    }

    /**
     * Handle login form submission
     */
    async function handleLogin(memberName, password, isNewPassword = false) {
        // Find member in clan list
        const member = await findMember(memberName);
        if (!member) {
            return { success: false, error: 'Member not found. Please use your exact clan name.' };
        }

        // Check if this is first-time setup
        if (!hasPassword(member.name)) {
            if (isNewPassword && password) {
                // Setting new password
                if (password.length < 6) {
                    return { success: false, error: 'Password must be at least 6 characters.' };
                }
                await setPassword(member.name, password);
                createSession(member.name, member);
                return { success: true, isNewUser: true };
            } else {
                // Need to set password
                return { success: false, needsPassword: true, memberName: member.name, displayName: member.name };
            }
        }

        // Validate existing password
        const valid = await validatePassword(member.name, password);
        if (!valid) {
            return { success: false, error: 'Invalid password.' };
        }

        // Create session
        createSession(member.name, member);
        return { success: true };
    }

    /**
     * Reset a member's password (admin function)
     * Removes the stored password so they can set a new one
     */
    function resetMemberPassword(memberName) {
        const passwords = getStoredPasswords();
        const normalizedName = normalizeName(memberName);
        if (passwords.hasOwnProperty(normalizedName)) {
            delete passwords[normalizedName];
            savePasswords(passwords);
            return true;
        }
        return false;
    }

    /**
     * Get all members with passwords set (admin function)
     */
    function getMembersWithPasswords() {
        return Object.keys(getStoredPasswords());
    }

    // Expose public API
    window.CxNAuth = {
        // Authentication
        isAuthenticated: isAuthenticated,
        isAuthenticatedSync: isAuthenticatedSync,
        requireAuth: requireAuth,
        handleLogin: handleLogin,
        logout: logout,
        getSession: getSession,
        getRedirectPath: getRedirectPath,
        
        // Member lookup
        findMember: findMember,
        loadMembers: loadMembers,
        
        // Password management
        hasPassword: hasPassword,
        setPassword: setPassword,
        validatePassword: validatePassword,
        resetMemberPassword: resetMemberPassword,
        getMembersWithPasswords: getMembersWithPasswords,
        
        // Utilities
        sha256: sha256,
        normalizeName: normalizeName,
        getBasePath: getBasePath
    };
})();
