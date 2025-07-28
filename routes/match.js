const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
// Like a user
router.post('/like/:targetUserId', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const targetUserId = req.params.targetUserId;
        // Can't like yourself
        if (currentUserId === targetUserId) {
            return res.status(400).json({ message: "You can't like yourself" });
        }
        // Check if target user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if already liked
        const currentUser = await User.findById(currentUserId);
        if (currentUser.likes.includes(targetUserId)) {
            return res.status(400).json({ message: 'User already liked' });
        }
        // Add to likes
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { likes: targetUserId },
            $pull: { dislikes: targetUserId } // Remove from dislikes if present
        });
        // Check if it's a mutual like (match)
        const targetUserLikes = await User.findById(targetUserId).select('likes');
        const isMatch = targetUserLikes.likes.includes(currentUserId);
        if (isMatch) {
            // Create a match
            const existingMatch = await Match.findOne({
                $or: [
                    { user1: currentUserId, user2: targetUserId },
                    { user1: targetUserId, user2: currentUserId }
                ]
            });
            if (!existingMatch) {
                const newMatch = new Match({
                    user1: currentUserId,
                    user2: targetUserId
                });
                await newMatch.save();
            }
            res.status(200).json({
                message: 'It\'s a match!',
                isMatch: true,
                matchedUser: {
                    id: targetUser._id,
                    name: targetUser.name,
                    profilePicture: targetUser.profile.profilePicture
                }
            });
        } else {
            res.status(200).json({
                message: 'User liked successfully',
                isMatch: false
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error liking user' });
    }
});
// Dislike a user
router.post('/dislike/:targetUserId', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const targetUserId = req.params.targetUserId;
        // Can't dislike yourself
        if (currentUserId === targetUserId) {
            return res.status(400).json({ message: "You can't dislike yourself" });
        }
        // Add to dislikes and remove from likes
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { dislikes: targetUserId },
            $pull: { likes: targetUserId }
        });
        res.status(200).json({ message: 'User disliked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error disliking user' });
    }
});
// Get all matches for current user
router.get('/me/matches', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const matches = await Match.find({
            $or: [{ user1: currentUserId }, { user2: currentUserId }]
        }).populate('user1 user2', 'name profile.profilePicture profile.college profile.age profile.bio profile.major');
        // Format the response to show the other user in each match
        const formattedMatches = matches.map(match => {
            const otherUser = match.user1._id.toString() === currentUserId ? match.user2 : match.user1;
            return {
                matchId: match._id,
                matchedAt: match.matchedAt,
                user: {
                    id: otherUser._id,
                    name: otherUser.name,
                    profilePicture: otherUser.profile.profilePicture,
                    college: otherUser.profile.college,
                    age: otherUser.profile.age,
                    bio: otherUser.profile.bio,
                    major: otherUser.profile.major
                }
            };
        });
        res.status(200).json(formattedMatches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching matches' });
    }
});
// Unmatch with a user
router.delete('/unmatch/:matchId', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const matchId = req.params.matchId;
        // Find the match and verify user is part of it
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        if (match.user1.toString() !== currentUserId && match.user2.toString() !== currentUserId) {
            return res.status(403).json({ message: 'Not authorized to unmatch this user' });
        }
        // Remove the match
        await Match.findByIdAndDelete(matchId);
        // Remove from each other's likes
        const otherUserId = match.user1.toString() === currentUserId ? match.user2 : match.user1;
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { likes: otherUserId }
        });
        await User.findByIdAndUpdate(otherUserId, {
            $pull: { likes: currentUserId }
        });
        res.status(200).json({ message: 'Successfully unmatched' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error unmatching user' });
    }
});
// Get users who liked current user
router.get('/me/likes-received', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        // Find users who have liked the current user
        const usersWhoLiked = await User.find({
            likes: currentUserId,
            _id: { $ne: currentUserId }
        }).select('name profile.profilePicture profile.college profile.age profile.bio');
        res.status(200).json(usersWhoLiked);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching users who liked you' });
    }
});
// Get match statistics
router.get('/me/stats', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const user = await User.findById(currentUserId).select('likes dislikes');
        const matchCount = await Match.countDocuments({
            $or: [{ user1: currentUserId }, { user2: currentUserId }]
        });
        const stats = {
            totalLikes: user.likes.length,
            totalDislikes: user.dislikes.length,
            totalMatches: matchCount,
            profileViews: 0 // You can implement view tracking later
        };
        res.status(200).json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching match statistics' });
    }
});
// Get users for discovery
router.get('/discover', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        console.log('🔍 Discovery request from user:', currentUserId);
        // Get current user's likes and dislikes
        const currentUser = await User.findById(currentUserId).select('likes dislikes preferences profile.college');
        console.log('👤 Current user found:', !!currentUser);
        console.log('👍 User likes count:', currentUser.likes.length);
        console.log('👎 User dislikes count:', currentUser.dislikes.length);
        // Build query to exclude already liked/disliked users and current user
        const excludeIds = [
            currentUserId,
            ...currentUser.likes,
            ...currentUser.dislikes
        ];
        console.log('🚫 Excluding', excludeIds.length, 'users');
        // Find potential matches
        let query = {
            _id: { $nin: excludeIds },
            isProfileComplete: true,
            isActive: true
        };
        console.log('🔍 Query:', JSON.stringify(query, null, 2));
        // Optional: Filter by same college if preference is set
        // Uncomment the line below if you want same-college filtering
        // query['profile.college'] = currentUser.profile.college;
        const potentialMatches = await User.find(query)
            .select('name profile.age profile.college profile.major profile.year profile.bio profile.interests profile.profilePicture profile.photos')
            .limit(20) // Limit to 20 users at a time
            .lean();
        console.log('✅ Found', potentialMatches.length, 'potential matches');
        // Shuffle the results for randomness
        const shuffledMatches = potentialMatches.sort(() => 0.5 - Math.random());
        res.status(200).json({
            users: shuffledMatches,
            hasMore: shuffledMatches.length === 20, // Indicate if there might be more users
            debug: {
                currentUserId,
                excludedCount: excludeIds.length,
                totalFound: potentialMatches.length
            }
        });
    } catch (err) {
        console.error('❌ Discovery error:', err);
        res.status(500).json({ 
            message: 'Error fetching users for discovery',
            error: err.message
        });
    }
});
// Debug endpoint to check database state
router.get('/debug/stats', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const stats = {
            totalUsers: await User.countDocuments(),
            activeUsers: await User.countDocuments({ isActive: true }),
            completeProfiles: await User.countDocuments({ isProfileComplete: true }),
            usersReadyForDiscovery: await User.countDocuments({
                isProfileComplete: true,
                isActive: true,
                _id: { $ne: currentUserId }
            }),
            currentUserLikes: await User.findById(currentUserId).select('likes dislikes').then(u => u.likes.length),
            currentUserDislikes: await User.findById(currentUserId).select('likes dislikes').then(u => u.dislikes.length)
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
