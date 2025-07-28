const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Match = require('../models/Match');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
// Send Message
router.post('/send', authenticateToken, [
    body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
    body('messageType').optional().isIn(['text', 'image', 'emoji']).withMessage('Invalid message type')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const senderId = req.user.userId;
        const { receiverId, content, messageType = 'text' } = req.body;
        // Check if both users exist
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }
        // Check if users are matched
        const match = await Match.findOne({
            $or: [
                { user1: senderId, user2: receiverId },
                { user1: receiverId, user2: senderId }
            ]
        });
        if (!match) {
            return res.status(403).json({ message: 'You can only message users you have matched with' });
        }
        // Create and save the message
        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            match: match._id,
            content,
            messageType
        });
        await newMessage.save();
        // Populate sender info for response
        await newMessage.populate('sender', 'name profile.profilePicture');
        res.status(201).json({
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending message' });
    }
});
// Get conversation between two users
router.get('/conversation/:matchId', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const matchId = req.params.matchId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        // Verify the user is part of this match
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        if (match.user1.toString() !== currentUserId && match.user2.toString() !== currentUserId) {
            return res.status(403).json({ message: 'Access denied to this conversation' });
        }
        // Get messages for this match
        const messages = await Message.find({
            match: matchId,
            isDeleted: false
        })
        .populate('sender', 'name profile.profilePicture')
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(skip);
        // Mark messages as read (where current user is receiver)
        await Message.updateMany({
            match: matchId,
            receiver: currentUserId,
            isRead: false
        }, {
            isRead: true,
            readAt: new Date()
        });
        // Reverse to show oldest first
        messages.reverse();
        res.status(200).json({
            messages,
            match: {
                id: match._id,
                matchedAt: match.matchedAt
            },
            pagination: {
                page,
                limit,
                hasMore: messages.length === limit
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching conversation' });
    }
});
// Get all conversations for current user
router.get('/conversations/all', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        // Get all matches for current user
        const matches = await Match.find({
            $or: [{ user1: currentUserId }, { user2: currentUserId }]
        }).populate('user1 user2', 'name profile.profilePicture profile.college');
        // Get the latest message for each match
        const conversations = await Promise.all(
            matches.map(async (match) => {
                const otherUser = match.user1._id.toString() === currentUserId ? match.user2 : match.user1;
                const latestMessage = await Message.findOne({
                    match: match._id,
                    isDeleted: false
                })
                .sort({ sentAt: -1 })
                .populate('sender', 'name');
                const unreadCount = await Message.countDocuments({
                    match: match._id,
                    receiver: currentUserId,
                    isRead: false,
                    isDeleted: false
                });
                return {
                    matchId: match._id,
                    matchedAt: match.matchedAt,
                    otherUser: {
                        id: otherUser._id,
                        name: otherUser.name,
                        profilePicture: otherUser.profile.profilePicture,
                        college: otherUser.profile.college
                    },
                    latestMessage: latestMessage ? {
                        content: latestMessage.content,
                        sentAt: latestMessage.sentAt,
                        senderName: latestMessage.sender.name,
                        isFromMe: latestMessage.sender._id.toString() === currentUserId
                    } : null,
                    unreadCount
                };
            })
        );
        // Sort by latest message time
        conversations.sort((a, b) => {
            const timeA = a.latestMessage ? new Date(a.latestMessage.sentAt) : new Date(a.matchedAt);
            const timeB = b.latestMessage ? new Date(b.latestMessage.sentAt) : new Date(b.matchedAt);
            return timeB - timeA;
        });
        res.status(200).json(conversations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});
// Mark messages as read
router.put('/mark-read/:matchId', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const matchId = req.params.matchId;
        // Verify the user is part of this match
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        if (match.user1.toString() !== currentUserId && match.user2.toString() !== currentUserId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        // Mark all unread messages as read
        const result = await Message.updateMany({
            match: matchId,
            receiver: currentUserId,
            isRead: false
        }, {
            isRead: true,
            readAt: new Date()
        });
        res.status(200).json({
            message: 'Messages marked as read',
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error marking messages as read' });
    }
});
// Delete a message
router.delete('/:messageId', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const messageId = req.params.messageId;
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        // Only sender can delete their message
        if (message.sender.toString() !== currentUserId) {
            return res.status(403).json({ message: 'You can only delete your own messages' });
        }
        // Soft delete
        message.isDeleted = true;
        await message.save();
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting message' });
    }
});
// Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const unreadCount = await Message.countDocuments({
            receiver: currentUserId,
            isRead: false,
            isDeleted: false
        });
        res.status(200).json({ unreadCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching unread count' });
    }
});
module.exports = router;
