// Test script to diagnose discover and upload issues
console.log('🔧 Testing College Dating App Functionality...\n');
// Test 1: Check if environment variables are set
console.log('1. 📋 Environment Check:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
// Test 2: Check file system
const fs = require('fs');
const path = require('path');
console.log('\n2. 📁 File System Check:');
const criticalPaths = [
    './routes/match.js',
    './routes/profile.js', 
    './models/User.js',
    './uploads/profiles',
    './campuscrush-dashboard.js',
    './dashboard.html'
];
criticalPaths.forEach(filePath => {
    const exists = fs.existsSync(filePath);
    console.log(`   ${filePath}: ${exists ? '✅' : '❌'}`);
});
// Test 3: Check MongoDB connection
console.log('\n3. 🗄️  Database Connection Test:');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yatharth10a:yatharth21@yathsdatabase.7fir4sd.mongodb.net/collegedating?retryWrites=true&w=majority&appName=YATHSDATABASE';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log('   ✅ MongoDB connection successful');
    // Test 4: Check User model
    console.log('\n4. 👤 User Model Test:');
    const User = require('./models/User');
    User.countDocuments({}).then(count => {
        console.log(`   ✅ Users in database: ${count}`);
        User.countDocuments({ isProfileComplete: true }).then(completeCount => {
            console.log(`   ✅ Complete profiles: ${completeCount}`);
            User.countDocuments({ isActive: true }).then(activeCount => {
                console.log(`   ✅ Active users: ${activeCount}`);
                console.log('\n5. 🔍 Discovery Test:');
                // Test discovery query
                User.find({
                    isProfileComplete: true,
                    isActive: true
                }).limit(5).then(users => {
                    console.log(`   ✅ Users available for discovery: ${users.length}`);
                    if (users.length > 0) {
                        console.log(`   📋 Sample user: ${users[0].name} (${users[0].profile?.college || 'No college'})`);
                    }
                    process.exit(0);
                }).catch(err => {
                    console.log(`   ❌ Discovery query failed: ${err.message}`);
                    process.exit(1);
                });
            });
        });
    }).catch(err => {
        console.log(`   ❌ User count failed: ${err.message}`);
        process.exit(1);
    });
}).catch(err => {
    console.log(`   ❌ MongoDB connection failed: ${err.message}`);
    console.log('   💡 Check your internet connection and MongoDB Atlas settings');
    process.exit(1);
});
// Cleanup after 10 seconds
setTimeout(() => {
    console.log('\n⏰ Test timeout - check your database connection');
    process.exit(1);
}, 10000);
