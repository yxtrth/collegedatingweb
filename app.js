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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collegedatingweb';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
    console.log('Database:', MONGODB_URI.includes('localhost') ? 'Local' : 'Cloud');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Verification page route
app.get('/verify-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'verify-email.html'));
});

// API info route
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to collegedatingbyyt Backend API',
        version: '2.0.0',
        features: ['Email Verification', 'Real-time Auth', 'Universal Email Support'],
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
    console.log(`🚀 collegedatingbyyt Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`✅ Deployment timestamp: ${new Date().toISOString()}`);
});

module.exports = app;
