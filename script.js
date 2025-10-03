// CivicConnect Platform JavaScript
// Comprehensive civic engagement platform with offline capabilities

class CivicConnectApp {
    constructor() {
        this.currentUser = null;
        this.isOffline = false;
        this.reports = [];
        this.drafts = [];
        this.analytics = {};
        this.stakeholders = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkOnlineStatus();
        this.loadFromLocalStorage();
        this.generateMockData();
        this.updateDashboard();
        this.setupOfflineCapabilities();
        this.initializeRegistration();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(item.dataset.section);
            });
        });

        // Report Form
        const reportForm = document.getElementById('reportForm');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReport();
            });
        }

        // Location button
        const locationBtn = document.getElementById('getLocationBtn');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }

        // Save draft button
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                this.saveDraft();
            });
        }

        // Search and filters
        const searchReports = document.getElementById('searchReports');
        const statusFilter = document.getElementById('statusFilter');
        const categoryFilter = document.getElementById('categoryFilter');

        if (searchReports) {
            searchReports.addEventListener('input', () => this.filterReports());
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterReports());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterReports());
        }

        // Accessibility settings
        this.setupAccessibilitySettings();

        // Registration modal
        this.setupRegistrationModal();

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Online/offline status
        window.addEventListener('online', () => this.updateOnlineStatus(true));
        window.addEventListener('offline', () => this.updateOnlineStatus(false));
    }

    // Navigation System
    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to clicked nav item
        const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Load section-specific data
        this.loadSectionData(sectionId);
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'track':
                this.displayReports();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
            case 'stakeholders':
                this.displayStakeholders();
                break;
            default:
                break;
        }
    }

    // Data Flow: Input → Validation → Routing → Resolution → Feedback
    
    // INPUT: Form data collection
    collectReportData() {
        return {
            id: this.generateId(),
            title: document.getElementById('issueTitle').value,
            category: document.getElementById('issueCategory').value,
            priority: document.getElementById('priority').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            evidence: this.getEvidenceFiles(),
            isPublic: document.getElementById('publicReport').checked,
            isAnonymous: document.getElementById('anonymousReport').checked,
            submittedBy: this.isOffline ? 'offline_user' : this.currentUser?.id,
            submittedAt: new Date().toISOString(),
            status: 'submitted',
            timeline: [{
                status: 'submitted',
                date: new Date().toISOString(),
                description: 'Report submitted by citizen'
            }]
        };
    }

    // VALIDATION: Data validation and sanitization
    validateReportData(data) {
        const errors = [];

        if (!data.title || data.title.trim().length < 5) {
            errors.push('Title must be at least 5 characters long');
        }

        if (!data.category) {
            errors.push('Please select a category');
        }

        if (!data.description || data.description.trim().length < 20) {
            errors.push('Description must be at least 20 characters long');
        }

        // Sanitize inputs
        data.title = this.sanitizeInput(data.title);
        data.description = this.sanitizeInput(data.description);
        data.location = this.sanitizeInput(data.location);

        return { isValid: errors.length === 0, errors, data };
    }

    sanitizeInput(input) {
        if (!input) return '';
        return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    // ROUTING: Route to appropriate authority based on category
    routeReport(report) {
        const routingRules = {
            'infrastructure': 'Municipal Public Works Department',
            'public-safety': 'Police Department',
            'environment': 'Environmental Protection Agency',
            'transportation': 'Transportation Department',
            'public-services': 'Municipal Services',
            'corruption': 'Anti-Corruption Commission',
            'accessibility': 'Disability Rights Office',
            'other': 'General Administration'
        };

        report.assignedTo = routingRules[report.category] || 'General Administration';
        report.routedAt = new Date().toISOString();
        
        report.timeline.push({
            status: 'routed',
            date: report.routedAt,
            description: `Report routed to ${report.assignedTo}`
        });

        return report;
    }

    // Report Submission Process
    async submitReport() {
        try {
            const data = this.collectReportData();
            const validation = this.validateReportData(data);

            if (!validation.isValid) {
                this.showNotification('error', 'Validation Error', validation.errors.join(', '));
                return;
            }

            // Route the report
            const routedReport = this.routeReport(validation.data);

            // Save to local storage (offline capability)
            this.reports.push(routedReport);
            this.saveToLocalStorage();

            // Simulate routing process
            setTimeout(() => {
                this.updateReportStatus(routedReport.id, 'under-review', 'Report is being reviewed by authorities');
            }, 2000);

            // Clear form
            this.clearReportForm();

            // Show success notification
            this.showNotification('success', 'Report Submitted', 
                `Your report has been submitted with ID: ${routedReport.id.substring(0, 8)}. You can track its progress in the tracking section.`);

            // Navigate to tracking
            this.navigateToSection('track');

        } catch (error) {
            console.error('Error submitting report:', error);
            this.showNotification('error', 'Submission Failed', 'There was an error submitting your report. Please try again.');
        }
    }

    // RESOLUTION: Simulate resolution process
    updateReportStatus(reportId, newStatus, description) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            report.status = newStatus;
            report.timeline.push({
                status: newStatus,
                date: new Date().toISOString(),
                description: description
            });

            this.saveToLocalStorage();
            this.updateDashboard();
            
            // FEEDBACK: Notify user of status change
            if (newStatus === 'resolved') {
                this.showNotification('success', 'Issue Resolved', 
                    `Your report "${report.title}" has been resolved.`);
            }
        }
    }

    // Mock resolution simulation
    simulateResolution() {
        const pendingReports = this.reports.filter(r => 
            ['submitted', 'under-review', 'in-progress'].includes(r.status)
        );

        pendingReports.forEach((report, index) => {
            setTimeout(() => {
                const statuses = ['under-review', 'in-progress', 'resolved'];
                const currentIndex = statuses.indexOf(report.status);
                if (currentIndex < statuses.length - 1) {
                    const nextStatus = statuses[currentIndex + 1];
                    const descriptions = {
                        'under-review': 'Report is being reviewed by authorities',
                        'in-progress': 'Authorities have started working on this issue',
                        'resolved': 'Issue has been successfully resolved'
                    };
                    this.updateReportStatus(report.id, nextStatus, descriptions[nextStatus]);
                }
            }, (index + 1) * 10000); // Stagger updates
        });
    }

    // Draft Management
    saveDraft() {
        const data = this.collectReportData();
        data.isDraft = true;
        data.savedAt = new Date().toISOString();

        this.drafts.push(data);
        this.saveToLocalStorage();

        this.showNotification('info', 'Draft Saved', 'Your report has been saved as a draft.');
    }

    // Location Services
    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // In a real app, you would reverse geocode these coordinates
                    document.getElementById('location').value = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
                    this.showNotification('success', 'Location Found', 'Current location has been added to the report.');
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    this.showNotification('error', 'Location Error', 'Unable to get your current location.');
                }
            );
        } else {
            this.showNotification('error', 'Not Supported', 'Geolocation is not supported by this browser.');
        }
    }

    // File Handling
    getEvidenceFiles() {
        const fileInput = document.getElementById('evidence');
        const files = [];
        
        if (fileInput && fileInput.files) {
            for (let i = 0; i < fileInput.files.length; i++) {
                files.push({
                    name: fileInput.files[i].name,
                    size: fileInput.files[i].size,
                    type: fileInput.files[i].type,
                    lastModified: fileInput.files[i].lastModified
                });
            }
        }
        
        return files;
    }

    // Report Display and Filtering
    displayReports() {
        const container = document.getElementById('reportsContainer');
        if (!container) return;

        if (this.reports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No Reports Yet</h3>
                    <p>Submit your first report to start tracking issues in your community.</p>
                    <button class="btn btn-primary" onclick="app.navigateToSection('report')">
                        <i class="fas fa-plus"></i> Create Report
                    </button>
                </div>
            `;
            return;
        }

        const filteredReports = this.getFilteredReports();
        
        container.innerHTML = filteredReports.map(report => `
            <div class="report-item">
                <div class="report-header">
                    <div>
                        <h3 class="report-title">${report.title}</h3>
                        <p class="report-id">ID: ${report.id.substring(0, 8)}</p>
                    </div>
                    <span class="status-badge status-${report.status.replace(/[^a-z]/g, '-')}">${this.formatStatus(report.status)}</span>
                </div>
                
                <div class="report-details">
                    <div class="detail-item">
                        <span class="detail-label">Category</span>
                        <span class="detail-value">${this.formatCategory(report.category)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Priority</span>
                        <span class="detail-value">${this.formatPriority(report.priority)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">${report.location || 'Not specified'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Submitted</span>
                        <span class="detail-value">${this.formatDate(report.submittedAt)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Assigned To</span>
                        <span class="detail-value">${report.assignedTo || 'Pending'}</span>
                    </div>
                </div>
                
                <div class="report-description">
                    ${report.description.substring(0, 200)}${report.description.length > 200 ? '...' : ''}
                </div>
                
                <div class="report-timeline">
                    <h4>Timeline</h4>
                    ${report.timeline.map(event => `
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">${event.description}</div>
                            <div class="timeline-date">${this.formatDate(event.date)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getFilteredReports() {
        let filtered = [...this.reports];

        const searchTerm = document.getElementById('searchReports')?.value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter')?.value;
        const categoryFilter = document.getElementById('categoryFilter')?.value;

        if (searchTerm) {
            filtered = filtered.filter(report => 
                report.title.toLowerCase().includes(searchTerm) ||
                report.id.toLowerCase().includes(searchTerm)
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(report => report.status === statusFilter);
        }

        if (categoryFilter) {
            filtered = filtered.filter(report => report.category === categoryFilter);
        }

        return filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    filterReports() {
        this.displayReports();
    }

    // Dashboard Updates
    updateDashboard() {
        const totalReports = this.reports.length;
        const resolvedReports = this.reports.filter(r => r.status === 'resolved').length;
        const pendingReports = this.reports.filter(r => 
            ['submitted', 'under-review', 'in-progress'].includes(r.status)
        ).length;

        document.getElementById('totalReports').textContent = totalReports;
        document.getElementById('resolvedReports').textContent = resolvedReports;
        document.getElementById('pendingReports').textContent = pendingReports;
        document.getElementById('activeUsers').textContent = this.isOffline ? '1 (You)' : '1,247';

        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const recentReports = this.reports
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5);

        if (recentReports.length === 0) {
            container.innerHTML = '<p class="text-secondary">No recent activity</p>';
            return;
        }

        container.innerHTML = recentReports.map(report => `
            <div class="activity-item">
                <div class="activity-icon ${report.status === 'resolved' ? 'resolved' : 'report'}">
                    <i class="fas ${report.status === 'resolved' ? 'fa-check' : 'fa-file-alt'}"></i>
                </div>
                <div class="activity-content">
                    <h4>${report.title}</h4>
                    <p>Status: ${this.formatStatus(report.status)}</p>
                </div>
                <div class="activity-time">${this.getTimeAgo(report.submittedAt)}</div>
            </div>
        `).join('');
    }

    // Analytics Dashboard
    updateAnalytics() {
        this.createResolutionChart();
        this.createCategoryChart();
    }

    createResolutionChart() {
        const canvas = document.getElementById('resolutionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Generate mock data for the last 7 days
        const labels = [];
        const submittedData = [];
        const resolvedData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            submittedData.push(Math.floor(Math.random() * 10) + 5);
            resolvedData.push(Math.floor(Math.random() * 8) + 3);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Submitted',
                    data: submittedData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                }, {
                    label: 'Resolved',
                    data: resolvedData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const categories = {};
        this.reports.forEach(report => {
            categories[report.category] = (categories[report.category] || 0) + 1;
        });

        const labels = Object.keys(categories).map(cat => this.formatCategory(cat));
        const data = Object.values(categories);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Stakeholder Management
    displayStakeholders() {
        // Stakeholder mapping is already in the HTML
        // This method could be used to dynamically update stakeholder information
        this.updateStakeholderMatrix();
    }

    updateStakeholderMatrix() {
        // Add hover effects and interactive features to stakeholder dots
        document.querySelectorAll('.stakeholder-dot').forEach(dot => {
            dot.addEventListener('mouseover', (e) => {
                const stakeholder = e.target.dataset.stakeholder;
                this.showStakeholderTooltip(e.target, stakeholder);
            });
        });
    }

    showStakeholderTooltip(element, stakeholder) {
        // Implementation for stakeholder tooltips
        const tooltip = document.createElement('div');
        tooltip.className = 'stakeholder-tooltip';
        tooltip.textContent = stakeholder;
        tooltip.style.position = 'absolute';
        tooltip.style.background = '#333';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - 40) + 'px';
        
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 2000);
    }

    // Offline Capabilities
    setupOfflineCapabilities() {
        // Register service worker for offline functionality
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful');
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed');
                });
        }

        // Check for pending offline submissions
        this.syncOfflineData();
    }

    checkOnlineStatus() {
        this.isOffline = !navigator.onLine;
        this.updateOnlineStatus(!this.isOffline);
    }

    updateOnlineStatus(isOnline) {
        this.isOffline = !isOnline;
        const statusButton = document.getElementById('offlineStatus');
        
        if (statusButton) {
            if (isOnline) {
                statusButton.innerHTML = '<i class="fas fa-wifi"></i> Online';
                statusButton.classList.remove('offline');
            } else {
                statusButton.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
                statusButton.classList.add('offline');
            }
        }

        if (isOnline) {
            this.syncOfflineData();
        }
    }

    syncOfflineData() {
        // In a real application, this would sync with the server
        console.log('Syncing offline data...');
    }

    // Local Storage Management
    saveToLocalStorage() {
        const data = {
            reports: this.reports,
            drafts: this.drafts,
            currentUser: this.currentUser,
            settings: this.getSettings()
        };
        
        localStorage.setItem('civicConnectData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('civicConnectData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.reports = parsed.reports || [];
                this.drafts = parsed.drafts || [];
                this.currentUser = parsed.currentUser || null;
                
                if (parsed.settings) {
                    this.applySettings(parsed.settings);
                }
            } catch (error) {
                console.error('Error loading from localStorage:', error);
            }
        }
    }

    // Settings and Accessibility
    setupAccessibilitySettings() {
        const highContrast = document.getElementById('highContrast');
        const largeText = document.getElementById('largeText');
        const screenReader = document.getElementById('screenReader');

        if (highContrast) {
            highContrast.addEventListener('change', (e) => {
                document.body.classList.toggle('high-contrast', e.target.checked);
                this.saveToLocalStorage();
            });
        }

        if (largeText) {
            largeText.addEventListener('change', (e) => {
                document.body.classList.toggle('large-text', e.target.checked);
                this.saveToLocalStorage();
            });
        }

        if (screenReader) {
            screenReader.addEventListener('change', (e) => {
                // Implement screen reader enhancements
                this.toggleScreenReaderSupport(e.target.checked);
                this.saveToLocalStorage();
            });
        }
    }

    getSettings() {
        return {
            highContrast: document.getElementById('highContrast')?.checked || false,
            largeText: document.getElementById('largeText')?.checked || false,
            screenReader: document.getElementById('screenReader')?.checked || false,
            language: document.getElementById('language')?.value || 'en',
            emailNotifications: document.getElementById('emailNotifications')?.checked || false,
            smsNotifications: document.getElementById('smsNotifications')?.checked || false
        };
    }

    applySettings(settings) {
        if (settings.highContrast) {
            document.body.classList.add('high-contrast');
            const checkbox = document.getElementById('highContrast');
            if (checkbox) checkbox.checked = true;
        }

        if (settings.largeText) {
            document.body.classList.add('large-text');
            const checkbox = document.getElementById('largeText');
            if (checkbox) checkbox.checked = true;
        }

        if (settings.screenReader) {
            this.toggleScreenReaderSupport(true);
            const checkbox = document.getElementById('screenReader');
            if (checkbox) checkbox.checked = true;
        }

        if (settings.language) {
            const select = document.getElementById('language');
            if (select) select.value = settings.language;
        }

        if (settings.emailNotifications) {
            const checkbox = document.getElementById('emailNotifications');
            if (checkbox) checkbox.checked = true;
        }

        if (settings.smsNotifications) {
            const checkbox = document.getElementById('smsNotifications');
            if (checkbox) checkbox.checked = true;
        }
    }

    toggleScreenReaderSupport(enabled) {
        if (enabled) {
            // Add ARIA labels and improve screen reader accessibility
            document.querySelectorAll('button, a, input, select').forEach(element => {
                if (!element.getAttribute('aria-label') && !element.textContent.trim()) {
                    element.setAttribute('aria-label', element.title || element.placeholder || 'Interactive element');
                }
            });
        }
    }

    // Registration System
    initializeRegistration() {
        if (!this.currentUser) {
            // Show registration modal for new users
            setTimeout(() => {
                this.showRegistrationModal();
            }, 1000);
        }
    }

    setupRegistrationModal() {
        const modal = document.getElementById('registrationModal');
        const closeBtn = document.getElementById('closeModal');
        const form = document.getElementById('registrationForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideRegistrationModal();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registerUser();
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideRegistrationModal();
                }
            });
        }
    }

    showRegistrationModal() {
        const modal = document.getElementById('registrationModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideRegistrationModal() {
        const modal = document.getElementById('registrationModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    registerUser() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const location = document.getElementById('regLocation').value;

        if (!name || !email) {
            this.showNotification('error', 'Registration Error', 'Name and email are required.');
            return;
        }

        this.currentUser = {
            id: this.generateId(),
            name: name,
            email: email,
            phone: phone,
            location: location,
            registeredAt: new Date().toISOString(),
            isVerified: true
        };

        // Update UI
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userEmail').textContent = this.currentUser.email;

        this.saveToLocalStorage();
        this.hideRegistrationModal();
        
        this.showNotification('success', 'Welcome!', 
            `Welcome to CivicConnect, ${this.currentUser.name}! You can now start reporting issues in your community.`);
    }

    // Notification System
    showNotification(type, title, message) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    // Utility Functions
    generateId() {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatPriority(priority) {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    clearReportForm() {
        document.getElementById('reportForm').reset();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('civicConnectData');
        location.reload();
    }

    // Mock Data Generation for Demo
    generateMockData() {
        if (this.reports.length === 0) {
            const mockReports = [
                {
                    id: this.generateId(),
                    title: "Broken streetlight on Main Street",
                    category: "infrastructure",
                    priority: "medium",
                    location: "Main Street & 5th Avenue",
                    description: "The streetlight at the intersection of Main Street and 5th Avenue has been broken for over a week, creating a safety hazard for pedestrians and drivers.",
                    isPublic: true,
                    isAnonymous: false,
                    submittedBy: "demo_user",
                    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "in-progress",
                    assignedTo: "Municipal Public Works Department",
                    timeline: [
                        {
                            status: "submitted",
                            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            description: "Report submitted by citizen"
                        },
                        {
                            status: "under-review",
                            date: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
                            description: "Report is being reviewed by authorities"
                        },
                        {
                            status: "in-progress",
                            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                            description: "Authorities have started working on this issue"
                        }
                    ]
                },
                {
                    id: this.generateId(),
                    title: "Illegal dumping in Central Park",
                    category: "environment",
                    priority: "high",
                    location: "Central Park, North Section",
                    description: "Someone has been illegally dumping construction waste in the north section of Central Park. This is damaging the environment and creating an eyesore.",
                    isPublic: true,
                    isAnonymous: true,
                    submittedBy: "anonymous",
                    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "resolved",
                    assignedTo: "Environmental Protection Agency",
                    timeline: [
                        {
                            status: "submitted",
                            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                            description: "Report submitted by citizen"
                        },
                        {
                            status: "under-review",
                            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                            description: "Report is being reviewed by authorities"
                        },
                        {
                            status: "in-progress",
                            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            description: "Cleanup crew dispatched to the location"
                        },
                        {
                            status: "resolved",
                            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                            description: "Illegal waste removed and area cleaned up"
                        }
                    ]
                }
            ];

            this.reports = mockReports;
            this.saveToLocalStorage();
        }

        // Start simulation for pending reports
        setTimeout(() => {
            this.simulateResolution();
        }, 5000);
    }
}

// Service Worker Registration (for offline capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Create a simple service worker inline
        const swCode = `
            const CACHE_NAME = 'civicconnect-v1';
            const urlsToCache = [
                '/',
                '/index.html',
                '/styles.css',
                '/script.js'
            ];

            self.addEventListener('install', (event) => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.addAll(urlsToCache))
                );
            });

            self.addEventListener('fetch', (event) => {
                event.respondWith(
                    caches.match(event.request)
                        .then((response) => {
                            if (response) {
                                return response;
                            }
                            return fetch(event.request);
                        })
                );
            });
        `;

        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);

        navigator.serviceWorker.register(swUrl)
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CivicConnectApp();
});

// Export for global access
window.CivicConnectApp = CivicConnectApp;
