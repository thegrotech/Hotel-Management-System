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

        // DEVELOPMENT FALLBACK: Check if we should use hardcoded admin
        // This helps when database is not set up yet
        const skipAuth = req.headers['skip-auth'] === 'true';
        
        if (skipAuth && username === 'admin' && password === 'admin123') {
            console.log('⚠️ Using development fallback authentication');
            
            const token = jwt.sign(
                { id: 1, username: 'admin' },
                process.env.JWT_SECRET || 'hotel_secret_key',
                { expiresIn: '24h' }
            );

            return res.json({
                token,
                user: {
                    id: 1,
                    username: 'admin',
                    fullName: 'Hotel Manager',
                    email: 'manager@hotel.com'
                }
            });
        }

        // PRODUCTION: Query database for user
        let user;
        try {
            const query = 'SELECT * FROM managers WHERE username = $1';
            const result = await pool.query(query, [username]);
            
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            user = result.rows[0];
        } catch (dbError) {
            console.error('Database error during login:', dbError.message);
            
            // If database connection fails, fallback to hardcoded for development
            if (username === 'admin' && password === 'admin123') {
                console.log('⚠️ Database connection failed, using fallback authentication');
                
                const token = jwt.sign(
                    { id: 1, username: 'admin' },
                    process.env.JWT_SECRET || 'hotel_secret_key',
                    { expiresIn: '24h' }
                );

                return res.json({
                    token,
                    user: {
                        id: 1,
                        username: 'admin',
                        fullName: 'Hotel Manager',
                        email: 'manager@hotel.com'
                    }
                });
            }
            
            return res.status(500).json({ error: 'Database connection error' });
        }
        
        // Check password
        let isPasswordValid = false;
        
        // Check if using placeholder hash (from setup.sql)
        if (user.password_hash === '$2b$10$YourHashedPasswordHere' && password === 'admin123') {
            // Development: placeholder hash with default password
            isPasswordValid = true;
            console.log('⚠️ Using placeholder hash authentication');
        } else {
            // Production: verify with bcrypt
            try {
                isPasswordValid = await bcrypt.compare(password, user.password_hash);
            } catch (bcryptError) {
                console.error('Bcrypt error:', bcryptError.message);
                // Fallback to simple comparison for development
                isPasswordValid = password === 'admin123';
            }
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
                fullName: user.full_name || 'Hotel Manager',
                email: user.email || 'manager@hotel.com'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
        // Get user ID from JWT token (set by auth middleware)
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        try {
            // Try to get user from database
            const query = 'SELECT id, username, full_name, email FROM managers WHERE id = $1';
            const result = await pool.query(query, [userId]);
            
            if (result.rows.length > 0) {
                const user = result.rows[0];
                return res.json({
                    user: {
                        id: user.id,
                        username: user.username,
                        fullName: user.full_name,
                        email: user.email
                    }
                });
            }
        } catch (dbError) {
            console.error('Database error in getProfile:', dbError.message);
            // If database fails, return the user from token
        }
        
        // Fallback: return user info from token
        res.json({
            user: {
                id: req.user.id,
                username: req.user.username,
                fullName: req.user.fullName || 'Hotel Manager',
                email: req.user.email || 'manager@hotel.com'
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
