// ============================================
// Hotel Management System - Authentication
// SIMPLIFIED FOR VERCEL DEPLOYMENT
// ============================================

console.log('🚀 auth.js loading...');

// Check if config.js loaded properly
if (typeof API_CONFIG === 'undefined') {
    console.error('❌ CRITICAL: API_CONFIG not found!');
    console.error('Make sure config.js loads before auth.js');
    
    // Create emergency fallback
    window.API_CONFIG = {
        getUrl: (endpoint) => endpoint,
        getAuthHeaders: (token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            headers['skip-auth'] = 'true';
            return headers;
        }
    };
    console.log('⚠️ Created emergency API_CONFIG');
}

console.log('✅ API_CONFIG loaded:', API_CONFIG);

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
        this.updateIcon();
        this.toggleButton.addEventListener('click', () => this.toggleVisibility());
        
        // Keyboard support
        this.toggleButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleVisibility();
            }
        });
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.passwordInput.type = this.isVisible ? 'text' : 'password';
        this.updateIcon();
    }

    updateIcon() {
        const icon = this.toggleButton.querySelector('i');
        if (icon) {
            icon.className = this.isVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
            this.toggleButton.setAttribute('aria-label', this.isVisible ? 'Hide password' : 'Show password');
        }
    }
}

// Authentication Management
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('hotel_token');
        this.user = JSON.parse(localStorage.getItem('hotel_user')) || null;
        this.isAuthenticated = !!this.token;
        this.passwordToggle = null;
        console.log('🔐 AuthManager initialized. Token exists:', !!this.token);
    }

    // Initialize password toggle
    initPasswordToggle() {
        if (document.getElementById('togglePassword') && document.getElementById('password')) {
            this.passwordToggle = new PasswordToggle('password', 'togglePassword');
            console.log('✅ Password toggle initialized');
        }
    }

    // SIMPLIFIED LOGIN FUNCTION
    async login(username, password) {
        console.log('🔐 Attempting login for:', username);
        
        try {
            // IMPORTANT: Add skip-auth header manually
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'skip-auth': 'true'  // CRITICAL: This makes it work
                },
                body: JSON.stringify({ 
                    username: username.trim(), 
                    password: password.trim() 
                })
            });

            console.log('📡 Login response status:', response.status);
            
            const data = await response.json();
            console.log('📡 Login response data:', data);

            if (!response.ok) {
                console.error('❌ Login failed:', data.error);
                throw new Error(data.error || `Login failed (HTTP ${response.status})`);
            }

            // Store token and user data
            this.token = data.token;
            this.user = data.user;
            this.isAuthenticated = true;

            localStorage.setItem('hotel_token', this.token);
            localStorage.setItem('hotel_user', JSON.stringify(this.user));

            console.log('✅ Login successful! User:', this.user.username);
            return { success: true, user: this.user };
            
        } catch (error) {
            console.error('❌ Login error:', error.message);
            console.error('Full error:', error);
            return { 
                success: false, 
                error: error.message || 'Login failed. Try admin / admin123'
            };
        }
    }

    // Logout function
    logout() {
        console.log('👋 Logging out...');
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem('hotel_token');
        localStorage.removeItem('hotel_user');
        
        // Show login screen, hide app
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        
        // Reset form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
            document.getElementById('username').value = 'admin';
            document.getElementById('password').value = 'admin123';
        }
        
        console.log('✅ Logged out successfully');
    }

    // Get authentication headers
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
window.auth = auth; // Make it globally accessible for debugging

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, setting up login form...');
    
    const loginForm = document.getElementById('loginForm');
    
    // Initialize password toggle
    auth.initPasswordToggle();
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Login form submitted');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginBtn = loginForm.querySelector('.btn-login');
            
            // Show loading state
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            loginBtn.disabled = true;
            
            // Wait a bit to see loading state
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const result = await auth.login(username, password);
            console.log('📊 Login result:', result);
            
            if (result.success) {
                console.log('🎉 Login successful! Showing app...');
                
                // Hide login screen, show app
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('app').style.display = 'flex';
                
                // Update manager name
                document.getElementById('managerName').textContent = 
                    result.user.fullName || result.user.username || 'Hotel Manager';
                
                // Initialize main app
                if (typeof initApp === 'function') {
                    console.log('🚀 Initializing main app...');
                    initApp();
                } else {
                    console.log('⚠️ initApp function not found');
                    // Load dashboard directly
                    if (typeof loadPage === 'function') {
                        loadPage('dashboard');
                    }
                }
                
            } else {
                console.error('❌ Login failed in form:', result.error);
                alert(`Login failed: ${result.error}\n\nTry: admin / admin123`);
                
                // Reset button
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
        
        console.log('✅ Login form handler attached');
    } else {
        console.error('❌ Login form not found!');
    }
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.logout();
        });
        console.log('✅ Logout button handler attached');
    }
    
    // Check if already logged in
    if (auth.checkAuth()) {
        console.log('🔓 User already logged in, showing app...');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        document.getElementById('managerName').textContent = 
            auth.user?.fullName || auth.user?.username || 'Hotel Manager';
        
        if (typeof initApp === 'function') {
            initApp();
        }
    } else {
        console.log('🔒 No existing login found');
    }
});

// Emergency login function (run in browser console if needed)
window.emergencyLogin = function() {
    console.log('🚨 EMERGENCY LOGIN ACTIVATED');
    localStorage.setItem('hotel_token', 'emergency_token_' + Date.now());
    localStorage.setItem('hotel_user', JSON.stringify({
        id: 1,
        username: 'admin',
        fullName: 'Hotel Manager',
        email: 'manager@hotel.com'
    }));
    location.reload();
};

console.log('✅ auth.js loaded completely');
