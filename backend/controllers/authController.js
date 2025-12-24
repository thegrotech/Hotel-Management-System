const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// For simplicity, we'll use a single hardcoded user
// In production, you should store this in database
const DEFAULT_USER = {
    id: 1,
    username: 'admin',
    // Password: admin123 (hashed)
    passwordHash: '$2b$10$KbQk9U6q7W8p9s0d1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2',
    fullName: 'Hotel Manager'
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Simple validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Please provide username and password' });
        }

        // Check credentials (in production, query database)
        if (username !== DEFAULT_USER.username) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // For development, accept any password
        // In production, use bcrypt.compare
        const isPasswordValid = password === 'admin123';
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: DEFAULT_USER.id, username: DEFAULT_USER.username },
            process.env.JWT_SECRET || 'hotel_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: DEFAULT_USER.id,
                username: DEFAULT_USER.username,
                fullName: DEFAULT_USER.fullName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
        res.json({
            user: {
                id: DEFAULT_USER.id,
                username: DEFAULT_USER.username,
                fullName: DEFAULT_USER.fullName
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    login,
    getProfile
};