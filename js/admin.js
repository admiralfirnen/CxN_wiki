/**
 * CxN Wiki - Admin Module
 * 
 * Handles authentication and announcements management.
 * 
 * SECURITY NOTE: This uses obfuscated credentials for a shared admin account.
 * This is NOT secure for sensitive data - it's designed for a collaborative
 * wiki where multiple trusted users share access.
 */

(function() {
    'use strict';

    // Obfuscated credentials (ROT13 + Base64 encoded)
    // This is intentionally NOT secure cryptography - just obscured from casual viewing
    const AUTH_DATA = {
        // 'admin' encoded
        u: 'bnF6dmE=',
        // 'ppxsucks' encoded  
        p: 'Y2NrZmhweGY='
    };

    // Session key for localStorage
    const SESSION_KEY = 'cxn_admin_session';
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // Announcements storage key for localStorage
    const ANNOUNCEMENTS_KEY = 'cxn_announcements';

    // Clan stats storage key for localStorage
    const STATS_KEY = 'cxn_clan_stats';

    // Clan members storage key for localStorage
    const MEMBERS_KEY = 'cxn_clan_members';

    // Rank display names
    const RANK_NAMES = {
        leader: 'Leader',
        superiors: 'Superiors',
        officers: 'Officers',
        veterans: 'Veterans',
        soldiers: 'Soldiers'
    };

    // Rank order for display
    const RANK_ORDER = ['leader', 'superiors', 'officers', 'veterans', 'soldiers'];

    /**
     * Simple decode function (reverse of encoding)
     * ROT13 + Base64
     */
    function decode(encoded) {
        // Base64 decode
        const decoded = atob(encoded);
        // ROT13 decode
        return decoded.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode(
                (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
            );
        });
    }

    /**
     * Encode function for reference (used to generate the encoded values above)
     * ROT13 + Base64
     */
    function encode(plain) {
        // ROT13 encode
        const rot13 = plain.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode(
                (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
            );
        });
        // Base64 encode
        return btoa(rot13);
    }

    /**
     * Validate credentials
     */
    function validateCredentials(username, password) {
        const validUser = decode(AUTH_DATA.u);
        const validPass = decode(AUTH_DATA.p);
        return username === validUser && password === validPass;
    }

    /**
     * Create a session token
     */
    function createSession() {
        const session = {
            token: btoa(Date.now() + '_' + Math.random().toString(36).substr(2)),
            expires: Date.now() + SESSION_DURATION
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    /**
     * Check if user is authenticated
     */
    function isAuthenticated() {
        try {
            const sessionData = localStorage.getItem(SESSION_KEY);
            if (!sessionData) return false;
            
            const session = JSON.parse(sessionData);
            if (Date.now() > session.expires) {
                localStorage.removeItem(SESSION_KEY);
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Logout - clear session
     */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'index.html';
    }

    /**
     * Handle login form submission
     */
    function handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');
        
        if (validateCredentials(username, password)) {
            createSession();
            window.location.href = 'dashboard.html';
        } else {
            errorEl.textContent = 'Invalid username or password';
            errorEl.classList.add('show');
            
            // Clear error after 3 seconds
            setTimeout(() => {
                errorEl.classList.remove('show');
            }, 3000);
        }
    }

    /**
     * Get announcements from localStorage
     */
    function getAnnouncements() {
        try {
            const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading announcements:', e);
            return [];
        }
    }

    /**
     * Save announcements to localStorage
     */
    function saveAnnouncements(announcements) {
        localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    }

    /**
     * Generate unique ID for announcements
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Format date for display
     */
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }

    /**
     * Add a new announcement
     */
    function addAnnouncement(content, author) {
        const announcements = getAnnouncements();
        const newAnnouncement = {
            id: generateId(),
            content: content.trim(),
            author: author.trim() || 'Admin',
            timestamp: Date.now()
        };
        
        announcements.unshift(newAnnouncement); // Add to beginning
        saveAnnouncements(announcements);
        return newAnnouncement;
    }

    /**
     * Update an announcement
     */
    function updateAnnouncement(id, newContent) {
        const announcements = getAnnouncements();
        const index = announcements.findIndex(a => a.id === id);
        
        if (index !== -1) {
            announcements[index].content = newContent.trim();
            announcements[index].editedAt = Date.now();
            saveAnnouncements(announcements);
            return true;
        }
        return false;
    }

    /**
     * Delete an announcement
     */
    function deleteAnnouncement(id) {
        const announcements = getAnnouncements();
        const filtered = announcements.filter(a => a.id !== id);
        
        if (filtered.length !== announcements.length) {
            saveAnnouncements(filtered);
            return true;
        }
        return false;
    }

    /**
     * Render announcements list in admin panel
     */
    function renderAnnouncementsList() {
        const container = document.getElementById('announcements-list');
        if (!container) return;

        const announcements = getAnnouncements();
        
        if (announcements.length === 0) {
            container.innerHTML = '<div class="empty-state">No announcements yet. Create your first one above!</div>';
            return;
        }

        container.innerHTML = announcements.map(announcement => `
            <div class="admin-announcement-item" data-id="${announcement.id}">
                <div class="announcement-item-header">
                    <span class="announcement-timestamp">${formatDate(announcement.timestamp)}${announcement.editedAt ? ' (edited)' : ''}</span>
                    <span class="announcement-author">${escapeHtml(announcement.author)}</span>
                </div>
                <div class="announcement-item-content">${escapeHtml(announcement.content)}</div>
                <div class="announcement-item-actions">
                    <button class="edit-btn" onclick="CxNAdmin.editAnnouncement('${announcement.id}')">Edit</button>
                    <button class="delete-btn" onclick="CxNAdmin.deleteAnnouncement('${announcement.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show edit mode for an announcement
     */
    function editAnnouncementUI(id) {
        const announcements = getAnnouncements();
        const announcement = announcements.find(a => a.id === id);
        if (!announcement) return;

        const itemEl = document.querySelector(`.admin-announcement-item[data-id="${id}"]`);
        if (!itemEl) return;

        itemEl.classList.add('editing');
        
        const contentEl = itemEl.querySelector('.announcement-item-content');
        const actionsEl = itemEl.querySelector('.announcement-item-actions');
        
        contentEl.innerHTML = `<textarea class="edit-textarea" id="edit-${id}">${escapeHtml(announcement.content)}</textarea>`;
        actionsEl.innerHTML = `
            <button class="save-btn" onclick="CxNAdmin.saveEdit('${id}')">Save</button>
            <button class="cancel-btn" onclick="CxNAdmin.cancelEdit()">Cancel</button>
        `;
        
        document.getElementById(`edit-${id}`).focus();
    }

    /**
     * Save edit
     */
    function saveEdit(id) {
        const textarea = document.getElementById(`edit-${id}`);
        if (!textarea) return;

        const newContent = textarea.value.trim();
        if (!newContent) {
            showStatus('Announcement cannot be empty', 'error');
            return;
        }

        if (updateAnnouncement(id, newContent)) {
            showStatus('Announcement updated successfully!', 'success');
            renderAnnouncementsList();
        } else {
            showStatus('Failed to update announcement', 'error');
        }
    }

    /**
     * Cancel edit - re-render list
     */
    function cancelEdit() {
        renderAnnouncementsList();
    }

    /**
     * Confirm and delete announcement
     */
    function confirmDelete(id) {
        if (confirm('Are you sure you want to delete this announcement?')) {
            if (deleteAnnouncement(id)) {
                showStatus('Announcement deleted', 'success');
                renderAnnouncementsList();
            } else {
                showStatus('Failed to delete announcement', 'error');
            }
        }
    }

    /**
     * Show status message
     */
    function showStatus(message, type) {
        const statusEl = document.getElementById('status-message');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `status-message show ${type}`;
        
        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 3000);
    }

    /**
     * Handle new announcement form submission
     */
    function handleNewAnnouncement(event) {
        event.preventDefault();
        
        const contentEl = document.getElementById('announcement-content');
        const authorEl = document.getElementById('announcement-author');
        
        const content = contentEl.value.trim();
        const author = authorEl.value.trim() || 'Admin';
        
        if (!content) {
            showStatus('Please enter announcement content', 'error');
            return;
        }

        addAnnouncement(content, author);
        showStatus('Announcement posted successfully!', 'success');
        
        contentEl.value = '';
        renderAnnouncementsList();
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Initialize login page
     */
    function initLoginPage() {
        // If already authenticated, redirect to dashboard
        if (isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return;
        }

        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', handleLogin);
        }
    }

    /**
     * Initialize generic admin page (dashboard, etc.)
     */
    function initAdminPage() {
        // Check authentication
        if (!isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        // Setup logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    }

    /**
     * Initialize announcements admin page
     */
    function initAnnouncementsPage() {
        // Check authentication
        if (!isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        // Setup logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // Setup new announcement form
        const form = document.getElementById('new-announcement-form');
        if (form) {
            form.addEventListener('submit', handleNewAnnouncement);
        }

        // Load and render announcements
        renderAnnouncementsList();
    }

    // ==========================================
    // CLAN STATS MANAGEMENT
    // ==========================================

    /**
     * Format number with commas
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Parse number from string (remove commas)
     */
    function parseNumber(str) {
        return parseInt(str.replace(/,/g, ''), 10) || 0;
    }

    /**
     * Get clan stats from localStorage
     */
    function getStats() {
        try {
            const data = localStorage.getItem(STATS_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading stats:', e);
            return null;
        }
    }

    /**
     * Save clan stats to localStorage
     */
    function saveStats(stats) {
        stats.lastUpdated = Date.now();
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }

    /**
     * Load stats from JSON file (fallback/initial data)
     */
    async function loadStatsFromFile() {
        try {
            const response = await fetch('../data/clan_stats.json');
            if (!response.ok) throw new Error('Failed to load');
            return await response.json();
        } catch (e) {
            console.error('Error loading stats file:', e);
            return { might: 0, wealth: 0 };
        }
    }

    /**
     * Handle stats form submission
     */
    function handleStatsSubmit(event) {
        event.preventDefault();

        const mightInput = document.getElementById('stat-might');
        const wealthInput = document.getElementById('stat-wealth');

        const stats = getStats() || { might: 0, wealth: 0 };

        // Only update if value is provided
        if (mightInput.value.trim()) {
            stats.might = parseNumber(mightInput.value);
        }
        if (wealthInput.value.trim()) {
            stats.wealth = parseNumber(wealthInput.value);
        }

        saveStats(stats);
        showStatus('Clan stats updated successfully!', 'success');

        // Update displayed current values
        document.getElementById('current-might').textContent = formatNumber(stats.might);
        document.getElementById('current-wealth').textContent = formatNumber(stats.wealth);

        // Clear inputs
        mightInput.value = '';
        wealthInput.value = '';
    }

    /**
     * Initialize About admin page
     */
    async function initAboutPage() {
        // Check authentication
        if (!isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        // Setup logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // Load current stats
        let stats = getStats();
        if (!stats) {
            stats = await loadStatsFromFile();
            if (stats) {
                localStorage.setItem(STATS_KEY, JSON.stringify(stats));
            }
        }

        // Display current values
        const currentMight = document.getElementById('current-might');
        const currentWealth = document.getElementById('current-wealth');

        if (currentMight && stats) {
            currentMight.textContent = formatNumber(stats.might);
        }
        if (currentWealth && stats) {
            currentWealth.textContent = formatNumber(stats.wealth);
        }

        // Setup form
        const form = document.getElementById('stats-form');
        if (form) {
            form.addEventListener('submit', handleStatsSubmit);
        }
    }

    /**
     * Get all announcements for public display (sorted by date descending)
     */
    function getPublicAnnouncements() {
        const announcements = getAnnouncements();
        // Already stored in descending order, but ensure sorting
        return announcements.sort((a, b) => b.timestamp - a.timestamp);
    }

    // ==========================================
    // CLAN MEMBERS MANAGEMENT
    // ==========================================

    /**
     * Get clan members from localStorage
     */
    function getMembers() {
        try {
            const data = localStorage.getItem(MEMBERS_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading members:', e);
            return null;
        }
    }

    /**
     * Save clan members to localStorage
     */
    function saveMembers(members) {
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    }

    /**
     * Load members from JSON file (fallback/initial data)
     */
    async function loadMembersFromFile() {
        try {
            const response = await fetch('../data/clan_members.json');
            if (!response.ok) throw new Error('Failed to load');
            return await response.json();
        } catch (e) {
            console.error('Error loading members file:', e);
            return {
                leader: [],
                superiors: [],
                officers: [],
                veterans: [],
                soldiers: []
            };
        }
    }

    /**
     * Generate unique ID for members
     */
    function generateMemberId() {
        return 'm_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Add a new member
     */
    function addMember(name, rank, badges) {
        const members = getMembers();
        if (!members || !members[rank]) return false;

        const newMember = {
            id: generateMemberId(),
            name: name.trim(),
            badges: badges
        };

        members[rank].push(newMember);
        saveMembers(members);
        return true;
    }

    /**
     * Update a member
     */
    function updateMember(memberId, originalRank, newName, newRank, newBadges) {
        const members = getMembers();
        if (!members) return false;

        // Find and remove from original rank
        const memberIndex = members[originalRank].findIndex(m => m.id === memberId);
        if (memberIndex === -1) return false;

        const member = members[originalRank][memberIndex];
        member.name = newName.trim();
        member.badges = newBadges;

        // If rank changed, move to new rank
        if (originalRank !== newRank) {
            members[originalRank].splice(memberIndex, 1);
            members[newRank].push(member);
        }

        saveMembers(members);
        return true;
    }

    /**
     * Delete a member
     */
    function deleteMember(memberId, rank) {
        const members = getMembers();
        if (!members || !members[rank]) return false;

        const index = members[rank].findIndex(m => m.id === memberId);
        if (index === -1) return false;

        members[rank].splice(index, 1);
        saveMembers(members);
        return true;
    }

    /**
     * Remove a badge from a member
     */
    function removeBadgeFromMember(memberId, rank, badgeIndex) {
        const members = getMembers();
        if (!members || !members[rank]) return false;

        const member = members[rank].find(m => m.id === memberId);
        if (!member || !member.badges) return false;

        member.badges.splice(badgeIndex, 1);
        saveMembers(members);
        return true;
    }

    /**
     * Render members list in admin panel
     */
    function renderMembersList(filterRank = 'all', searchTerm = '') {
        const container = document.getElementById('members-container');
        if (!container) return;

        const members = getMembers();
        if (!members) {
            container.innerHTML = '<div class="loading-state">No members data available.</div>';
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        let html = '';

        RANK_ORDER.forEach(rank => {
            // Skip if filtering by rank and doesn't match
            if (filterRank !== 'all' && filterRank !== rank) return;

            let rankMembers = members[rank] || [];

            // Filter by search term
            if (searchTerm) {
                rankMembers = rankMembers.filter(m => 
                    m.name.toLowerCase().includes(searchLower) ||
                    (m.badges && m.badges.some(b => b.toLowerCase().includes(searchLower)))
                );
            }

            // Skip empty groups when searching
            if (searchTerm && rankMembers.length === 0) return;

            html += `
                <div class="rank-group" data-rank="${rank}">
                    <div class="rank-group-header">
                        <h4 class="rank-group-title ${rank}">${RANK_NAMES[rank]}</h4>
                        <span class="rank-group-count">${rankMembers.length} member${rankMembers.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="rank-group-members">
            `;

            if (rankMembers.length === 0) {
                html += `<div class="rank-group-empty">No members in this rank</div>`;
            } else {
                rankMembers.forEach(member => {
                    const badgesHtml = member.badges && member.badges.length > 0
                        ? member.badges.map((badge, idx) => `
                            <span class="member-badge">
                                <span class="badge-star">★</span>
                                ${escapeHtml(badge)}
                                <span class="remove-badge" onclick="CxNAdmin.removeBadge('${member.id}', '${rank}', ${idx})" title="Remove badge">×</span>
                            </span>
                        `).join('')
                        : '';

                    html += `
                        <div class="member-admin-item" data-id="${member.id}" data-rank="${rank}">
                            <div class="member-admin-info">
                                <span class="member-admin-name">${escapeHtml(member.name)}</span>
                                ${badgesHtml ? `<div class="member-admin-badges">${badgesHtml}</div>` : ''}
                            </div>
                            <div class="member-admin-actions">
                                <button class="edit-btn" onclick="CxNAdmin.editMember('${member.id}', '${rank}')">Edit</button>
                                <button class="delete-btn" onclick="CxNAdmin.confirmDeleteMember('${member.id}', '${rank}')">Delete</button>
                            </div>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;
        });

        if (!html) {
            html = '<div class="loading-state">No members found matching your search.</div>';
        }

        container.innerHTML = html;
    }

    /**
     * Handle add member form submission
     */
    function handleAddMember(event) {
        event.preventDefault();

        const nameEl = document.getElementById('member-name');
        const rankEl = document.getElementById('member-rank');
        const badgesEl = document.getElementById('member-badges');

        const name = nameEl.value.trim();
        const rank = rankEl.value;
        const badgesStr = badgesEl.value.trim();
        const badges = badgesStr ? badgesStr.split(',').map(b => b.trim()).filter(b => b) : [];

        if (!name) {
            showStatus('Please enter a member name', 'error');
            return;
        }

        if (addMember(name, rank, badges)) {
            showStatus(`${name} added to ${RANK_NAMES[rank]}!`, 'success');
            nameEl.value = '';
            badgesEl.value = '';
            renderMembersList(
                document.getElementById('rank-filter').value,
                document.getElementById('member-search').value
            );
        } else {
            showStatus('Failed to add member', 'error');
        }
    }

    /**
     * Open edit member modal
     */
    function editMemberUI(memberId, rank) {
        const members = getMembers();
        if (!members || !members[rank]) return;

        const member = members[rank].find(m => m.id === memberId);
        if (!member) return;

        document.getElementById('edit-member-id').value = memberId;
        document.getElementById('edit-member-original-rank').value = rank;
        document.getElementById('edit-member-name').value = member.name;
        document.getElementById('edit-member-rank').value = rank;
        document.getElementById('edit-member-badges').value = member.badges ? member.badges.join(', ') : '';

        document.getElementById('edit-member-modal').style.display = 'flex';
    }

    /**
     * Close edit member modal
     */
    function closeEditModal() {
        document.getElementById('edit-member-modal').style.display = 'none';
    }

    /**
     * Handle edit member form submission
     */
    function handleEditMember(event) {
        event.preventDefault();

        const memberId = document.getElementById('edit-member-id').value;
        const originalRank = document.getElementById('edit-member-original-rank').value;
        const newName = document.getElementById('edit-member-name').value.trim();
        const newRank = document.getElementById('edit-member-rank').value;
        const badgesStr = document.getElementById('edit-member-badges').value.trim();
        const newBadges = badgesStr ? badgesStr.split(',').map(b => b.trim()).filter(b => b) : [];

        if (!newName) {
            showStatus('Please enter a member name', 'error');
            return;
        }

        if (updateMember(memberId, originalRank, newName, newRank, newBadges)) {
            showStatus('Member updated successfully!', 'success');
            closeEditModal();
            renderMembersList(
                document.getElementById('rank-filter').value,
                document.getElementById('member-search').value
            );
        } else {
            showStatus('Failed to update member', 'error');
        }
    }

    /**
     * Confirm and delete member
     */
    function confirmDeleteMember(memberId, rank) {
        const members = getMembers();
        if (!members || !members[rank]) return;

        const member = members[rank].find(m => m.id === memberId);
        if (!member) return;

        if (confirm(`Are you sure you want to remove ${member.name} from the clan?`)) {
            if (deleteMember(memberId, rank)) {
                showStatus(`${member.name} has been removed`, 'success');
                renderMembersList(
                    document.getElementById('rank-filter').value,
                    document.getElementById('member-search').value
                );
            } else {
                showStatus('Failed to delete member', 'error');
            }
        }
    }

    /**
     * Remove a badge from a member (auto-save)
     */
    function removeBadge(memberId, rank, badgeIndex) {
        if (removeBadgeFromMember(memberId, rank, badgeIndex)) {
            showStatus('Badge removed', 'success');
            renderMembersList(
                document.getElementById('rank-filter').value,
                document.getElementById('member-search').value
            );
        } else {
            showStatus('Failed to remove badge', 'error');
        }
    }

    /**
     * Initialize Members admin page
     */
    async function initMembersPage() {
        // Check authentication
        if (!isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        // Setup logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // Load members data
        let members = getMembers();
        if (!members) {
            members = await loadMembersFromFile();
            // Ensure all members have IDs
            RANK_ORDER.forEach(rank => {
                if (members[rank]) {
                    members[rank] = members[rank].map(m => ({
                        id: m.id || generateMemberId(),
                        name: m.name,
                        badges: m.badges || []
                    }));
                }
            });
            saveMembers(members);
        }

        // Render members list
        renderMembersList();

        // Setup add member form
        const addForm = document.getElementById('add-member-form');
        if (addForm) {
            addForm.addEventListener('submit', handleAddMember);
        }

        // Setup edit member form
        const editForm = document.getElementById('edit-member-form');
        if (editForm) {
            editForm.addEventListener('submit', handleEditMember);
        }

        // Setup search and filter
        const searchInput = document.getElementById('member-search');
        const rankFilter = document.getElementById('rank-filter');

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                renderMembersList(rankFilter.value, searchInput.value);
            });
        }

        if (rankFilter) {
            rankFilter.addEventListener('change', () => {
                renderMembersList(rankFilter.value, searchInput.value);
            });
        }

        // Close modal on outside click
        const modal = document.getElementById('edit-member-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeEditModal();
                }
            });
        }
    }

    // Expose public API
    window.CxNAdmin = {
        initLoginPage: initLoginPage,
        initAdminPage: initAdminPage,
        initAnnouncementsPage: initAnnouncementsPage,
        initAboutPage: initAboutPage,
        initMembersPage: initMembersPage,
        isAuthenticated: isAuthenticated,
        logout: logout,
        editAnnouncement: editAnnouncementUI,
        deleteAnnouncement: confirmDelete,
        saveEdit: saveEdit,
        cancelEdit: cancelEdit,
        getPublicAnnouncements: getPublicAnnouncements,
        formatDate: formatDate,
        formatNumber: formatNumber,
        escapeHtml: escapeHtml,
        // Members management
        editMember: editMemberUI,
        confirmDeleteMember: confirmDeleteMember,
        closeEditModal: closeEditModal,
        removeBadge: removeBadge,
        getMembers: getMembers
    };
})();
