const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Configure email transporter (using Gmail as example)
        this.transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-app-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });

        // For testing purposes, we'll use Ethereal Email (fake SMTP)
        if (!process.env.EMAIL_USER) {
            this.setupTestTransporter();
        }
    }

    async setupTestTransporter() {
        try {
            // Create test account for development
            const testAccount = await nodemailer.createTestAccount();
            
            this.transporter = nodemailer.createTransporter({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            
            console.log('📧 Test email account created');
            console.log('📧 Email User:', testAccount.user);
            console.log('📧 Email Pass:', testAccount.pass);
        } catch (error) {
            console.error('Failed to create test email account:', error);
        }
    }

    async sendVerificationEmail(email, name, verificationToken) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@collegedating.com',
            to: email,
            subject: '✨ Verify Your Email - College Dating Web',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #ff6b6b, #4ecdc4); padding: 30px; text-align: center; color: white; }
                        .content { padding: 30px; }
                        .button { display: inline-block; background: linear-gradient(135deg, #ff6b6b, #4ecdc4); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>💕 Welcome to College Dating Web!</h1>
                        </div>
                        <div class="content">
                            <h2>Hi ${name}! 👋</h2>
                            <p>Welcome to College Dating Web! We're excited to have you join our community of college students looking for meaningful connections.</p>
                            
                            <p>To get started and access all features, please verify your email address by clicking the button below:</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationUrl}" class="button">✅ Verify My Email</a>
                            </div>
                            
                            <p>Or copy and paste this link in your browser:</p>
                            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">${verificationUrl}</p>
                            
                            <p><strong>This link will expire in 24 hours</strong> for security reasons.</p>
                            
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                            
                            <h3>🎉 What's Next?</h3>
                            <ul>
                                <li>Complete your profile with photos and interests</li>
                                <li>Discover potential matches in your area</li>
                                <li>Connect with fellow college students</li>
                                <li>Start meaningful conversations</li>
                            </ul>
                            
                            <p>If you didn't create this account, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>College Dating Web | Making campus connections easier</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            
            if (process.env.NODE_ENV !== 'production') {
                console.log('📧 Verification email sent!');
                console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
            }
            
            return {
                success: true,
                messageId: info.messageId,
                previewUrl: nodemailer.getTestMessageUrl(info)
            };
        } catch (error) {
            console.error('Failed to send verification email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendWelcomeEmail(email, name) {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@collegedating.com',
            to: email,
            subject: '🎉 Welcome to College Dating Web!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #ff6b6b, #4ecdc4); padding: 30px; text-align: center; color: white; }
                        .content { padding: 30px; }
                        .button { display: inline-block; background: linear-gradient(135deg, #ff6b6b, #4ecdc4); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Email Verified Successfully!</h1>
                        </div>
                        <div class="content">
                            <h2>Congratulations ${name}! 🎊</h2>
                            <p>Your email has been successfully verified! You now have full access to College Dating Web.</p>
                            
                            <div style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" class="button">🚀 Start Exploring</a>
                            </div>
                            
                            <h3>💡 Quick Tips to Get Started:</h3>
                            <ul>
                                <li><strong>Complete Your Profile:</strong> Add photos, bio, and interests</li>
                                <li><strong>Discover People:</strong> Browse potential matches</li>
                                <li><strong>Be Authentic:</strong> Show your true personality</li>
                                <li><strong>Stay Safe:</strong> Always meet in public places</li>
                            </ul>
                            
                            <p>Happy dating! 💕</p>
                        </div>
                        <div class="footer">
                            <p>College Dating Web | Making campus connections easier</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
