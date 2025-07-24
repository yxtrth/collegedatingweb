// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://yatharth10a:yatharth21@yathsdatabase.7fir4sd.mongodb.net/collegedating?retryWrites=true&w=majority&appName=YATHSDATABASE';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    bufferCommands: false, // Disable mongoose buffering
}).then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    console.log('🌐 Database: collegedating');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Please check:');
    console.error('   1. Your IP is whitelisted in MongoDB Atlas');
    console.error('   2. Your internet connection is stable');
    console.error('   3. MongoDB Atlas cluster is running');
    process.exit(1);
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to CampusCrush Backend API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            profile: '/api/profile', 
            match: '/api/match',
            message: '/api/message'
        }
    });
});

// User Authentication Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Profile Management Routes
const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

// Matching Logic Routes
const matchRoutes = require('./routes/match');
app.use('/api/match', matchRoutes);

// Messaging Routes
const messageRoutes = require('./routes/message');
app.use('/api/message', messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(400).json({
            message: 'Duplicate entry error',
            field: Object.keys(err.keyPattern)[0]
        });
    }
    
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        availableRoutes: [
            'GET /',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/me',
            'GET /api/profile/:id',
            'PUT /api/profile/me/update',
            'GET /api/match/discover',
            'GET /api/match/me/matches',
            'POST /api/match/like/:targetUserId',
            'POST /api/match/dislike/:targetUserId',
            'GET /api/message/conversations/all'
        ]
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 CampusCrush Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
