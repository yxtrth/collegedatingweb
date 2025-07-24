<<<<<<< HEAD
// Quick MongoDB Atlas connection test
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Atlas connection...');

const mongoURI = 'mongodb+srv://yatharth10a:yatharth21@yathsdatabase.7fir4sd.mongodb.net/collegedating?retryWrites=true&w=majority&appName=YATHSDATABASE';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5 second timeout
    socketTimeoutMS: 45000, // 45 second timeout
    maxPoolSize: 10
})
.then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('📍 Database: collegedating');
    console.log('🌐 Cluster: YATHSDATABASE');
    console.log('🔐 Connection authenticated');
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
})
.then(() => {
    console.log('🏓 Database ping successful!');
=======
// Quick MongoDB connection test
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB connection...');

mongoose.connect('mongodb://localhost:27017/campuscrush', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('📍 Database: campuscrush');
    console.log('🌐 Connection: mongodb://localhost:27017');
>>>>>>> be720c18b57db286f2aa3c87e5bea68f6d38e92b
    
    // Close connection
    mongoose.connection.close();
    console.log('🔌 Connection closed.');
    process.exit(0);
})
.catch((err) => {
<<<<<<< HEAD
    console.error('❌ MongoDB Atlas connection failed:', err.message);
    console.log('\n💡 Possible issues:');
    console.log('   - IP address not whitelisted in MongoDB Atlas');
    console.log('   - Invalid credentials');
    console.log('   - Network connectivity issues');
    console.log('   - Firewall blocking the connection');
=======
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\n💡 Make sure MongoDB service is running:');
    console.log('   - Check: sc query MongoDB');
    console.log('   - Start: net start MongoDB (as admin)');
>>>>>>> be720c18b57db286f2aa3c87e5bea68f6d38e92b
    process.exit(1);
});
