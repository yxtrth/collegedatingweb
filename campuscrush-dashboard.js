// CampusCrush Dashboard JavaScript
class CampusCrushDashboard {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000/api' 
            : window.location.origin + '/api';
            : `${window.location.origin}/api`;
        this.token = localStorage.getItem('collegedatingbyyt_token');
        this.currentUser = null;
        this.interests = [];
        this.additionalPhotos = [];
        this.profileCompletion = 20;
        this.hasShownIncompleteWarning = false;
        this.init();
    }
    async init() {
        // Check authentication
        if (!this.token) {
            window.location.href = 'index.html';
            return;
        }
        try {
            await this.getCurrentUser();
            this.updateUI();
            this.setupEventListeners();
            this.initializePhotoSlots();
            this.calculateProgress();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.logout();
        }
    }
    // API Helper Methods
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                ...options.headers
            },
            ...options
        };
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
    async getCurrentUser() {
        try {
            const user = await this.apiCall('/auth/me');
            this.currentUser = user;
            return user;
        } catch (error) {
            throw new Error('Failed to get current user');
        }
    }
    logout() {
        localStorage.removeItem('collegedatingbyyt_token');
        window.location.href = 'index.html';
    }
    // UI Methods
    updateUI() {
        if (this.currentUser) {
            const userName = document.getElementById('userName');
            const userAvatar = document.getElementById('userAvatar');
            if (userName) userName.textContent = this.currentUser.name;
            if (userAvatar) userAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
            // Populate form fields with existing data
            this.populateFormFields();
        }
    }
    populateFormFields() {
        if (!this.currentUser.profile) return;
        const profile = this.currentUser.profile;
        // Basic info form
        const basicForm = document.getElementById('basicInfoForm');
        if (basicForm && profile) {
            if (profile.bio) basicForm.bio.value = profile.bio;
            if (profile.major) basicForm.major.value = profile.major;
            if (profile.year) basicForm.year.value = profile.year;
            if (profile.lookingFor) basicForm.lookingFor.value = profile.lookingFor;
        }
        // Interests
        if (profile.interests && profile.interests.length > 0) {
            this.interests = [...profile.interests];
            this.updateInterestsDisplay();
        }
        // Profile photo
        if (profile.profilePicture) {
            this.displayProfilePhoto(profile.profilePicture);
        }
        // Additional photos
        if (profile.photos && profile.photos.length > 0) {
            this.additionalPhotos = [...profile.photos];
            this.updateAdditionalPhotosDisplay();
        }
        // Preferences
        if (this.currentUser.preferences) {
            const prefs = this.currentUser.preferences;
            const prefForm = document.getElementById('preferencesForm');
            if (prefForm) {
                if (prefs.ageRange) {
                    if (prefForm.ageMin) prefForm.ageMin.value = prefs.ageRange.min;
                    if (prefForm.ageMax) prefForm.ageMax.value = prefs.ageRange.max;
                }
                if (prefs.distance && prefForm.distance) {
                    prefForm.distance.value = prefs.distance;
                    this.updateDistanceValue(prefs.distance);
                }
            }
        }
    }
    setupEventListeners() {
        // Basic info form
        const basicInfoForm = document.getElementById('basicInfoForm');
        if (basicInfoForm) {
            basicInfoForm.addEventListener('submit', this.handleBasicInfoSubmit.bind(this));
        }
        // Preferences form
        const preferencesForm = document.getElementById('preferencesForm');
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', this.handlePreferencesSubmit.bind(this));
        }
        // Interest input enter key
        const interestInput = document.getElementById('interestInput');
        if (interestInput) {
            interestInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addInterest();
                }
            });
        }
        // Profile photo click
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        if (profilePhotoPreview) {
            profilePhotoPreview.addEventListener('click', () => {
                document.getElementById('profilePhotoInput').click();
            });
        }
    }
    // Navigation
    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.add('hidden'));
        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        // Update navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        const activeNavItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        // Load section-specific content
        switch (sectionName) {
            case 'discover':
                this.loadDiscoverUsers();
                break;
            case 'matches':
                this.loadMatches();
                break;
            case 'messages':
                this.loadConversations();
                break;
        }
    }
    // Form Handlers
    async handleBasicInfoSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        try {
            const updateData = {
                profile: {
                    bio: formData.get('bio'),
                    major: formData.get('major'),
                    year: formData.get('year'),
                    lookingFor: formData.get('lookingFor')
                }
            };
            const response = await this.apiCall('/profile/me/update', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            this.currentUser = response.user;
            this.showSuccess('Basic information updated successfully!');
            this.calculateProgress();
        } catch (error) {
            this.showError(error.message);
        }
    }
    async handlePreferencesSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        try {
            const updateData = {
                preferences: {
                    ageRange: {
                        min: parseInt(formData.get('ageMin')) || 18,
                        max: parseInt(formData.get('ageMax')) || 25
                    },
                    distance: parseInt(formData.get('distance')) || 25,
                    interestedIn: formData.get('interestedIn')
                }
            };
            const response = await this.apiCall('/profile/me/update', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            this.currentUser = response.user;
            this.showSuccess('Preferences updated successfully!');
            this.calculateProgress();
        } catch (error) {
            this.showError(error.message);
        }
    }
    // Interests Management
    addInterest() {
        const interestInput = document.getElementById('interestInput');
        const interest = interestInput.value.trim();
        if (interest && !this.interests.includes(interest)) {
            this.interests.push(interest);
            this.updateInterestsDisplay();
            this.saveInterests();
            interestInput.value = '';
        }
    }
    removeInterest(interest) {
        this.interests = this.interests.filter(i => i !== interest);
        this.updateInterestsDisplay();
        this.saveInterests();
    }
    updateInterestsDisplay() {
        const container = document.getElementById('interestsContainer');
        if (!container) return;
        container.innerHTML = this.interests.map(interest => `
            <div class="interest-tag">
                ${interest}
                <span class="remove" onclick="app.removeInterest('${interest}')">&times;</span>
            </div>
        `).join('');
    }
    async saveInterests() {
        try {
            const updateData = {
                profile: {
                    interests: this.interests
                }
            };
            const response = await this.apiCall('/profile/me/update', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            this.currentUser = response.user;
            this.calculateProgress();
        } catch (error) {
            console.error('Failed to save interests:', error);
        }
    }
    // Photo Management
    initializePhotoSlots() {
        const container = document.getElementById('additionalPhotos');
        if (!container) return;
        // Create 5 photo slots
        for (let i = 0; i < 5; i++) {
            const slot = document.createElement('div');
            slot.className = 'photo-slot';
            slot.innerHTML = `
                <div class="photo-placeholder">
                    <i class="fas fa-plus"></i>
                    <p>Add Photo</p>
                </div>
            `;
            slot.onclick = () => this.selectPhotoSlot(i);
            container.appendChild(slot);
        }
    }
    previewProfilePhoto(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.displayProfilePhoto(e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
            // Upload the photo
            this.uploadProfilePhoto(input.files[0]);
        }
    }
    displayProfilePhoto(imageSrc) {
        const preview = document.getElementById('profilePhotoPreview');
        if (preview) {
            preview.innerHTML = `<img src="${imageSrc}" alt="Profile Photo">`;
        }
    }
    async uploadProfilePhoto(file) {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            const response = await fetch(`${this.baseURL}/profile/me/upload-photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });
            if (!response.ok) {
                throw new Error('Failed to upload photo');
            }
            const data = await response.json();
            this.showSuccess('Profile picture uploaded successfully!');
            this.calculateProgress();
        } catch (error) {
            this.showError('Failed to upload profile picture: ' + error.message);
        }
    }
    selectPhotoSlot(index) {
        this.selectedPhotoSlot = index;
        document.getElementById('additionalPhotoInput').click();
    }
    addAdditionalPhotos(input) {
        if (input.files && input.files.length > 0) {
            Array.from(input.files).forEach((file, index) => {
                if (this.additionalPhotos.length < 5) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.additionalPhotos.push(e.target.result);
                        this.updateAdditionalPhotosDisplay();
                    };
                    reader.readAsDataURL(file);
                }
            });
            // Upload photos
            this.uploadAdditionalPhotos(input.files);
        }
    }
    updateAdditionalPhotosDisplay() {
        const slots = document.querySelectorAll('#additionalPhotos .photo-slot');
        slots.forEach((slot, index) => {
            if (this.additionalPhotos[index]) {
                slot.innerHTML = `
                    <img src="${this.additionalPhotos[index]}" alt="Photo ${index + 1}">
                    <button class="remove-photo" onclick="app.removeAdditionalPhoto(${index})">&times;</button>
                `;
            } else {
                slot.innerHTML = `
                    <div class="photo-placeholder">
                        <i class="fas fa-plus"></i>
                        <p>Add Photo</p>
                    </div>
                `;
            }
        });
    }
    removeAdditionalPhoto(index) {
        this.additionalPhotos.splice(index, 1);
        this.updateAdditionalPhotosDisplay();
        // TODO: Call API to remove photo from server
    }
    async uploadAdditionalPhotos(files) {
        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('photos', file);
            });
            const response = await fetch(`${this.baseURL}/profile/me/upload-photos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });
            if (!response.ok) {
                throw new Error('Failed to upload photos');
            }
            const data = await response.json();
            this.showSuccess('Photos uploaded successfully!');
            this.calculateProgress();
        } catch (error) {
            this.showError('Failed to upload photos: ' + error.message);
        }
    }
    // Progress Calculation
    calculateProgress() {
        let progress = 20; // Base progress for account creation
        if (this.currentUser && this.currentUser.profile) {
            const profile = this.currentUser.profile;
            // Basic info (30%)
            if (profile.bio && profile.bio.length > 20) progress += 10;
            if (profile.major) progress += 5;
            if (profile.year) progress += 5;
            if (profile.lookingFor) progress += 10;
            // Profile photo (20%)
            if (profile.profilePicture) progress += 20;
            // Interests (15%)
            if (profile.interests && profile.interests.length >= 3) progress += 15;
            else if (profile.interests && profile.interests.length > 0) progress += 5;
            // Additional photos (10%)
            if (profile.photos && profile.photos.length >= 2) progress += 10;
            else if (profile.photos && profile.photos.length > 0) progress += 5;
            // Preferences (5%)
            if (this.currentUser.preferences && this.currentUser.preferences.ageRange) progress += 5;
        }
        this.profileCompletion = Math.min(progress, 100);
        this.updateProgressDisplay();
    }
    updateProgressDisplay() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        if (progressFill) {
            progressFill.style.width = `${this.profileCompletion}%`;
        }
        if (progressText) {
            progressText.textContent = `${this.profileCompletion}%`;
        }
    }
    // Utility Methods
    updateDistanceValue(value) {
        const distanceValue = document.getElementById('distanceValue');
        if (distanceValue) {
            distanceValue.textContent = `${value} miles`;
        }
    }
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    showError(message) {
        this.showNotification(message, 'error');
    }
    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());
        // Create notification
        const notification = document.createElement('div');
        notification.className = `message ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            ${message}
        `;
        // Add to top of content
        const content = document.querySelector('.content');
        if (content) {
            content.insertBefore(notification, content.firstChild);
            // Auto remove after 5 seconds
            setTimeout(() => notification.remove(), 5000);
        }
    }
    // Content Loading Methods
    async loadDiscoverUsers() {
        console.log('🔍 Loading discover users...');
        const container = document.getElementById('discoverContainer');
        if (!container) {
            console.error('❌ discoverContainer not found');
            return;
        }
        try {
            // Show loading state
            container.innerHTML = '<div class="loading">Loading potential matches...</div>';
            console.log('📡 Making API call to /match/discover...');
            // Check if profile is incomplete and show encouragement banner
            const profileIncomplete = false; // Temporarily disable profile completion check
            console.log('📊 Profile completion:', this.profileCompletion, '% - Incomplete:', profileIncomplete);
            // Fetch potential matches
            const response = await this.apiCall('/match/discover');
            console.log('✅ API response received:', response);
            const users = response.users || response; // Handle both response formats
            console.log('👥 Users for discovery:', users.length);
            if (users.length === 0) {
                container.innerHTML = `
                    <div class="profile-section">
                        <div class="empty-state">
                            <i class="fas fa-search" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                            <h3>No more people to discover right now</h3>
                            <p>You've seen everyone available! Check back later for new users, or complete your profile to get better matches.</p>
                            ${profileIncomplete ? `
                                <button class="btn btn-primary" onclick="app.showSection('profile')">
                                    <i class="fas fa-user-edit"></i> Complete Your Profile
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
                return;
            }
            // Show profile completion banner if incomplete
            const profileBanner = profileIncomplete ? `
                <div class="profile-incomplete-banner">
                    <div class="banner-content">
                        <i class="fas fa-info-circle"></i>
                        <div class="banner-text">
                            <h4>Complete your profile for better matches!</h4>
                            <p>Profile completion: ${this.profileCompletion}% - Add photos and interests to attract more people</p>
                        </div>
                        <button class="btn btn-outline" onclick="app.showSection('profile')">Complete Profile</button>
                    </div>
                </div>
            ` : '';
            // Create discovery interface
            container.innerHTML = `
                ${profileBanner}
                <div class="discovery-interface">
                    <div class="discover-card-container">
                        <div class="discover-card" id="currentCard">
                            <!-- User card will be loaded here -->
                        </div>
                    </div>
                    <div class="discover-actions">
                        <button class="action-btn dislike-btn" onclick="app.handleSwipe('dislike')" title="Pass">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="action-btn super-like-btn" onclick="app.handleSwipe('superlike')" title="Super Like">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="action-btn like-btn" onclick="app.handleSwipe('like')" title="Like">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="discover-info">
                        <p><span id="currentIndex">1</span> of <span id="totalCount">${users.length}</span> people</p>
                        ${profileIncomplete ? '<p class="tip">💡 Tip: Complete your profile to see more compatible matches!</p>' : ''}
                    </div>
                </div>
            `;
            // Store users and show first one
            this.discoveryUsers = users;
            this.currentDiscoveryIndex = 0;
            this.showDiscoveryCard();
        } catch (error) {
            console.error('❌ Error loading discovery users:', error);
            console.error('Token:', this.token ? 'Present' : 'Missing');
            console.error('Base URL:', this.baseURL);
            container.innerHTML = `
                <div class="profile-section">
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
                        <h3>Unable to load matches</h3>
                        <p>Error: ${error.message || 'Unknown error occurred'}</p>
                        <p>Please check the browser console for more details.</p>
                        <div class="error-actions">
                            <button class="btn btn-primary" onclick="app.loadDiscoverUsers()">Try Again</button>
                            <button class="btn btn-outline" onclick="app.showSection('profile')">Complete Profile</button>
                        </div>
                    </div>
    // Content Loading Methods (placeholders for future implementation)
    async loadDiscoverUsers() {
        const container = document.getElementById('discoverContainer');
        if (container) {
            container.innerHTML = `
                <div class="profile-section">
                    <p>Discover feature coming soon! Complete your profile to start finding matches.</p>
                </div>
            `;
        }
    }
    showDiscoveryCard() {
        if (!this.discoveryUsers || this.currentDiscoveryIndex >= this.discoveryUsers.length) {
            this.loadDiscoverUsers(); // Reload when no more users
            return;
        }
        const user = this.discoveryUsers[this.currentDiscoveryIndex];
        const cardContainer = document.getElementById('currentCard');
        if (!cardContainer) return;
        // Calculate age from birth date or use profile age
        const age = user.profile?.age || user.age || 'N/A';
        const interests = user.profile?.interests || [];
        cardContainer.innerHTML = `
            <div class="discovery-card-inner">
                <div class="discovery-photo">
                    ${user.profile?.profilePhoto 
                        ? `<img src="/api/profile/photo/${user.profile.profilePhoto}" alt="${user.name}">`
                        : `<div class="photo-placeholder">
                               <i class="fas fa-user"></i>
                               <p>No Photo</p>
                           </div>`
                    }
                </div>
                <div class="discovery-info-overlay">
                    <div class="discovery-main-info">
                        <h2>${user.name}, ${age}</h2>
                        <p class="discovery-college">
                            <i class="fas fa-graduation-cap"></i>
                            ${user.profile?.major || 'Student'} • ${user.profile?.year || 'N/A'}
                        </p>
                    </div>
                    ${user.profile?.bio ? `<p class="discovery-bio">"${user.profile.bio}"</p>` : ''}
                    ${interests.length > 0 ? `
                        <div class="discovery-interests">
                            ${interests.slice(0, 3).map(interest => 
                                `<span class="interest-tag">${interest}</span>`
                            ).join('')}
                            ${interests.length > 3 ? `<span class="interest-more">+${interests.length - 3} more</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        // Update counter
        const currentIndexEl = document.getElementById('currentIndex');
        if (currentIndexEl) {
            currentIndexEl.textContent = this.currentDiscoveryIndex + 1;
        }
    }
    async handleSwipe(action) {
        if (!this.discoveryUsers || this.currentDiscoveryIndex >= this.discoveryUsers.length) {
            return;
        }
        const currentUser = this.discoveryUsers[this.currentDiscoveryIndex];
        // Show gentle reminder for incomplete profiles on first swipe
        if (this.profileCompletion < 50 && !this.hasShownIncompleteWarning) {
            this.hasShownIncompleteWarning = true;
            this.showProfileIncompleteReminder();
        }
        try {
            if (action === 'like' || action === 'superlike') {
                const response = await this.apiCall(`/match/like/${currentUser._id}`, {
                    method: 'POST'
                });
                // Show match notification if it's a match
                if (response.isMatch) {
                    this.showMatchNotification(currentUser);
                } else {
                    this.showLikeNotification();
                }
            } else if (action === 'dislike') {
                await this.apiCall(`/match/dislike/${currentUser._id}`, {
                    method: 'POST'
                });
            }
            // Move to next user
            this.currentDiscoveryIndex++;
            // Add swipe animation
            const card = document.getElementById('currentCard');
            if (card) {
                card.style.transform = action === 'like' || action === 'superlike' ? 'translateX(100%)' : 'translateX(-100%)';
                card.style.opacity = '0';
                setTimeout(() => {
                    this.showDiscoveryCard();
                    card.style.transform = 'translateX(0)';
                    card.style.opacity = '1';
                }, 300);
            } else {
                this.showDiscoveryCard();
            }
        } catch (error) {
            console.error('Error handling swipe:', error);
            this.showMessage('Error processing your action. Please try again.', 'error');
        }
    }
    showProfileIncompleteReminder() {
        const reminder = document.createElement('div');
        reminder.className = 'profile-reminder-popup';
        reminder.innerHTML = `
            <div class="reminder-content">
                <h3>🎉 Great start!</h3>
                <p>You can browse and like people now, but completing your profile will help you get more matches!</p>
                <div class="reminder-actions">
                    <button class="btn btn-primary" onclick="app.showSection('profile'); this.parentElement.parentElement.parentElement.remove();">
                        Complete Profile Now
                    </button>
                    <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove();">
                        Keep Browsing
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(reminder);
        // Auto remove after 8 seconds
        setTimeout(() => {
            if (reminder.parentElement) {
                reminder.remove();
            }
        }, 8000);
    }
    showMatchNotification(user) {
        const notification = document.createElement('div');
        notification.className = 'match-notification';
        notification.innerHTML = `
            <div class="match-content">
                <h2>🎉 It's a Match! 🎉</h2>
                <p>You and ${user.name} liked each other!</p>
                <div class="match-actions">
                    <button class="btn btn-primary" onclick="app.showSection('messages')">Send Message</button>
                    <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()">Keep Swiping</button>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    showLikeNotification() {
        const notification = document.createElement('div');
        notification.className = 'like-notification';
        notification.innerHTML = '<p>👍 Liked! Maybe they\'ll like you back!</p>';
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 2000);
    }
    async loadMatches() {
        const container = document.getElementById('matchesContainer');
        if (!container) return;
        try {
            container.innerHTML = '<div class="loading">Loading your matches...</div>';
            const matches = await this.apiCall('/match/me/matches');
            if (matches.length === 0) {
                container.innerHTML = `
                    <div class="profile-section">
                        <div class="empty-state">
                            <i class="fas fa-fire" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                            <h3>No matches yet</h3>
                            <p>Start swiping in the Discover section to find your perfect match!</p>
                            <button class="btn btn-primary" onclick="app.showSection('discover')">Start Discovering</button>
                        </div>
                    </div>
                `;
                return;
            }
            // Display matches
            const matchesHTML = matches.map(match => `
                <div class="match-card">
                    <div class="match-photo">
                        ${match.user.profile?.profilePhoto 
                            ? `<img src="/api/profile/photo/${match.user.profile.profilePhoto}" alt="${match.user.name}">`
                            : `<div class="photo-placeholder">
                                   <i class="fas fa-user"></i>
                               </div>`
                        }
                    </div>
                    <div class="match-info">
                        <h4>${match.user.name}</h4>
                        <p>${match.user.profile?.major || 'Student'}</p>
                        <small>Matched ${new Date(match.createdAt).toLocaleDateString()}</small>
                    </div>
                    <button class="btn btn-primary" onclick="app.startConversation('${match.user._id}')">
                        Message
                    </button>
                </div>
            `).join('');
            container.innerHTML = `
                <div class="matches-grid">
                    ${matchesHTML}
                </div>
            `;
        } catch (error) {
            console.error('Error loading matches:', error);
            container.innerHTML = `
                <div class="profile-section">
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
                        <h3>Unable to load matches</h3>
                        <p>Please try again later.</p>
                        <button class="btn btn-primary" onclick="app.loadMatches()">Try Again</button>
                    </div>
    async loadMatches() {
        const container = document.getElementById('matchesContainer');
        if (container) {
            container.innerHTML = `
                <div class="profile-section">
                    <p>You don't have any matches yet. Complete your profile and start discovering people!</p>
                </div>
            `;
        }
    }
    async loadConversations() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.innerHTML = `
                <div class="profile-section">
                    <p>No conversations yet. Start matching with people to begin chatting!</p>
                </div>
            `;
        }
    }
}
// Global functions for HTML onclick events
function showSection(sectionName) {
    if (window.app) {
        window.app.showSection(sectionName);
    }
}
function logout() {
    if (window.app) {
        window.app.logout();
    }
}
function addInterest() {
    if (window.app) {
        window.app.addInterest();
    }
}
function previewProfilePhoto(input) {
    if (window.app) {
        window.app.previewProfilePhoto(input);
    }
}
function addAdditionalPhotos(input) {
    if (window.app) {
        window.app.addAdditionalPhotos(input);
    }
}
function updateDistanceValue(value) {
    if (window.app) {
        window.app.updateDistanceValue(value);
    }
}
// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CampusCrushDashboard();
});
