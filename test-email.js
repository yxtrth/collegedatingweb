// Load environment variables
require('dotenv').config();

const { sendVerificationEmail, generateVerificationToken } = require('./services/emailService');

// Test email functionality
async function testEmail() {
    console.log('🧪 Testing email functionality...');
    console.log('📧 Email Host:', process.env.EMAIL_HOST);
    console.log('👤 Email User:', process.env.EMAIL_USER);
    
    try {
        // Create a test user object
        const testUser = {
            name: 'Test User',
            email: 'test@example.com' // You can change this to your actual email for testing
        };
        
        // Generate a test token
        const testToken = generateVerificationToken();
        console.log('🔑 Generated token:', testToken);
        
        // Send test email
        console.log('📨 Sending test verification email...');
        const result = await sendVerificationEmail(testUser, testToken);
        
        console.log('✅ Email sent successfully!');
        console.log('📬 Message ID:', result.messageId);
        
        if (result.previewUrl) {
            console.log('🔍 Preview URL:', result.previewUrl);
            console.log('\n👆 Click the preview URL above to see the email in your browser!');
        }
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
    }
}

// Run the test
testEmail();
