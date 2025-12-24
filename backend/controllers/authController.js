const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Simple validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Please provide username and password' });
        }

        // Query database for user
        const query = 'SELECT * FROM managers WHERE username = $1';
        const result = await pool.query(query, [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // Check password
        // For development: if password is admin123 and hash is placeholder, accept it
        // For production: use bcrypt.compare
        let isPasswordValid = false;
        
        if (user.password_hash === '$2b$10$YourHashedPasswordHere' && password === 'admin123') {
            // Development fallback
            isPasswordValid = true;
        } else {
            // Production: verify with bcrypt
            isPasswordValid = await bcrypt.compare(password, user.password_hash);
        }
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'hotel_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
        // Get user from database using ID from JWT
        const userId = req.user.id;
        const query = 'SELECT id, username, full_name, email FROM managers WHERE id = $1';
        const result = await pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = result.rows[0];
        
        res.json({
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                email: user.email
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
