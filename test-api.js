const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
let JWT_TOKEN = null;
console.log('🔧 Testing API Endpoints...\n');
// Test 0: Login to get valid JWT token
async function loginAndGetToken() {
    console.log('0. 🔑 Authentication Test:');
    try {
        // First try to register a test user
        const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: 'Test User',
                email: 'testuser@college.edu',
                password: 'testpassword123',
                dateOfBirth: '2000-01-01',
                gender: 'Other',
                college: 'Test College'
            })
        });
        // If registration fails (user might already exist), try to login
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'testuser@college.edu',
                password: 'testpassword123'
            })
        });
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            JWT_TOKEN = loginData.token;
            console.log('   ✅ Authentication successful, token obtained');
            return true;
        } else {
            console.error('   ❌ Authentication failed:', loginResponse.status);
            return false;
        }
    } catch (error) {
        console.error('   ❌ Authentication Error:', error.message);
        return false;
    }
}
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
    const authSuccess = await loginAndGetToken();
    if (authSuccess) {
        await testDiscoverAPI();
        await testUploadProfilePhotoAPI();
    } else {
        console.log('❌ Skipping API tests due to authentication failure');
    }
})();
