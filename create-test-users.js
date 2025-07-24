// Create Test Users Script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/campuscrush', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const testUsers = [
    {
        name: "Sarah Johnson",
        email: "sarah@university.edu",
        password: "password123",
        college: "State University",
        age: 20,
        profile: {
            college: "State University",
            age: 20,
            major: "Psychology",
            year: "Sophomore",
            bio: "Love hiking, reading, and coffee! Looking for someone to explore the campus with.",
            interests: ["Hiking", "Reading", "Coffee", "Photography", "Movies"]
        }
    },
    {
        name: "Alex Chen",
        email: "alex@university.edu", 
        password: "password123",
        college: "State University",
        age: 21,
        profile: {
            college: "State University",
            age: 21,
            major: "Computer Science",
            year: "Junior",
            bio: "Coding by day, gaming by night. Always up for trying new restaurants!",
            interests: ["Gaming", "Programming", "Food", "Music", "Tech"]
        }
    },
    {
        name: "Maria Rodriguez",
        email: "maria@university.edu",
        password: "password123", 
        college: "State University",
        age: 19,
        profile: {
            college: "State University",
            age: 19,
            major: "Art History",
            year: "Freshman",
            bio: "Art enthusiast and museum lover. Let's discover the city's culture together!",
            interests: ["Art", "Museums", "Dancing", "Travel", "Culture"]
        }
    },
    {
        name: "Jake Thompson",
        email: "jake@university.edu",
        password: "password123",
        college: "State University", 
        age: 22,
        profile: {
            college: "State University",
            age: 22,
            major: "Business",
            year: "Senior",
            bio: "Entrepreneur mindset, love sports and staying active. Looking for adventure!",
            interests: ["Sports", "Business", "Fitness", "Travel", "Networking"]
        }
    },
    {
        name: "Emma Williams",
        email: "emma@university.edu",
        password: "password123",
        college: "State University",
        age: 20,
        profile: {
            college: "State University", 
            age: 20,
            major: "Environmental Science",
            year: "Sophomore",
            bio: "Nature lover and sustainability advocate. Let's make the world better together!",
            interests: ["Nature", "Sustainability", "Yoga", "Cooking", "Volunteering"]
        }
    }
];

async function createTestUsers() {
    try {
        console.log('Creating test users...');
        
        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists, skipping...`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;

            // Create user
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${userData.name} (${userData.email})`);
        }

        console.log('✅ Test users created successfully!');
        console.log('\nYou can now:');
        console.log('1. Register a new account on the website');
        console.log('2. Go to the Discover section');
        console.log('3. Start swiping on potential matches!');
        
    } catch (error) {
        console.error('Error creating test users:', error);
    } finally {
        mongoose.connection.close();
    }
}

createTestUsers();
