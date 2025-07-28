// Quick database check
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('✅ Connected to MongoDB');
    const totalUsers = await User.countDocuments({});
    const completeProfiles = await User.countDocuments({ isProfileComplete: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    console.log(`📊 Database Stats:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Complete profiles: ${completeProfiles}`);
    console.log(`   Active users: ${activeUsers}`);
    if (totalUsers === 0) {
        console.log('\n🔄 Creating test users...');
        const testUsers = [
            {
                name: 'Alex Johnson',
                email: 'alex@test.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                isVerified: true,
                isActive: true,
                isProfileComplete: true,
                profile: {
                    age: 20,
                    college: 'MIT',
                    major: 'Computer Science',
                    year: 'Sophomore',
                    bio: 'Love coding and making new friends!',
                    interests: ['Programming', 'Gaming', 'Movies']
                },
                likes: [],
                dislikes: []
            },
            {
                name: 'Sarah Davis',
                email: 'sarah@test.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                isVerified: true,
                isActive: true,
                isProfileComplete: true,
                profile: {
                    age: 19,
                    college: 'MIT',
                    major: 'Biology',
                    year: 'Freshman',
                    bio: 'Pre-med student who loves nature and music!',
                    interests: ['Medicine', 'Hiking', 'Music']
                },
                likes: [],
                dislikes: []
            },
            {
                name: 'Mike Chen',
                email: 'mike@test.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                isVerified: true,
                isActive: true,
                isProfileComplete: true,
                profile: {
                    age: 21,
                    college: 'MIT',
                    major: 'Mathematics',
                    year: 'Junior',
                    bio: 'Math nerd looking for someone to explore Boston with!',
                    interests: ['Mathematics', 'Sports', 'Travel']
                },
                likes: [],
                dislikes: []
            }
        ];
        await User.insertMany(testUsers);
        console.log('✅ Test users created!');
    }
    // Test discovery query
    const discoveryUsers = await User.find({
        isProfileComplete: true,
        isActive: true
    }).limit(5);
    console.log(`\n🔍 Discovery Test: Found ${discoveryUsers.length} users`);
    discoveryUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.profile?.college || 'No college'})`);
    });
    process.exit(0);
}).catch(err => {
    console.error('❌ Database error:', err.message);
    process.exit(1);
});
