const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// In a real application, you would use a database
// This is just a simple in-memory store for demonstration
const pendingVerifications = new Map();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'new')));

// Routes
app.get('/api/auth/verify/:token', (req, res) => {
  const { token } = req.params;
  
  // In a real app, you'd verify against a database
  // For demo, we'll accept tokens that start with "valid"
  if (token.startsWith('valid')) {
    // Mark as verified in your database
    console.log(`Email verified with token: ${token}`);
    return res.json({ success: true, message: 'Email verified successfully' });
  }
  
  return res.status(400).json({ 
    success: false, 
    message: 'Invalid or expired verification token' 
  });
});

app.post('/api/auth/resend-verification', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  // In a real app, you would:
  // 1. Check if the email exists in your database
  // 2. Generate a new verification token
  // 3. Store it with an expiration time
  // 4. Send an email with the verification link
  
  console.log(`Verification email would be sent to: ${email}`);
  
  // For demo purposes, we'll just simulate success
  return res.json({ 
    success: true, 
    message: 'Verification email sent successfully' 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/verify-email.html?token=valid123 to test successful verification`);
  console.log(`Open http://localhost:${PORT}/verify-email.html?token=invalid to test failed verification`);
});
