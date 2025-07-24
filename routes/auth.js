const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const emailService = require('../services/emailService');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register User
router.post('/register', [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('college').trim().isLength({ min: 2 }).withMessage('College name is required'),
    body('age').isInt({ min: 18, max: 30 }).withMessage('Age must be between 18 and 30')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, college, age, major, year } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
            profile: {
                college,
                age,
                major: major || '',
                year: year || 'Freshman'
            }
        });

        await newUser.save();

        // Send verification email
        const emailResult = await emailService.sendVerificationEmail(email, name, verificationToken);
        
        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
        }

        res.status(201).json({
            message: 'User registered successfully! Please check your email to verify your account.',
            userId: newUser._id,
            emailSent: emailResult.success,
            previewUrl: emailResult.previewUrl, // For development testing
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                emailVerified: newUser.emailVerified,
                college: newUser.profile.college
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login User
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(403).json({ 
                message: 'Please verify your email before logging in. Check your inbox for verification link.',
                emailVerified: false,
                userId: user._id
            });
        }

        // Update last active
        user.lastActive = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                college: user.profile.college,
                profileComplete: !!(user.profile.bio && user.profile.profilePicture)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Email Verification Route
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with this verification token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid or expired verification token' 
            });
        }

        // Mark email as verified
        user.emailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        // Send welcome email
        await emailService.sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            message: 'Email verified successfully! You can now log in.',
            emailVerified: true
        });
    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ message: 'Server error during verification' });
    }
});

// Resend Verification Email
router.post('/resend-verification', [
    body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = verificationExpires;
        await user.save();

        // Send verification email
        const emailResult = await emailService.sendVerificationEmail(email, user.name, verificationToken);

        res.status(200).json({
            message: 'Verification email sent! Please check your inbox.',
            emailSent: emailResult.success,
            previewUrl: emailResult.previewUrl // For development testing
        });
    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ message: 'Error sending verification email' });
    }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
