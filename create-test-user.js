const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/collegedatingweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
async function createTestUser() {
    try {
        console.log('🧪 Creating a test user for discovery testing...\n');
        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'test@college.edu' });
        if (existingUser) {
            console.log('✅ Test user already exists:', existingUser.name);
            console.log('📧 Email:', existingUser.email);
            console.log('🆔 ID:', existingUser._id);
            await mongoose.connection.close();
            return;
        }
        // Create a test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const testUser = new User({
            name: 'Test User',
            email: 'test@college.edu',
            password: hashedPassword,
            profile: {
                age: 21,
                college: 'Test University',
                major: 'Computer Science',
                year: 'Junior',
                bio: 'Test user for discovery functionality',
                interests: ['Testing', 'Coding', 'Coffee'],
                profilePicture: 'https://picsum.photos/400/600?random=999',
                photos: ['https://picsum.photos/400/600?random=999']
            },
            isProfileComplete: true,
            isActive: true
        });
        await testUser.save();
        console.log('✅ Test user created successfully!');
        console.log('📧 Email: test@college.edu');
        console.log('🔑 Password: password123');
        console.log('🆔 ID:', testUser._id);
        console.log('\n💡 You can now:');
        console.log('   1. Go to http://localhost:5000');
        console.log('   2. Click "Log In"');
        console.log('   3. Use email: test@college.edu, password: password123');
        console.log('   4. Go to the Discover section to see 100+ users!');
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        await mongoose.connection.close();
    }
}
createTestUser();
