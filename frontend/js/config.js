// ============================================
// Hotel Management System - API Configuration
// SIMPLIFIED FOR VERCEL DEPLOYMENT
// ============================================

const API_CONFIG = {
    // Base URL - empty for relative URLs (works everywhere)
    BASE_URL: '',
    
    // Get full URL for API calls
    getUrl: function(endpoint) {
        return this.BASE_URL + endpoint;
    },
    
    // Get authentication headers
    getAuthHeaders: function(token) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // ALWAYS add skip-auth for now (we'll remove later)
        headers['skip-auth'] = 'true';
        
        return headers;
    }
};

// Make globally available
window.API_CONFIG = API_CONFIG;

console.log('✅ config.js loaded - BASE_URL:', API_CONFIG.BASE_URL);
