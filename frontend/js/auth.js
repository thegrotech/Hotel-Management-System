// Password Toggle Functionality
class PasswordToggle {
    constructor(passwordInputId, toggleButtonId) {
        this.passwordInput = document.getElementById(passwordInputId);
        this.toggleButton = document.getElementById(toggleButtonId);
        this.isVisible = false;
        
        if (this.passwordInput && this.toggleButton) {
            this.init();
        }
    }

    init() {
        // Set initial state
        this.updateIcon();
        
        // Add click event listener
        this.toggleButton.addEventListener('click', () => this.toggleVisibility());
        
        // Add keyboard support
        this.toggleButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleVisibility();
            }
        });
        
        // Add focus handling for better accessibility
        this.toggleButton.addEventListener('focus', () => {
            this.toggleButton.classList.add('focused');
        });
        
        this.toggleButton.addEventListener('blur', () => {
            this.toggleButton.classList.remove('focused');
        });
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.passwordInput.type = this.isVisible ? 'text' : 'password';
        this.updateIcon();
        
        // Announce state change for screen readers
        const state = this.isVisible ? 'Password is visible' : 'Password is hidden';
        this.announceToScreenReader(state);
    }

    updateIcon() {
        const icon = this.toggleButton.querySelector('i');
        if (icon) {
            if (this.isVisible) {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                this.toggleButton.setAttribute('aria-label', 'Hide password');
                this.toggleButton.setAttribute('aria-pressed', 'true');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                this.toggleButton.setAttribute('aria-label', 'Show password');
                this.toggleButton.setAttribute('aria-pressed', 'false');
            }
        }
    }

    announceToScreenReader(message) {
        // Create and remove aria-live region for screen reader announcements
        const ariaLive = document.createElement('div');
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.setAttribute('aria-atomic', 'true');
        ariaLive.classList.add('sr-only');
        ariaLive.textContent = message;
        
        document.body.appendChild(ariaLive);
        
        setTimeout(() => {
            document.body.removeChild(ariaLive);
        }, 1000);
    }

    // Reset to hidden state
    reset() {
        this.isVisible = false;
        this.passwordInput.type = 'password';
        this.updateIcon();
    }
}

// Authentication Management
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('hotel_token');
        this.user = JSON.parse(localStorage.getItem('hotel_user')) || null;
        this.isAuthenticated = !!this.token;
        this.passwordToggle = null;
    }

    // Initialize password toggle
    initPasswordToggle() {
        if (document.getElementById('togglePassword') && document.getElementById('password')) {
            this.passwordToggle = new PasswordToggle('password', 'togglePassword');
        }
    }

    // Login function
    async login(username, password) {
        try {
            const response = await fetch(API_CONFIG.getUrl('/api/auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and user data
            this.token = data.token;
            this.user = data.user;
            this.isAuthenticated = true;

            localStorage.setItem('hotel_token', this.token);
            localStorage.setItem('hotel_user', JSON.stringify(this.user));

            return { success: true, user: this.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // Logout function
    logout() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem('hotel_token');
        localStorage.removeItem('hotel_user');
        
        // Reset password visibility if toggle exists
        if (this.passwordToggle) {
            this.passwordToggle.reset();
        }
        
        // Show login screen, hide app
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        
        // Reset login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
            document.getElementById('username').value = 'admin';
            document.getElementById('password').value = 'admin123';
        }
    }

    // Get authentication headers for API requests
getAuthHeaders() {
    return API_CONFIG.getAuthHeaders(this.token);
}

    // Check if user is authenticated
    checkAuth() {
        return this.isAuthenticated;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }
}

// Create global auth instance
const auth = new AuthManager();

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Initialize password toggle
    auth.initPasswordToggle();
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginBtn = loginForm.querySelector('.btn-login');
            
            // Show loading state
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            loginBtn.disabled = true;
            
            const result = await auth.login(username, password);
            
            if (result.success) {
                // Hide login screen, show app
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('app').style.display = 'flex';
                
                // Update manager name
                document.getElementById('managerName').textContent = result.user.fullName || result.user.username;
                
                // Initialize main app
                if (typeof initApp === 'function') {
                    initApp();
                }
            } else {
                alert(`Login failed: ${result.error}`);
                
                // Reset button
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
    }
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.logout();
        });
    }
    
    // Check if already logged in
    if (auth.checkAuth()) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        document.getElementById('managerName').textContent = auth.user?.fullName || auth.user?.username || 'Hotel Manager';
        
        if (typeof initApp === 'function') {
            initApp();
        }
    }
});

// Screen reader only class for accessibility
const style = document.createElement('style');
style.textContent = `
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
`;

document.head.appendChild(style);

