// API Configuration for Hotel Management System
const API_CONFIG = {
    // Base URL for API calls
    // Empty string works for both localhost and Vercel
    BASE_URL: '',
    
    // API endpoints (already using relative URLs)
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/auth/login',
            LOGOUT: '/api/auth/logout'
        },
        FLOORS: '/api/floors',
        ROOMS: '/api/rooms',
        BOOKINGS: '/api/bookings',
        GUESTS: '/api/guests',
        BILLING: '/api/billing'
    },
    
    // Helper function for consistency
    getUrl: function(endpoint) {
        return this.BASE_URL + endpoint;
    }
};
