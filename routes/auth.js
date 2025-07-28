const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateVerificationToken, sendVerificationEmail } = require('../services/emailService');
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
            // Return first validation error message
            return res.status(400).json({ message: errors.array()[0].msg });
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
        // Generate verification token
        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires,
            isVerified: false,
            profile: {
                college,
                age,
                major: major || '',
                year: year || 'Freshman'
            }
        });
        await newUser.save();
        // Send verification email
        try {
            const emailResult = await sendVerificationEmail(newUser, verificationToken);
            res.status(201).json({
                message: 'User registered successfully. Please check your email to verify your account.',
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    college: newUser.profile.college,
                    isVerified: newUser.isVerified
                },
                previewUrl: emailResult.previewUrl // Only for development
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(201).json({
                message: 'User registered successfully, but verification email could not be sent. You can request a new one.',
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    college: newUser.profile.college,
                    isVerified: newUser.isVerified
                }
            });
        }
    } catch (err) {
        console.error('Registration error:', err);
        // Handle duplicate email error
        if (err.code === 11000) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        // Surface any other error messages
        res.status(500).json({ message: err.message || 'Server error' });
        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
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
        if (!user.isVerified) {
            return res.status(401).json({ 
                message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
                emailNotVerified: true 
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
                college: user.profile.college,
                profileComplete: !!(user.profile.bio && user.profile.profilePicture)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in' });
    }
});
// Verify email
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;
        // Find user with this verification token
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }
        // Update user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        // Redirect to verification success page with success status
        res.redirect(`/verify-email.html?status=success`);
    } catch (err) {
        console.error('Email verification error:', err);
        // Redirect to verification page with error status
        res.redirect(`/verify-email.html?status=error&message=${encodeURIComponent('Error verifying email')}`);
    }
});
// Resend verification email
router.post('/resend-verification', [
    body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        const { email } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }
        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Update user with new token
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        await user.save();
        // Send verification email
        try {
            const emailResult = await sendVerificationEmail(user, verificationToken);
            res.status(200).json({
                message: 'Verification email sent successfully. Please check your inbox.',
                previewUrl: emailResult.previewUrl // Only for development
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
        }
    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ message: 'Error sending verification email' });
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
module.exports = router;
module.exports.authenticateToken = authenticateToken;
