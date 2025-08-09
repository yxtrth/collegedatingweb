// Load environment variables
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
// Enable CORS for all routes
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'https://collegedatingwebbyyatharth.onrender.com'],
    credentials: true
}));
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files
app.use(express.static(path.join(__dirname)));
// MongoDB connection
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });
} else {
    console.warn('⚠️  MONGODB_URI not set; API endpoints requiring DB will fail. Set MONGODB_URI in your environment.');
}
// Routes Configuration
const API_BASE = {
    auth: '/api/auth',
    profile: '/api/profile', 
    match: '/api/match',
    message: '/api/message'
};
// Authentication Routes
const authRoutes = require('./routes/auth');
app.use(API_BASE.auth, authRoutes);
// Profile Management Routes
const profileRoutes = require('./routes/profile');
app.use(API_BASE.profile, profileRoutes);
// Matching Logic Routes
const matchRoutes = require('./routes/match');
app.use(API_BASE.match, matchRoutes);
// Message Routes
const messageRoutes = require('./routes/message');
app.use(API_BASE.message, messageRoutes);
// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});
// Email verification route
app.get('/verify-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'verify-email.html'));
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        api: 'collegedatingweb',
        version: '1.0.0',
        endpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/verify/:token',
            'GET /api/profile/:id',
            'PUT /api/profile/me/update',
            'GET /api/match/discover',
            'GET /api/match/me/matches',
            'POST /api/match/like/:targetUserId',
            'POST /api/match/dislike/:targetUserId',
            'GET /api/message/:conversationId',
            'POST /api/message/send'
        ]
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        availableEndpoints: [
            'GET /',
            'GET /dashboard', 
            'GET /verify-email',
            'GET /health',
            'GET /api/status'
        ]
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: ${process.env.BASE_URL || 'http://localhost:' + PORT}`);
    if (process.env.NODE_ENV === 'production') {
        console.log('🔒 Running in production mode');
    } else {
        console.log('🔧 Running in development mode');
    }
});
module.exports = app;
