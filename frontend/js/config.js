// ============================================
// Hotel Management System - API Configuration
// ============================================

const API_CONFIG = {
    // Base URL for API calls
    // Empty string = relative URLs (works for both localhost and Vercel)
    BASE_URL: '',
    
    // API endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/auth/login',
            LOGOUT: '/api/auth/logout',
            VALIDATE: '/api/auth/validate'
        },
        FLOORS: '/api/floors',
        ROOMS: '/api/rooms',
        ROOM_TYPES: '/api/rooms/types',
        BOOKINGS: '/api/bookings',
        GUESTS: '/api/guests',
        BILLING: '/api/billing'
    },
    
    // Check if we're in development
    isDevelopment: window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1',
    
    // Helper function to get full API URL
    getUrl: function(endpoint) {
        return this.BASE_URL + endpoint;
    },
    
    // Helper to get authentication headers
    getAuthHeaders: function(token) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // For local development only
        if (this.isDevelopment) {
            headers['skip-auth'] = 'true';
        }
        
        return headers;
    }
};

// Make it globally available
window.API_CONFIG = API_CONFIG;
