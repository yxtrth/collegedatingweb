// CampusCrush Frontend JavaScript
class CampusCrush {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('campuscrush_token');
        this.currentUser = null;
        this.init();
    }
    init() {
        // Check if user is logged in
        if (this.token) {
            this.getCurrentUser();
        }
        // Set up event listeners
        this.setupEventListeners();
    }
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        // Register form  
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
        // Profile update form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
        }
    }
    // API Helper Methods
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    // Authentication Methods
    async handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        try {
            const data = await this.apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password')
                })
            });
            this.token = data.token;
            localStorage.setItem('campuscrush_token', this.token);
            this.currentUser = data.user;
            this.showSuccess('Login successful!');
            this.redirectToDashboard();
        } catch (error) {
            this.showError(error.message);
        }
    }
    async handleRegister(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        try {
            const data = await this.apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    college: formData.get('college'),
                    age: parseInt(formData.get('age')),
                    major: formData.get('major'),
                    year: formData.get('year')
                })
            });
            this.token = data.token;
            localStorage.setItem('campuscrush_token', this.token);
            this.currentUser = data.user;
            this.showSuccess('Registration successful!');
            this.redirectToDashboard();
        } catch (error) {
            this.showError(error.message);
        }
    }
    async getCurrentUser() {
        try {
            const user = await this.apiCall('/auth/me');
            this.currentUser = user;
            this.updateUIForLoggedInUser();
        } catch (error) {
            console.error('Failed to get current user:', error);
            this.handleLogout();
        }
    }
    handleLogout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('campuscrush_token');
        window.location.href = 'index.html';
    }
    // Profile Methods
    async handleProfileUpdate(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        try {
            const updateData = {
                profile: {
                    bio: formData.get('bio'),
                    interests: formData.get('interests').split(',').map(i => i.trim()),
                    major: formData.get('major'),
                    year: formData.get('year'),
                    lookingFor: formData.get('lookingFor')
                }
            };
            const data = await this.apiCall('/profile/me/update', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            this.currentUser = data.user;
            this.showSuccess('Profile updated successfully!');
        } catch (error) {
            this.showError(error.message);
        }
    }
    // Discovery Methods
    async getDiscoverUsers() {
        try {
            const users = await this.apiCall('/profile/me/discover');
            this.displayDiscoverUsers(users);
        } catch (error) {
            this.showError('Failed to load discover users');
        }
    }
    async likeUser(userId) {
        try {
            const result = await this.apiCall(`/match/like/${userId}`, {
                method: 'POST'
            });
            if (result.isMatch) {
                this.showSuccess(`It's a match with ${result.matchedUser.name}! 🎉`);
            } else {
                this.showSuccess('User liked!');
            }
            // Remove the user card from discover
            this.removeUserCard(userId);
        } catch (error) {
            this.showError(error.message);
        }
    }
    async dislikeUser(userId) {
        try {
            await this.apiCall(`/match/dislike/${userId}`, {
                method: 'POST'
            });
            // Remove the user card from discover
            this.removeUserCard(userId);
        } catch (error) {
            this.showError(error.message);
        }
    }
    // Messaging Methods
    async getConversations() {
        try {
            const conversations = await this.apiCall('/message/conversations/all');
            this.displayConversations(conversations);
        } catch (error) {
            this.showError('Failed to load conversations');
        }
    }
    async getConversation(matchId) {
        try {
            const conversation = await this.apiCall(`/message/conversation/${matchId}`);
            this.displayConversation(conversation);
        } catch (error) {
            this.showError('Failed to load conversation');
        }
    }
    async sendMessage(matchId, content) {
        try {
            const message = await this.apiCall('/message/send', {
                method: 'POST',
                body: JSON.stringify({
                    receiverId: this.getReceiverId(matchId),
                    content: content
                })
            });
            this.appendMessageToConversation(message.data);
        } catch (error) {
            this.showError('Failed to send message');
        }
    }
    // UI Helper Methods
    updateUIForLoggedInUser() {
        const loginSection = document.getElementById('loginSection');
        const dashboardSection = document.getElementById('dashboardSection');
        if (loginSection) loginSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block';
        const userNameElement = document.getElementById('userName');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.name;
        }
    }
    redirectToDashboard() {
        // Create a simple dashboard redirect
        window.location.href = 'dashboard.html';
    }
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    showError(message) {
        this.showNotification(message, 'error');
    }
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background-color: #10b981;' : 'background-color: #ef4444;'}
        `;
        document.body.appendChild(notification);
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    displayDiscoverUsers(users) {
        const container = document.getElementById('discoverContainer');
        if (!container) return;
        container.innerHTML = users.map(user => `
            <div class="user-card" data-user-id="${user._id}">
                <div class="user-photo">
                    <img src="${user.profile.profilePicture || 'https://via.placeholder.com/300x400'}" alt="${user.name}">
                </div>
                <div class="user-info">
                    <h3>${user.name}, ${user.profile.age}</h3>
                    <p class="college">${user.profile.college}</p>
                    <p class="major">${user.profile.major || 'Undeclared'}</p>
                    <p class="bio">${user.profile.bio || 'No bio yet'}</p>
                </div>
                <div class="user-actions">
                    <button class="dislike-btn" onclick="app.dislikeUser('${user._id}')">❌</button>
                    <button class="like-btn" onclick="app.likeUser('${user._id}')">❤️</button>
                </div>
            </div>
        `).join('');
    }
    removeUserCard(userId) {
        const userCard = document.querySelector(`[data-user-id="${userId}"]`);
        if (userCard) {
            userCard.style.transform = 'translateX(100%)';
            setTimeout(() => userCard.remove(), 300);
        }
    }
    displayConversations(conversations) {
        const container = document.getElementById('conversationsContainer');
        if (!container) return;
        container.innerHTML = conversations.map(conv => `
            <div class="conversation-item" onclick="app.openConversation('${conv.matchId}')">
                <img src="${conv.otherUser.profilePicture || 'https://via.placeholder.com/50'}" alt="${conv.otherUser.name}">
                <div class="conversation-info">
                    <h4>${conv.otherUser.name}</h4>
                    <p class="last-message">${conv.latestMessage?.content || 'Start a conversation!'}</p>
                </div>
                ${conv.unreadCount > 0 ? `<span class="unread-badge">${conv.unreadCount}</span>` : ''}
            </div>
        `).join('');
    }
    openConversation(matchId) {
        // Store current match ID and load conversation
        this.currentMatchId = matchId;
        this.getConversation(matchId);
        // Show conversation view
        const conversationsView = document.getElementById('conversationsView');
        const chatView = document.getElementById('chatView');
        if (conversationsView) conversationsView.style.display = 'none';
        if (chatView) chatView.style.display = 'block';
    }
    displayConversation(conversation) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        container.innerHTML = conversation.messages.map(msg => `
            <div class="message ${msg.sender._id === this.currentUser.id ? 'sent' : 'received'}">
                <div class="message-content">${msg.content}</div>
                <div class="message-time">${new Date(msg.sentAt).toLocaleTimeString()}</div>
            </div>
        `).join('');
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
}
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CampusCrush();
});
