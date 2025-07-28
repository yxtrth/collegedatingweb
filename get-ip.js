const https = require('https');
console.log('🔍 Getting your current IP address...\n');
https.get('https://ipinfo.io/json', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const ipInfo = JSON.parse(data);
            console.log('📍 Your Current IP Information:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🌐 IP Address: ${ipInfo.ip}`);
            console.log(`🏙️  City: ${ipInfo.city}`);
            console.log(`🗾 Region: ${ipInfo.region}`);
            console.log(`🏳️  Country: ${ipInfo.country}`);
            console.log(`🏢 ISP: ${ipInfo.org}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log('✅ STEPS TO FIX MONGODB ATLAS CONNECTION:');
            console.log('1. Go to https://cloud.mongodb.com/');
            console.log('2. Login to your MongoDB Atlas account');
            console.log('3. Select your project "YATHSDATABASE"');
            console.log('4. Click on "Network Access" in the left sidebar');
            console.log('5. Click "ADD IP ADDRESS" button');
            console.log(`6. Add this IP address: ${ipInfo.ip}`);
            console.log('7. Or click "ALLOW ACCESS FROM ANYWHERE" for testing (less secure)');
            console.log('8. Save and wait for the changes to take effect (1-2 minutes)');
            console.log('\n💡 Alternative: Add 0.0.0.0/0 to allow all IPs (for development only)');
        } catch (error) {
            console.error('❌ Error parsing IP information:', error);
        }
    });
}).on('error', (err) => {
    console.error('❌ Error getting IP address:', err.message);
    console.log('\n💡 You can manually check your IP at: https://whatismyipaddress.com/');
});
