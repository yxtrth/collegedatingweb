const mongoose = require('mongoose');
const User = require('./models/User');
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/collegedatingweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
async function checkUsersFixed() {
    try {
        console.log('🔍 Checking users in database...\n');
        // Get total count
        const totalUsers = await User.countDocuments();
        console.log(`📊 Total users in database: ${totalUsers}`);
        if (totalUsers === 0) {
            console.log('❌ No users found. The script might still be running.');
            mongoose.connection.close();
            return;
        }
        // Get sample users with correct structure
        console.log('👥 Sample users:');
        const sampleUsers = await User.find({})
            .limit(5)
            .select('name email profile isProfileComplete')
            .lean();
        sampleUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   📧 ${user.email}`);
            if (user.profile) {
                console.log(`   🎓 ${user.profile.major || 'No major'} - ${user.profile.year || 'No year'} at ${user.profile.college || 'No college'}`);
                console.log(`   👤 Age: ${user.profile.age || 'Not set'}`);
                console.log(`   ✅ Profile Complete: ${user.isProfileComplete ? 'Yes' : 'No'}`);
            }
            console.log('');
        });
        // Test discovery functionality
        console.log('🔍 Testing discovery functionality...');
        const discoveryUsers = await User.find({ isProfileComplete: true })
            .limit(5)
            .select('name profile.age profile.college profile.major profile.profilePicture profile.bio')
            .lean();
        console.log(`✅ Discovery test: Found ${discoveryUsers.length} complete profiles ready for discovery!`);
        mongoose.connection.close();
        console.log('\n🎉 Database check complete! Discovery feature is ready.');
    } catch (error) {
        console.error('❌ Error:', error);
        mongoose.connection.close();
    }
}
checkUsersFixed();
