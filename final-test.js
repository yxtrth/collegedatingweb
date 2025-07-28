const mongoose = require('mongoose');
async function testConnection() {
    try {
        console.log('🔗 Connecting to MongoDB Atlas...');
        await mongoose.connect('mongodb+srv://yatharth10a:yatharth21@yathsdatabase.7fir4sd.mongodb.net/collegedating?retryWrites=true&w=majority&appName=YATHSDATABASE', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ SUCCESS! Connected to MongoDB Atlas');
        console.log('🎉 Connection is working perfectly!');
        console.log('📊 Testing database query...');
        // Test a simple query
        const result = await mongoose.connection.db.admin().ping();
        console.log('🏓 Database ping successful:', result);
        await mongoose.connection.close();
        console.log('🔌 Connection closed successfully');
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        if (error.message.includes('ENOTFOUND')) {
            console.log('💡 DNS resolution failed - check your internet connection');
        } else if (error.message.includes('authentication failed')) {
            console.log('💡 Check your username and password in the connection string');
        } else if (error.message.includes('MongoServerSelectionError')) {
            console.log('💡 Check your IP whitelist in MongoDB Atlas');
        }
    }
}
testConnection();
