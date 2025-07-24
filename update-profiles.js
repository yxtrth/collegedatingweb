const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/collegedatingweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function updateProfiles() {
    try {
        console.log('🔄 Updating user profiles to mark them as complete...');
        
        // Update all users to have complete profiles
        const result = await User.updateMany(
            {}, // Update all users
            { $set: { isProfileComplete: true } }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} user profiles`);
        
        // Verify the update
        const completeUsers = await User.countDocuments({ isProfileComplete: true });
        console.log(`📊 Users with complete profiles: ${completeUsers}`);
        
        // Show sample users for discovery
        const sampleUsers = await User.find({ isProfileComplete: true })
            .limit(10)
            .select('name profile.age profile.college profile.major profile.bio')
            .lean();
        
        console.log('\n🌟 Sample users ready for discovery:');
        sampleUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}, ${user.profile.age}`);
            console.log(`   🎓 ${user.profile.major} at ${user.profile.college}`);
            console.log(`   💭 "${user.profile.bio}"\n`);
        });
        
        await mongoose.connection.close();
        console.log('🎉 All users are now ready for discovery! You can start swiping!');
        
    } catch (error) {
        console.error('❌ Error updating profiles:', error);
        await mongoose.connection.close();
    }
}

updateProfiles();
