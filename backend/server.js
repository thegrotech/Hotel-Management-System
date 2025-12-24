const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const floorRoutes = require('./routes/floors');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const guestRoutes = require('./routes/guests');
const billingRoutes = require('./routes/billing');

// Import middleware
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/floors', authMiddleware, floorRoutes);
app.use('/api/rooms', authMiddleware, roomRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);
app.use('/api/guests', authMiddleware, guestRoutes);
app.use('/api/billing', authMiddleware, billingRoutes);

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// For Vercel deployment - export the app
module.exports = app;

// Only listen locally if not in Vercel environment
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
    });
}
