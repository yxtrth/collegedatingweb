const nodemailer = require('nodemailer');

async function createTestAccount() {
    try {
        // Create a test account for development
        const testAccount = await nodemailer.createTestAccount();
        
        console.log('✅ Test email account created!');
        console.log('📧 Email:', testAccount.user);
        console.log('🔑 Password:', testAccount.pass);
        console.log('🌐 SMTP Server:', testAccount.smtp.host);
        console.log('🔌 Port:', testAccount.smtp.port);
        
        console.log('\n📝 Add these to your .env file:');
        console.log(`EMAIL_HOST=${testAccount.smtp.host}`);
        console.log(`EMAIL_PORT=${testAccount.smtp.port}`);
        console.log(`EMAIL_USER=${testAccount.user}`);
        console.log(`EMAIL_PASS=${testAccount.pass}`);
        
        return testAccount;
    } catch (error) {
        console.error('❌ Error creating test account:', error);
    }
}

// Run the function
createTestAccount();
