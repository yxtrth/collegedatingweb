const mongoose = require('mongoose');
const User = require('./models/User');
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/collegedatingweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
async function fixUserFields() {
    try {
        console.log('🔧 Fixing user fields for discovery...\n');
        // Update all users to have required fields
        const result = await User.updateMany(
            {}, // Update all users
            { 
                $set: { 
                    isProfileComplete: true,
                    isActive: true
                }
            }
        );
        console.log(`✅ Updated ${result.modifiedCount} users`);
        // Check final counts
        const totalUsers = await User.countDocuments();
        const completeUsers = await User.countDocuments({ isProfileComplete: true });
        const activeUsers = await User.countDocuments({ isActive: true });
        const discoveryReady = await User.countDocuments({ 
            isProfileComplete: true, 
            isActive: true 
        });
        console.log(`📊 Database Statistics:`);
        console.log(`   Total users: ${totalUsers}`);
        console.log(`   Complete profiles: ${completeUsers}`);
        console.log(`   Active users: ${activeUsers}`);
        console.log(`   Ready for discovery: ${discoveryReady}`);
        // Test discovery query
        const sampleUsers = await User.find({
            isProfileComplete: true,
            isActive: true
        })
        .select('name profile.age profile.college profile.major')
        .limit(5)
        .lean();
        console.log(`\n🌟 Sample users ready for discovery:`);
        sampleUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} - ${user.profile?.major || 'No major'} at ${user.profile?.college || 'No college'}`);
        });
        await mongoose.connection.close();
        console.log('\n🎉 All users are now ready for discovery!');
        console.log('💡 Try logging in and going to the Discover section.');
    } catch (error) {
        console.error('❌ Error fixing user fields:', error);
        await mongoose.connection.close();
    }
}
fixUserFields();
