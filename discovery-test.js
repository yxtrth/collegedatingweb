// Simple test to bypass discovery issues
console.log('🧪 Discovery Debug Script Loaded');
// Add a test button to the page
function addDiscoveryTestButton() {
    const testButton = document.createElement('button');
    testButton.innerHTML = '🧪 Force Load Discovery';
    testButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
    `;
    testButton.onclick = async function() {
        console.log('🚀 Forcing discovery load...');
        const container = document.getElementById('discoverContainer');
        if (!container) {
            alert('discoverContainer not found!');
            return;
        }
        // Show test users directly
        container.innerHTML = `
            <div class="profile-section">
                <h2>🧪 Test Discovery Mode</h2>
                <p>Bypassing all checks - showing test users</p>
                <div class="discovery-interface">
                    <div class="discover-card-container">
                        <div class="discover-card">
                            <div class="discovery-photo">
                                <img src="https://picsum.photos/400/600?random=1" alt="Test User">
                            </div>
                            <div class="discovery-info-overlay">
                                <div class="discovery-main-info">
                                    <h2>Test User, 22</h2>
                                    <div class="discovery-college">Computer Science at Test University</div>
                                    <div class="discovery-bio">This is a test user to verify discovery is working!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="discover-actions">
                        <button class="action-btn dislike-btn" onclick="alert('Dislike clicked!')">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="action-btn like-btn" onclick="alert('Like clicked!')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        console.log('✅ Test discovery content loaded');
    };
    document.body.appendChild(testButton);
}
// Load the test button when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDiscoveryTestButton);
} else {
    addDiscoveryTestButton();
}
