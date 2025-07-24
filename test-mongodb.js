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
    
    // Close connection
    mongoose.connection.close();
    console.log('🔌 Connection closed.');
    process.exit(0);
})
.catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\n💡 Make sure MongoDB service is running:');
    console.log('   - Check: sc query MongoDB');
    console.log('   - Start: net start MongoDB (as admin)');
    process.exit(1);
});
