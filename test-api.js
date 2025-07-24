const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const JWT_TOKEN = process.env.JWT_SECRET || 'test-token';

console.log('🔧 Testing API Endpoints...\n');

// Test 1: Discover API
async function testDiscoverAPI() {
    console.log('1. 🔍 Discover API Test:');
    try {
        const response = await fetch(`${BASE_URL}/api/match/discover`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${JWT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('   ✅ Discover API Response:', data);
    } catch (error) {
        console.error('   ❌ Discover API Error:', error.message);
    }
}

// Test 2: Upload Profile Photo API
async function testUploadProfilePhotoAPI() {
    console.log('\n2. 📸 Upload Profile Photo API Test:');
    try {
        const formData = new FormData();
        formData.append('profilePicture', new Blob(['test-image'], { type: 'image/png' }), 'test.png');

        const response = await fetch(`${BASE_URL}/api/profile/me/upload-photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${JWT_TOKEN}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('   ✅ Upload Profile Photo API Response:', data);
    } catch (error) {
        console.error('   ❌ Upload Profile Photo API Error:', error.message);
    }
}

// Run tests
(async () => {
    await testDiscoverAPI();
    await testUploadProfilePhotoAPI();
})();
