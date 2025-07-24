const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://yatharth10a:yatharth21@yathsdatabase.7fir4sd.mongodb.net/collegedating?retryWrites=true&w=majority&appName=YATHSDATABASE';

console.log('🔗 Testing MongoDB Atlas connection...');
console.log('📍 Database: collegedating');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 8000
});

mongoose.connection.on('connected', () => {
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    console.log('🎉 Your IP whitelist is working correctly');
    console.log('🔐 Authentication successful');
    process.exit(0);
});

mongoose.connection.on('error', (err) => {
    console.log('❌ FAILED: MongoDB connection error');
    console.log('📝 Error details:', err.message);
    if (err.message.includes('authentication failed')) {
        console.log('💡 Check your username and password');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('querySrv')) {
        console.log('💡 Check your connection string and network');
    }
    process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.log('⏰ Connection test timed out');
    console.log('💡 This might indicate network or firewall issues');
    process.exit(1);
}, 10000);
