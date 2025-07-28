const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/collegedatingweb', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB successfully');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        return false;
    }
}
// Sample data arrays
const colleges = [
    'Harvard University', 'Stanford University', 'MIT', 'UC Berkeley', 'UCLA',
    'Yale University', 'Princeton University', 'Columbia University', 'NYU',
    'University of Pennsylvania', 'Northwestern University', 'Duke University',
    'Cornell University', 'Johns Hopkins University', 'Vanderbilt University',
    'Rice University', 'Georgetown University', 'Carnegie Mellon University',
    'University of Virginia', 'University of Michigan', 'University of Notre Dame',
    'Boston University', 'Northeastern University', 'University of Southern California',
    'Georgia Tech', 'UT Austin', 'University of Florida', 'Ohio State University'
];
const majors = [
    'Computer Science', 'Business Administration', 'Psychology', 'Biology',
    'Engineering', 'Economics', 'Political Science', 'English Literature',
    'Mathematics', 'Physics', 'Chemistry', 'Art History', 'Philosophy',
    'Communications', 'Marketing', 'Finance', 'Pre-Med', 'Pre-Law',
    'International Relations', 'Sociology', 'History', 'Music', 'Theater'
];
const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const interests = [
    'Photography', 'Hiking', 'Reading', 'Movies', 'Music', 'Dancing',
    'Cooking', 'Traveling', 'Sports', 'Gaming', 'Art', 'Yoga', 'Running',
    'Swimming', 'Basketball', 'Soccer', 'Tennis', 'Guitar', 'Piano',
    'Coffee', 'Food', 'Fashion', 'Technology', 'Dogs', 'Cats', 'Netflix'
];
const bios = [
    "Looking for someone to share coffee dates and deep conversations with",
    "Adventure seeker who loves trying new restaurants and exploring the city",
    "Bookworm by day, Netflix binger by night. Let's discuss our favorite shows!",
    "Pre-med student who still finds time for fun. Love hiking and live music",
    "Art lover seeking someone who appreciates creativity and museum visits",
    "Fitness enthusiast looking for a workout buddy and maybe something more",
    "Foodie who knows all the best spots on campus. Let me show you around!",
    "Music festival goer and concert enthusiast. What's on your playlist?",
    "Dog lover and future veterinarian. Swipe right if you love animals too!",
    "Philosophy major who loves deep conversations under the stars"
];
const firstNames = {
    male: ['Alex', 'James', 'Michael', 'David', 'Daniel', 'Matthew', 'Ryan', 'Andrew', 'Joshua', 'Christopher'],
    female: ['Emma', 'Olivia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Emily', 'Abigail', 'Madison', 'Elizabeth']
};
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function getRandomElements(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
function generateUser(index) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const firstName = getRandomElement(firstNames[gender]);
    const lastName = getRandomElement(lastNames);
    const college = getRandomElement(colleges);
    const collegeDomain = college.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15) + '.edu';
    return {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${collegeDomain}`,
        password: 'password123', // Will be hashed
        profile: {
            age: Math.floor(Math.random() * 8) + 18, // 18-25
            college: college,
            major: getRandomElement(majors),
            year: getRandomElement(years),
            bio: getRandomElement(bios),
            interests: getRandomElements(interests, Math.floor(Math.random() * 5) + 3), // 3-7 interests
            profilePicture: `https://picsum.photos/400/600?random=${index}`,
            photos: [
                `https://picsum.photos/400/600?random=${index}`,
                `https://picsum.photos/400/600?random=${index + 1000}`
            ]
        },
        isProfileComplete: true
    };
}
async function createUsers() {
    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }
    try {
        console.log('🚀 Starting to create 100 users...');
        // Check current count
        const existingCount = await User.countDocuments();
        console.log(`📊 Current users in database: ${existingCount}`);
        const numberOfUsers = 100;
        let successCount = 0;
        console.log('👥 Creating users one by one...');
        for (let i = 0; i < numberOfUsers; i++) {
            try {
                const userData = generateUser(i + existingCount + 1);
                // Hash password
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(userData.password, salt);
                // Create user
                const user = new User(userData);
                await user.save();
                successCount++;
                if ((i + 1) % 20 === 0) {
                    console.log(`✨ Created ${successCount}/${numberOfUsers} users...`);
                }
            } catch (error) {
                console.log(`⚠️ Error creating user ${i + 1}: ${error.message}`);
            }
        }
        console.log(`🎉 Successfully created ${successCount} users!`);
        // Final count
        const totalUsers = await User.countDocuments();
        console.log(`📊 Total users in database: ${totalUsers}`);
        // Show sample
        const sampleUsers = await User.find({}).limit(3).select('name profile.college profile.major');
        console.log('\n🌟 Sample users created:');
        sampleUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} - ${user.profile.major} at ${user.profile.college}`);
        });
        await mongoose.connection.close();
        console.log('\n✅ Complete! Your discovery feature now has plenty of users to browse.');
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
    }
}
createUsers();
