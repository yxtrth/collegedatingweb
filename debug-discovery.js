// Comprehensive Discovery Debug Script
console.log('🔍 DISCOVERY DEBUG SCRIPT LOADED');

// Override the original loadDiscoverUsers function with extensive debugging
if (window.app) {
    const originalLoadDiscoverUsers = window.app.loadDiscoverUsers;
    
    window.app.loadDiscoverUsers = async function() {
        console.log('🚀 DEBUG: loadDiscoverUsers called');
        console.log('🔑 Token:', this.token ? 'EXISTS' : 'MISSING');
        console.log('🌐 Base URL:', this.baseURL);
        console.log('👤 Current User:', this.currentUser);
        console.log('📊 Profile Completion:', this.profileCompletion);
        
        const container = document.getElementById('discoverContainer');
        console.log('📦 Container:', container ? 'FOUND' : 'NOT FOUND');
        
        if (!container) {
            console.error('❌ discoverContainer element not found in DOM!');
            return;
        }

        try {
            // Show debug loading state
            container.innerHTML = `
                <div class="loading" style="text-align: center; padding: 2rem;">
                    <h3>🔍 DEBUG MODE: Loading Discovery...</h3>
                    <p>Check console for detailed logs</p>
                </div>
            `;
            
            console.log('📡 Making API call to /match/discover...');
            
            // Test API call with detailed logging
            const url = `${this.baseURL}/match/discover`;
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            };
            
            console.log('📤 Request URL:', url);
            console.log('📤 Request Headers:', headers);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            
            console.log('📥 Response Status:', response.status);
            console.log('📥 Response OK:', response.ok);
            
            const responseText = await response.text();
            console.log('📥 Raw Response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('📥 Parsed Data:', data);
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError);
                throw new Error('Invalid JSON response: ' + responseText);
            }
            
            if (!response.ok) {
                console.error('❌ API Error:', data.message);
                throw new Error(data.message || 'API request failed');
            }
            
            const users = data.users || data;
            console.log('👥 Users extracted:', users);
            console.log('👥 User count:', users ? users.length : 'N/A');
            
            if (users && users.length > 0) {
                console.log('👤 Sample user:', users[0]);
            }
            
            if (!users || users.length === 0) {
                console.log('⚠️ No users found - showing empty state');
                container.innerHTML = `
                    <div class="profile-section">
                        <div class="empty-state" style="text-align: center; padding: 3rem;">
                            <h3>🔍 DEBUG: No Users Found</h3>
                            <p>API returned ${users ? users.length : 0} users</p>
                            <p>This could mean:</p>
                            <ul style="text-align: left; display: inline-block;">
                                <li>No users in database</li>
                                <li>All users already liked/disliked</li>
                                <li>Database query issue</li>
                            </ul>
                            <button class="btn btn-primary" onclick="app.loadDiscoverUsers()">🔄 Try Again</button>
                            <button class="btn btn-outline" onclick="debugDB()">🔍 Debug Database</button>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Show success with user cards
            console.log('✅ SUCCESS: Creating discovery interface with users');
            this.createDiscoveryInterface(container, users);
            
        } catch (error) {
            console.error('❌ DISCOVERY ERROR:', error);
            console.error('❌ Error Stack:', error.stack);
            
            container.innerHTML = `
                <div class="profile-section">
                    <div class="error-state" style="text-align: center; padding: 3rem; background: #fee; border: 1px solid #fcc; border-radius: 8px;">
                        <h3>🚨 DEBUG: Discovery Error</h3>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p><strong>Token:</strong> ${this.token ? 'Present' : 'Missing'}</p>
                        <p><strong>URL:</strong> ${this.baseURL}/match/discover</p>
                        <details style="margin: 1rem 0; text-align: left;">
                            <summary>Full Error Details</summary>
                            <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto;">${error.stack || error.toString()}</pre>
                        </details>
                        <button class="btn btn-primary" onclick="app.loadDiscoverUsers()">🔄 Try Again</button>
                        <button class="btn btn-outline" onclick="debugAuth()">🔐 Debug Auth</button>
                    </div>
                </div>
            `;
        }
    };
    
    console.log('✅ Discovery function overridden with debug version');
} else {
    console.log('⚠️ window.app not found yet - will try again when ready');
}

// Debug helper functions
window.debugDB = async function() {
    console.log('🔍 DEBUGGING DATABASE...');
    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
<<<<<<< HEAD
                'Authorization': `Bearer ${localStorage.getItem('collegedatingbyyt_token')}`
=======
                'Authorization': `Bearer ${localStorage.getItem('campuscrush_token')}`
>>>>>>> be720c18b57db286f2aa3c87e5bea68f6d38e92b
            }
        });
        const data = await response.json();
        console.log('👤 Current user:', data);
        
        // Test user count endpoint if it exists
        // You might need to create this endpoint for debugging
        
    } catch (error) {
        console.error('❌ Database debug error:', error);
    }
};

window.debugAuth = function() {
    console.log('🔐 DEBUGGING AUTHENTICATION...');
<<<<<<< HEAD
    console.log('Token from localStorage:', localStorage.getItem('collegedatingbyyt_token'));
=======
    console.log('Token from localStorage:', localStorage.getItem('campuscrush_token'));
>>>>>>> be720c18b57db286f2aa3c87e5bea68f6d38e92b
    console.log('App token:', window.app ? window.app.token : 'App not loaded');
    console.log('Current user:', window.app ? window.app.currentUser : 'App not loaded');
    
    // Try to re-authenticate
<<<<<<< HEAD
    if (localStorage.getItem('collegedatingbyyt_token')) {
=======
    if (localStorage.getItem('campuscrush_token')) {
>>>>>>> be720c18b57db286f2aa3c87e5bea68f6d38e92b
        console.log('Token exists, trying to fetch user info...');
        if (window.app) {
            window.app.loadUserProfile();
        }
    } else {
        console.log('No token found - user needs to log in');
        alert('No authentication token found. Please log in again.');
        window.location.href = 'index.html';
    }
};

// Add debug buttons to the page
function addDebugButtons() {
    const debugPanel = document.createElement('div');
    debugPanel.innerHTML = `
        <div style="position: fixed; top: 10px; right: 10px; z-index: 9999; background: #333; color: white; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 12px;">
            <div style="margin-bottom: 8px; font-weight: bold;">🐛 DISCOVERY DEBUG</div>
            <button onclick="app.loadDiscoverUsers()" style="display: block; width: 100%; margin: 4px 0; padding: 4px 8px; font-size: 10px;">🔄 Test Discovery</button>
            <button onclick="debugAuth()" style="display: block; width: 100%; margin: 4px 0; padding: 4px 8px; font-size: 10px;">🔐 Debug Auth</button>
            <button onclick="debugDB()" style="display: block; width: 100%; margin: 4px 0; padding: 4px 8px; font-size: 10px;">🔍 Debug DB</button>
            <button onclick="console.clear()" style="display: block; width: 100%; margin: 4px 0; padding: 4px 8px; font-size: 10px;">🗑️ Clear Console</button>
        </div>
    `;
    document.body.appendChild(debugPanel);
}

// Initialize debug panel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDebugButtons);
} else {
    addDebugButtons();
}

console.log('🎯 Debug script setup complete. Look for the debug panel in top-right corner.');
