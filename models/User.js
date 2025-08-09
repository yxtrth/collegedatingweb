const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    profile: {
        bio: {
            type: String,
            maxlength: 500
        },
        age: {
            type: Number,
            min: 18,
            max: 30
        },
        college: {
            type: String,
            required: true
        },
        major: String,
        year: {
            type: String,
            enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
        },
        interests: [String],
        profilePicture: {
            type: String,
            default: ''
        },
        photos: {
            type: [String],
            default: []
        },
        location: {
            type: String
        },
        lookingFor: {
            type: String,
            enum: ['Friends', 'Dating', 'Serious Relationship', 'Study Partner'],
            default: 'Dating'
        }
    },
    preferences: {
        ageRange: {
            min: { type: Number, default: 18 },
            max: { type: Number, default: 25 }
        },
        distance: { type: Number, default: 50 }, // in miles
        interests: [String]
    },
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    },
    dislikes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);
