// Simple debug script for discovery issues
console.log('🔧 Simple Debug Script Loaded');
async function quickDebug() {
    console.log('🚀 Starting Quick Debug...');
    // Get token
    const token = localStorage.getItem('collegedatingbyyt_token');
    const token = localStorage.getItem('campuscrush_token');
    console.log('🔑 Token:', token ? 'EXISTS' : 'MISSING');
    if (!token) {
        console.error('❌ No token found!');
        return;
    }
    // Test database stats
    try {
        console.log('📊 Testing database stats...');
        const statsResponse = await fetch('/api/match/debug/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log('📊 Database Stats:', stats);
        } else {
            console.error('❌ Stats failed:', statsResponse.status, await statsResponse.text());
        }
    } catch (error) {
        console.error('❌ Stats error:', error);
    }
    // Test discovery
    try {
        console.log('🔍 Testing discovery...');
        const response = await fetch('/api/match/discover', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Discovery Success!');
            console.log('Users found:', data.users ? data.users.length : 0);
            console.log('Debug info:', data.debug);
            // Try to show in UI
            const container = document.getElementById('discoverContainer');
            if (container && data.users && data.users.length > 0) {
                container.innerHTML = `
                    <h3>Debug: Found ${data.users.length} users!</h3>
                    ${data.users.slice(0, 3).map(user => `
                        <div style="border: 1px solid #ddd; padding: 10px; margin: 10px; border-radius: 5px;">
                            <strong>${user.name}</strong><br>
                            Age: ${user.profile?.age || 'N/A'}<br>
                            College: ${user.profile?.college || 'N/A'}<br>
                            Major: ${user.profile?.major || 'N/A'}
                        </div>
                    `).join('')}
                `;
                console.log('✅ Updated UI with users!');
            }
        } else {
            console.error('❌ Discovery failed:', response.status, await response.text());
        }
    } catch (error) {
        console.error('❌ Discovery error:', error);
    }
}
// Add a simple debug button
const debugBtn = document.createElement('button');
debugBtn.textContent = '🔧 Quick Debug';
debugBtn.style.cssText = 'position: fixed; top: 50px; right: 10px; z-index: 9999; padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;';
debugBtn.onclick = quickDebug;
document.body.appendChild(debugBtn);
console.log('✅ Quick debug ready! Click the blue button or run quickDebug()');
window.quickDebug = quickDebug;
