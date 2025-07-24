// Quick connection test
const mongoose = require('mongoose');

console.log('Testing connection...');

mongoose.connect('mongodb+srv://yatharth10a:yatharth21@yathsdatabase.7fir4sd.mongodb.net/collegedating?retryWrites=true&w=majority&appName=YATHSDATABASE', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
});

mongoose.connection.on('connected', () => {
    console.log('✅ Connected to MongoDB Atlas!');
    process.exit(0);
});

mongoose.connection.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
    process.exit(1);
});

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

// Timeout after 8 seconds
setTimeout(() => {
    console.log('⏰ Connection test timed out');
    process.exit(1);
}, 8000);
