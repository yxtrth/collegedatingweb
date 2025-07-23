# collegedatingweb by yath

A complete, production-ready dating platform designed exclusively for college students. Connect with people who understand your academic life and campus experience.

## Features

- **College-Only Access** - Exclusive registration with .edu email addresses
- **Smart Matching** - Tinder-style swipe interface with intelligent recommendations
- **Secure Messaging** - Real-time chat with matches in a safe environment
- **Rich Profiles** - Photos, bio, major, interests, and preferences
- **Real-time Notifications** - Get notified when someone likes you back
- **Mobile-Responsive** - Works perfectly on all devices

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, JWT, bcrypt, Multer
- **Frontend:** HTML5, CSS3, JavaScript, Font Awesome, Google Fonts
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens with bcrypt password hashing

## Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yxtrth/collegedatingweb.git
cd collegedatingweb
```

2. **Install dependencies:**
```bash
# Backend dependencies
cd new
npm install

# Frontend dependencies (if any)
cd ..
npm install
```

3. **Configure environment:**
Create a `.env` file in the `new` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collegedatingweb
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

4. **Start MongoDB:**
```bash
# Windows
net start MongoDB

# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas (cloud)
```

5. **Start the application:**
```bash
# Start backend server
cd new
npm start

# The frontend is served at http://localhost:5000
```

6. **Access the website:**
Open `http://localhost:5000` in your browser

## Project Structure

```
collegedatingweb/
├── index.html                  # Landing page
├── dashboard.html              # User dashboard
├── campuscrush-dashboard.js    # Dashboard functionality
├── campuscrush.js             # Landing page functionality
├── package.json               # Frontend dependencies
└── new/                       # Backend directory
    ├── app.js                 # Main server file
    ├── package.json           # Backend dependencies
    ├── .env                   # Environment variables
    ├── models/                # Database models
    │   ├── User.js            # User schema
    │   ├── Match.js           # Match schema
    │   └── Message.js         # Message schema
    ├── routes/                # API routes
    │   ├── auth.js            # Authentication
    │   ├── profile.js         # Profile management
    │   ├── match.js           # Matching system
    │   └── message.js         # Messaging system
    └── uploads/               # File uploads
        └── profiles/          # Profile pictures
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Profile Management
- `GET /api/profile/me/details` - Get user profile
- `PUT /api/profile/me/update` - Update profile
- `POST /api/profile/me/upload-photo` - Upload profile picture
- `GET /api/profile/me/discover` - Get potential matches

### Matching System
- `POST /api/match/like/:targetUserId` - Like a user
- `POST /api/match/dislike/:targetUserId` - Dislike a user
- `GET /api/match/me/matches` - Get all matches
- `GET /api/match/me/stats` - Get match statistics

### Messaging
- `POST /api/message/send` - Send a message
- `GET /api/message/conversation/:matchId` - Get conversation
- `GET /api/message/conversations/all` - Get all conversations

## How to Use

### For Users:
1. **Sign Up** - Register with your college .edu email
2. **Create Profile** - Add photos, bio, major, and interests
3. **Discover** - Swipe through potential matches
4. **Match** - Get connected when both users like each other
5. **Chat** - Start conversations with your matches

### For Developers:
1. **API Testing** - Use Postman or similar tools to test endpoints
2. **Database** - MongoDB collections: users, matches, messages
3. **Authentication** - JWT tokens required for protected routes
4. **File Uploads** - Profile pictures stored in `uploads/profiles/`

## Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Sanitized user inputs
- **College Verification** - .edu email requirement
- **Protected Routes** - Authentication required for sensitive operations
- **File Upload Security** - Restricted file types and sizes

## Deployment

### Backend (Heroku, Railway, DigitalOcean)
1. Set environment variables
2. Update MongoDB connection string
3. Configure file upload storage (consider Cloudinary)

### Frontend (Netlify, Vercel)
1. Update API base URLs
2. Deploy static files

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License

## Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure MongoDB is running
3. Verify all dependencies are installed
4. Check environment variables
5. Open an issue on GitHub

---

**Made with ❤️ for college students seeking meaningful connections** 
