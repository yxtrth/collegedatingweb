const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/collegedatingweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// Sample data for generating users
const colleges = [
    'Harvard University', 'Stanford University', 'MIT', 'UC Berkeley', 'UCLA',
    'Yale University', 'Princeton University', 'Columbia University', 'University of Chicago',
    'NYU', 'University of Pennsylvania', 'Northwestern University', 'Duke University',
    'Cornell University', 'Johns Hopkins University', 'Vanderbilt University',
    'Rice University', 'Georgetown University', 'Carnegie Mellon University',
    'University of Virginia', 'University of Michigan', 'University of Notre Dame',
    'Emory University', 'Wake Forest University', 'University of Rochester',
    'Boston University', 'Northeastern University', 'Tulane University',
    'University of Southern California', 'Georgia Tech', 'UT Austin', 'University of Florida'
];
const majors = [
    'Computer Science', 'Business Administration', 'Psychology', 'Biology',
    'Engineering', 'Economics', 'Political Science', 'English Literature',
    'Mathematics', 'Physics', 'Chemistry', 'Art History', 'Philosophy',
    'Communications', 'Marketing', 'Finance', 'Pre-Med', 'Pre-Law',
    'International Relations', 'Sociology', 'Anthropology', 'History',
    'Music', 'Theater', 'Film Studies', 'Environmental Science',
    'Architecture', 'Journalism', 'Graphic Design', 'Nursing'
];
const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const interests = [
    'Photography', 'Hiking', 'Reading', 'Movies', 'Music', 'Dancing',
    'Cooking', 'Traveling', 'Sports', 'Gaming', 'Art', 'Yoga',
    'Running', 'Swimming', 'Basketball', 'Soccer', 'Tennis', 'Volleyball',
    'Guitar', 'Piano', 'Singing', 'Writing', 'Painting', 'Drawing',
    'Coffee', 'Food', 'Fashion', 'Technology', 'Science', 'Nature',
    'Dogs', 'Cats', 'Netflix', 'Podcasts', 'Board Games', 'Concerts',
    'Theater', 'Museums', 'Beach', 'Mountains', 'City Life', 'Adventure'
];
const bios = [
    "Looking for someone to share coffee dates and deep conversations with ☕",
    "Adventure seeker who loves trying new restaurants and exploring the city 🌟",
    "Bookworm by day, Netflix binger by night. Let's discuss our favorite shows!",
    "Pre-med student who still finds time for fun. Love hiking and live music 🎵",
    "Art lover seeking someone who appreciates creativity and spontaneous museum visits",
    "Fitness enthusiast looking for a workout buddy and maybe something more 💪",
    "Foodie who knows all the best spots on campus. Let me show you around!",
    "Music festival goer and concert enthusiast. What's on your playlist? 🎶",
    "Dog lover and future veterinarian. Swipe right if you love animals too! 🐕",
    "Philosophy major who loves deep conversations under the stars ⭐",
    "Basketball player looking for someone to cheer me on at games 🏀",
    "Theater kid at heart. Love musicals, plays, and anything dramatic 🎭",
    "Coffee addict and study buddy seeker. Let's motivate each other! ☕",
    "Travel enthusiast planning my next adventure. Want to join? ✈️",
    "Yoga instructor spreading good vibes. Namaste and let's date! 🧘‍♀️",
    "Photography lover capturing beautiful moments. Can I photograph you? 📸",
    "Science nerd who finds chemistry in more than just the lab 🧪",
    "Beach lover missing the ocean. Let's plan a weekend getaway! 🏖️",
    "Gamer girl looking for player 2 in life and in games 🎮",
    "Environmental science major passionate about saving the planet 🌍",
    "Future lawyer who loves a good debate and great company ⚖️",
    "Dance team captain with moves that'll sweep you off your feet 💃",
    "Cooking enthusiast who'll win your heart through your stomach 👨‍🍳",
    "Mountain climber reaching new heights in life and love 🏔️",
    "Film student documenting life's beautiful moments 🎬",
    "Running enthusiast training for my next marathon. Join me? 🏃‍♀️",
    "Swimming champion making waves on and off the pool 🏊‍♂️",
    "Guitar player serenading my way into your heart 🎸",
    "Future teacher spreading knowledge and looking for love 📚",
    "Tech enthusiast building apps and building connections 💻"
];
const firstNames = {
    male: [
        'Alex', 'James', 'Michael', 'David', 'Daniel', 'Matthew', 'Ryan', 'Andrew',
        'Joshua', 'Christopher', 'Anthony', 'Mark', 'Steven', 'Kevin', 'Brian',
        'Jason', 'Justin', 'Brandon', 'Ben', 'Sam', 'Nick', 'Tyler', 'Connor',
        'Jake', 'Luke', 'Noah', 'Ethan', 'Mason', 'Logan', 'Caleb', 'Nathan',
        'Owen', 'Eli', 'Hunter', 'Adrian', 'Cameron', 'Sean', 'Austin', 'Cole'
    ],
    female: [
        'Emma', 'Olivia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Emily', 'Abigail',
        'Madison', 'Elizabeth', 'Charlotte', 'Avery', 'Sofia', 'Chloe', 'Ella',
        'Harper', 'Amelia', 'Aubrey', 'Addison', 'Evelyn', 'Natalie', 'Grace',
        'Hannah', 'Zoey', 'Victoria', 'Lillian', 'Lily', 'Brooklyn', 'Samantha',
        'Layla', 'Zoe', 'Audrey', 'Leah', 'Allison', 'Anna', 'Aaliyah', 'Savannah',
        'Gabriella', 'Camila', 'Aria', 'Maya', 'Sarah', 'Claire', 'Kaylee', 'Riley'
    ]
};
const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
];
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function getRandomElements(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
function generateUser(index) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const firstName = getRandomElement(firstNames[gender]);
    const lastName = getRandomElement(lastNames);
    const college = getRandomElement(colleges);
    const collegeDomain = college.toLowerCase().replace(/[^a-z0-9]/g, '') + '.edu';
    return {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@${collegeDomain}`,
        password: 'password123', // Will be hashed
        age: Math.floor(Math.random() * 8) + 18, // 18-25
        college: college,
        major: getRandomElement(majors),
        year: getRandomElement(years),
        bio: getRandomElement(bios),
        interests: getRandomElements(interests, Math.floor(Math.random() * 6) + 3), // 3-8 interests
        profilePicture: `https://picsum.photos/400/600?random=${index}`, // Random profile pictures
        isProfileComplete: true,
        photos: [
            `https://picsum.photos/400/600?random=${index}`,
            `https://picsum.photos/400/600?random=${index + 1000}`,
            `https://picsum.photos/400/600?random=${index + 2000}`
        ]
    };
}
async function createUsers() {
    try {
        console.log('🚀 Starting to create 100+ users...');
        // Clear existing users (optional - remove this line if you want to keep existing users)
        // await User.deleteMany({});
        // console.log('🗑️ Cleared existing users');
        const users = [];
        const numberOfUsers = 120; // Creating 120 users to exceed your requirement
        for (let i = 0; i < numberOfUsers; i++) {
            const userData = generateUser(i);
            // Hash password
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
            users.push(userData);
            if (i % 20 === 0) {
                console.log(`✨ Generated ${i + 1}/${numberOfUsers} users...`);
            }
        }
        // Insert all users at once
        const createdUsers = await User.insertMany(users);
        console.log(`🎉 Successfully created ${createdUsers.length} users!`);
        // Display some statistics
        const maleCount = createdUsers.filter(user => 
            firstNames.male.some(name => user.name.startsWith(name))
        ).length;
        const femaleCount = createdUsers.length - maleCount;
        console.log(`📊 Statistics:`);
        console.log(`   👨 Male users: ${maleCount}`);
        console.log(`   👩 Female users: ${femaleCount}`);
        console.log(`   🏫 Colleges represented: ${[...new Set(createdUsers.map(u => u.college))].length}`);
        console.log(`   📚 Majors represented: ${[...new Set(createdUsers.map(u => u.major))].length}`);
        console.log('\n🌟 Sample users created:');
        createdUsers.slice(0, 5).forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} - ${user.major} at ${user.college}`);
        });
        mongoose.connection.close();
        console.log('\n✅ Database connection closed. Your discovery page is now ready!');
    } catch (error) {
        console.error('❌ Error creating users:', error);
        mongoose.connection.close();
    }
}
// Run the script
createUsers();
