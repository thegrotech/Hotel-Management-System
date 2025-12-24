const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // For development, you can skip auth temporarily
    // Remove this in production
    if (process.env.NODE_ENV === 'development' && req.headers['skip-auth'] === 'true') {
        req.user = { id: 1, username: 'admin' };
        return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel_secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware;