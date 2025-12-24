const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// @route   GET /api/guests
// @desc    Get all guests
// @access  Private
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT g.*, 
                   COUNT(b.id) as total_bookings,
                   MAX(b.check_in_date) as last_visit
            FROM guests g
            LEFT JOIN bookings b ON g.id = b.guest_id
            GROUP BY g.id
            ORDER BY g.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching guests:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/guests/:id
// @desc    Get single guest with booking history
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get guest details
        const guestResult = await pool.query(
            'SELECT * FROM guests WHERE id = $1',
            [id]
        );
        
        if (guestResult.rows.length === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        
        // Get booking history
        const bookingsResult = await pool.query(`
            SELECT b.*, r.room_number, f.floor_number, rt.type_name as room_type
            FROM bookings b
            LEFT JOIN rooms r ON b.room_id = r.id
            LEFT JOIN floors f ON r.floor_id = f.id
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            WHERE b.guest_id = $1
            ORDER BY b.check_in_date DESC
        `, [id]);
        
        res.json({
            ...guestResult.rows[0],
            bookings: bookingsResult.rows
        });
    } catch (error) {
        console.error('Error fetching guest:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/guests
// @desc    Create new guest
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { 
            first_name, 
            last_name, 
            email, 
            phone, 
            address, 
            government_id, 
            id_type 
        } = req.body;
        
        if (!first_name || !last_name || !phone) {
            return res.status(400).json({ 
                error: 'First name, last name, and phone are required' 
            });
        }
        
        const result = await pool.query(
            `INSERT INTO guests 
             (first_name, last_name, email, phone, address, government_id, id_type) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [first_name, last_name, email, phone, address, government_id, id_type]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating guest:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/guests/:id
// @desc    Update guest
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            first_name, 
            last_name, 
            email, 
            phone, 
            address, 
            government_id, 
            id_type 
        } = req.body;
        
        const result = await pool.query(
            `UPDATE guests 
             SET first_name = $1, last_name = $2, email = $3, phone = $4, 
                 address = $5, government_id = $6, id_type = $7
             WHERE id = $8 
             RETURNING *`,
            [first_name, last_name, email, phone, address, government_id, id_type, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating guest:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/guests/search/:phone
// @desc    Search guest by phone
// @access  Private
router.get('/search/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const result = await pool.query(
            'SELECT * FROM guests WHERE phone LIKE $1',
            [`%${phone}%`]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching guest:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;