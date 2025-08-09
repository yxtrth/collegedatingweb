const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join('uploads', 'profiles');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.userId + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
        }
    }
});
// Public profile route moved to bottom to avoid shadowing more specific routes
// Get My Profile (Private - authenticated user)
router.get('/me/details', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});
// Update User Profile
router.put('/me/update', authenticateToken, [
    body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    body('profile.age').optional().isInt({ min: 18, max: 30 }).withMessage('Age must be between 18 and 30'),
    body('profile.interests').optional().isArray().withMessage('Interests must be an array'),
    body('profile.major').optional().trim(),
    body('profile.year').optional().isIn(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']),
    body('profile.lookingFor').optional().isIn(['Friends', 'Dating', 'Serious Relationship', 'Study Partner'])
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const updates = {};
        const { profile, preferences } = req.body;
        // Update profile fields
        if (profile) {
            Object.keys(profile).forEach(key => {
                if (profile[key] !== undefined) {
                    updates[`profile.${key}`] = profile[key];
                }
            });
        }
        // Update preferences
        if (preferences) {
            Object.keys(preferences).forEach(key => {
                if (preferences[key] !== undefined) {
                    updates[`preferences.${key}`] = preferences[key];
                }
            });
        }
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'Profile updated successfully',
            user: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating profile' });
    }
});
// Upload Profile Picture
router.post('/me/upload-photo', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { 'profile.profilePicture': req.file.path },
            { new: true }
        ).select('-password');
        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profile.profilePicture
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error uploading profile picture' });
    }
});
// Upload Additional Photos
router.post('/me/upload-photos', authenticateToken, upload.array('photos', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const photoPaths = req.files.map(file => file.path);
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $push: { 'profile.photos': { $each: photoPaths } } },
            { new: true }
        ).select('-password');
        res.status(200).json({
            message: 'Photos uploaded successfully',
            photos: user.profile.photos
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error uploading photos' });
    }
});
// Delete a photo
router.delete('/me/photos/:photoIndex', authenticateToken, async (req, res) => {
    try {
        const photoIndex = parseInt(req.params.photoIndex);
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (photoIndex < 0 || photoIndex >= user.profile.photos.length) {
            return res.status(400).json({ message: 'Invalid photo index' });
        }
        user.profile.photos.splice(photoIndex, 1);
        await user.save();
        res.status(200).json({
            message: 'Photo deleted successfully',
            photos: user.profile.photos
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting photo' });
    }
});
// Get potential matches based on preferences
router.get('/me/discover', authenticateToken, async (req, res) => {
    try {
        console.log('Discover endpoint called by user:', req.user.userId);
        const currentUser = await User.findById(req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Current user found:', currentUser.name);
        // Find users to exclude (already liked/disliked)
        const excludeIds = [
            ...(currentUser.likes || []),
            ...(currentUser.dislikes || []),
            currentUser._id
        ];
        console.log('Excluding user IDs:', excludeIds);
        // Build simple match criteria - just exclude current user and their previous actions
        const matchCriteria = {
            _id: { $nin: excludeIds },
            isActive: { $ne: false } // Include all active users
        };
        console.log('Match criteria:', matchCriteria);
        const potentialMatches = await User.find(matchCriteria)
            .select('-password -email -likes -dislikes')
            .limit(10);
        console.log('Found potential matches:', potentialMatches.length);
        res.status(200).json(potentialMatches);
    } catch (err) {
        console.error('Discover endpoint error:', err);
        res.status(500).json({ message: 'Error fetching potential matches' });
    }
});
// Get User Profile (Public - for viewing other users)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -email -likes -dislikes');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

module.exports = router;
