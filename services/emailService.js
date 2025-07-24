const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email configuration
const createTransporter = () => {
    // Use environment variables for email configuration
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Generate verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
    try {
        const transporter = createTransporter();
        
        // Create verification URL
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const verificationUrl = `${baseUrl}/api/auth/verify/${token}`;
        
        // Email content
        const mailOptions = {
            from: '"CollegeDatingByYT" <noreply@collegedatingbyyt.com>',
            to: user.email,
            subject: 'Verify Your Email - CollegeDatingByYT',
            html: `
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CollegeDatingByYT! 💕</h1>
                        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">You're one step away from finding your campus connection</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
                        <h2 style="color: #333; margin-top: 0;">Hi ${user.name}! 👋</h2>
                        
                        <p>Thanks for joining CollegeDatingByYT! We're excited to help you find meaningful connections on your campus.</p>
                        
                        <p>To get started, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #4ecdc4); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                                Verify My Email 📧
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            If the button doesn't work, copy and paste this link in your browser:<br>
                            <a href="${verificationUrl}" style="color: #ff6b6b; word-break: break-all;">${verificationUrl}</a>
                        </p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #666;">
                                🎓 <strong>Pro tip:</strong> Make sure to complete your profile after verification to get the best matches from your campus!
                            </p>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
                        </p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
                        <p style="margin: 0; font-size: 12px; color: #999;">
                            © 2025 CollegeDatingByYT. Made with ❤️ for college students.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        // For development, return preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Verification email sent:', info.messageId);
        console.log('Preview URL:', previewUrl);
        
        return {
            success: true,
            messageId: info.messageId,
            previewUrl: previewUrl // This will be null in production
        };
        
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

// Send password reset email (for future use)
const sendPasswordResetEmail = async (user, token) => {
    try {
        const transporter = createTransporter();
        
        const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
        
        const mailOptions = {
            from: '"CollegeDatingByYT" <noreply@collegedatingbyyt.com>',
            to: user.email,
            subject: 'Reset Your Password - CollegeDatingByYT',
            html: `
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                    <h2>Password Reset Request</h2>
                    <p>Hi ${user.name},</p>
                    <p>You requested to reset your password. Click the link below to reset it:</p>
                    <a href="${resetUrl}" style="display: inline-block; background: #ff6b6b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
        
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    generateVerificationToken,
    sendVerificationEmail,
    sendPasswordResetEmail
};
