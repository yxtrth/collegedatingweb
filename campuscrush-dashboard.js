// CampusCrush Dashboard JavaScript

class CampusCrushDashboard {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000/api' 
            : `${window.location.origin}/api`;
        this.token = localStorage.getItem('collegedatingbyyt_token');
        this.currentUser = null;
        this.interests = [];
        this.additionalPhotos = [];
        this.profileCompletion = 20;
        
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
