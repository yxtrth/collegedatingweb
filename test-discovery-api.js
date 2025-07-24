// Test the discovery endpoint directly
const fetch = require('node-fetch'); // You might need to install this: npm install node-fetch

async function testDiscoveryEndpoint() {
    try {
        console.log('🧪 Testing discovery endpoint...\n');
        
        // First, let's try to login with our test user
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@college.edu',
                password: 'password123'
            })
        });
        
        if (!loginResponse.ok) {
            console.log('❌ Login failed. Creating test user first...');
            console.log('Please run: node create-test-user.js');
            return;
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        console.log('✅ Login successful!');
        
        // Now test the discovery endpoint
        const discoveryResponse = await fetch('http://localhost:5000/api/match/discover', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!discoveryResponse.ok) {
            console.log('❌ Discovery endpoint failed:', discoveryResponse.status);
            const errorData = await discoveryResponse.text();
            console.log('Error:', errorData);
            return;
        }
        
        const discoveryData = await discoveryResponse.json();
        
        console.log('🎯 Discovery endpoint test results:');
        console.log(`   Found ${discoveryData.users?.length || 0} users for discovery`);
        console.log(`   Has more users: ${discoveryData.hasMore}`);
        
        if (discoveryData.users && discoveryData.users.length > 0) {
            console.log('\n👥 Sample discovered users:');
            discoveryData.users.slice(0, 3).forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.name}, ${user.profile?.age || 'No age'}`);
                console.log(`      🎓 ${user.profile?.major || 'No major'} at ${user.profile?.college || 'No college'}`);
                console.log(`      💭 "${user.profile?.bio || 'No bio'}"`);
            });
            
            console.log('\n🎉 SUCCESS! Discovery is working perfectly!');
            console.log('💡 Now you can:');
            console.log('   1. Go to http://localhost:5000');
            console.log('   2. Log in with test@college.edu / password123');
            console.log('   3. Click on "Discover" to see all the users!');
        } else {
            console.log('❌ No users found for discovery');
        }
        
    } catch (error) {
        console.error('❌ Error testing discovery endpoint:', error.message);
        console.log('\n🔧 Make sure:');
        console.log('   1. Server is running (node app.js)');
        console.log('   2. MongoDB is running');
        console.log('   3. Test user exists (node create-test-user.js)');
    }
}

// Simple fetch polyfill for Node.js if node-fetch is not available
if (typeof fetch === 'undefined') {
    global.fetch = async (url, options = {}) => {
        const https = require('https');
        const http = require('http');
        const urlLib = require('url');
        
        return new Promise((resolve, reject) => {
            const parsedUrl = urlLib.parse(url);
            const lib = parsedUrl.protocol === 'https:' ? https : http;
            
            const requestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.path,
                method: options.method || 'GET',
                headers: options.headers || {}
            };
            
            const req = lib.request(requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: () => Promise.resolve(JSON.parse(data)),
                        text: () => Promise.resolve(data)
                    });
                });
            });
            
            req.on('error', reject);
            
            if (options.body) {
                req.write(options.body);
            }
            req.end();
        });
    };
}

testDiscoveryEndpoint();
