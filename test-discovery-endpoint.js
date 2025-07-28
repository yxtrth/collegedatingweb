const mongoose = require('mongoose');
const User = require('./models/User');
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/collegedatingweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
async function testDiscovery() {
    try {
        console.log('🔍 Testing discovery functionality...\n');
        // Get total users
        const totalUsers = await User.countDocuments();
        console.log(`📊 Total users in database: ${totalUsers}`);
        // Get users with complete profiles
        const completeProfiles = await User.countDocuments({ isProfileComplete: true });
        console.log(`✅ Users with complete profiles: ${completeProfiles}`);
        // Get active users
        const activeUsers = await User.countDocuments({ isActive: true });
        console.log(`🟢 Active users: ${activeUsers}`);
        // Test discovery query (simulate what the API would do)
        const discoveryUsers = await User.find({
            isProfileComplete: true,
            isActive: true
        })
        .select('name profile.age profile.college profile.major profile.bio profile.profilePicture')
        .limit(10)
        .lean();
        console.log(`\n🎯 Discovery test results: Found ${discoveryUsers.length} users for discovery`);
        if (discoveryUsers.length > 0) {
            console.log('\n👥 Sample discovery users:');
            discoveryUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name}, ${user.profile?.age || 'No age'}`);
                console.log(`   🎓 ${user.profile?.major || 'No major'} at ${user.profile?.college || 'No college'}`);
                console.log(`   💭 "${user.profile?.bio || 'No bio'}"`);
                console.log(`   📸 Photo: ${user.profile?.profilePicture ? 'Yes' : 'No'}\n`);
            });
            console.log('✅ Discovery functionality is working! Users are ready to be discovered.');
        } else {
            console.log('❌ No users found for discovery. Checking issues...');
            // Check what's wrong
            const usersWithoutComplete = await User.countDocuments({ isProfileComplete: { $ne: true } });
            const usersInactive = await User.countDocuments({ isActive: { $ne: true } });
            console.log(`   ⚠️  Users without complete profiles: ${usersWithoutComplete}`);
            console.log(`   ⚠️  Inactive users: ${usersInactive}`);
        }
        await mongoose.connection.close();
        console.log('\n🏁 Test completed.');
    } catch (error) {
        console.error('❌ Error testing discovery:', error);
        await mongoose.connection.close();
    }
}
testDiscovery();
