// Test Discover Route
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/campuscrush', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testDiscover() {
    try {
        console.log('Testing discover functionality...');
        
        // Get all users
        const allUsers = await User.find({});
        console.log('Total users in database:', allUsers.length);
        
        allUsers.forEach(user => {
            console.log(`User: ${user.name} (${user.email})`);
            console.log(`  College: ${user.college || user.profile?.college || 'Not set'}`);
            console.log(`  Age: ${user.age || user.profile?.age || 'Not set'}`);
            console.log(`  Active: ${user.isActive !== false}`);
            console.log('---');
        });

        // Test the discover query
        if (allUsers.length > 0) {
            const testUser = allUsers[0];
            console.log(`\nTesting discover for user: ${testUser.name}`);
            
            // Find users to exclude (already liked/disliked)
            const excludeIds = [
                ...(testUser.likes || []),
                ...(testUser.dislikes || []),
                testUser._id
            ];

            console.log('Excluded IDs:', excludeIds);

            // Build flexible match criteria
            const matchCriteria = {
                _id: { $nin: excludeIds },
                isActive: { $ne: false }
            };

            console.log('Match criteria:', matchCriteria);

            const potentialMatches = await User.find(matchCriteria)
                .select('-password -email -likes -dislikes')
                .limit(10);

            console.log('Potential matches found:', potentialMatches.length);
            potentialMatches.forEach(match => {
                console.log(`  - ${match.name} (${match.college || match.profile?.college})`);
            });
        }

    } catch (error) {
        console.error('Error testing discover:', error);
    } finally {
        mongoose.connection.close();
    }
}

testDiscover();
