const mongoose = require('mongoose');
const User = require('./models/User');
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/collegedatingweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
async function checkUsers() {
    try {
        console.log('🔍 Checking users in database...\n');
        // Get total count
        const totalUsers = await User.countDocuments();
        console.log(`📊 Total users in database: ${totalUsers}`);
        if (totalUsers === 0) {
            console.log('❌ No users found. Please run populate-users.js first.');
            mongoose.connection.close();
            return;
        }
        // Get statistics
        const colleges = await User.distinct('college');
        const majors = await User.distinct('major');
        const years = await User.distinct('year');
        console.log(`🏫 Colleges represented: ${colleges.length}`);
        console.log(`📚 Majors represented: ${majors.length}`);
        console.log(`🎓 Academic years: ${years.join(', ')}\n`);
        // Get sample users
        console.log('👥 Sample users:');
        const sampleUsers = await User.find({})
            .limit(10)
            .select('name age college major year bio interests')
            .lean();
        sampleUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}, ${user.age}`);
            console.log(`   📚 ${user.major} - ${user.year} at ${user.college}`);
            console.log(`   💭 "${user.bio}"`);
            console.log(`   🎯 Interests: ${user.interests.slice(0, 3).join(', ')}${user.interests.length > 3 ? '...' : ''}\n`);
        });
        // Test discovery query (simulate what the API would do)
        console.log('🔍 Testing discovery functionality...');
        const randomUsers = await User.find({})
            .limit(5)
            .select('name age college major profilePicture bio')
            .lean();
        console.log(`✅ Discovery test successful! Found ${randomUsers.length} users for discovery.`);
        console.log('   Users ready for discovery:');
        randomUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} - ${user.major} at ${user.college}`);
        });
        mongoose.connection.close();
        console.log('\n🎉 Database check complete! Your discovery feature is ready to use.');
    } catch (error) {
        console.error('❌ Error checking users:', error);
        mongoose.connection.close();
    }
}
checkUsers();
