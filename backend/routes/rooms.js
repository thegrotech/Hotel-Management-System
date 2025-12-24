const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// @route   GET /api/rooms
// @desc    Get all rooms with details
// @access  Private
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, f.floor_number, f.floor_name, rt.type_name, rt.base_price as type_base_price
            FROM rooms r
            LEFT JOIN floors f ON r.floor_id = f.id
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            ORDER BY r.floor_id, r.room_number
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/rooms/:id
// @desc    Get single room
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT r.*, f.floor_number, f.floor_name, rt.type_name, rt.base_price as type_base_price
            FROM rooms r
            LEFT JOIN floors f ON r.floor_id = f.id
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            WHERE r.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/rooms/status/:status
// @desc    Get rooms by status
// @access  Private
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const result = await pool.query(`
            SELECT r.*, f.floor_number, f.floor_name, rt.type_name
            FROM rooms r
            LEFT JOIN floors f ON r.floor_id = f.id
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            WHERE r.status = $1
            ORDER BY r.floor_id, r.room_number
        `, [status]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching rooms by status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/rooms/floor/:floorId
// @desc    Get rooms by floor
// @access  Private
router.get('/floor/:floorId', async (req, res) => {
    try {
        const { floorId } = req.params;
        const result = await pool.query(`
            SELECT r.*, rt.type_name
            FROM rooms r
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            WHERE r.floor_id = $1
            ORDER BY r.room_number
        `, [floorId]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching rooms by floor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/rooms/types/available
// @desc    Get available room types
// @access  Private
router.get('/types/available', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM room_types ORDER BY type_name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching room types:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { room_number, floor_id, room_type_id, price_per_night, description } = req.body;
        
        if (!room_number || !floor_id || !room_type_id || !price_per_night) {
            return res.status(400).json({ 
                error: 'Room number, floor, room type, and price are required' 
            });
        }
        
        const result = await pool.query(
            `INSERT INTO rooms (room_number, floor_id, room_type_id, price_per_night, description) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [room_number, floor_id, room_type_id, price_per_night, description]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating room:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Room number already exists' });
        } else if (error.code === '23503') { // Foreign key violation
            res.status(400).json({ error: 'Invalid floor or room type' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { room_number, floor_id, room_type_id, status, price_per_night, description } = req.body;
        
        const result = await pool.query(
            `UPDATE rooms 
             SET room_number = $1, floor_id = $2, room_type_id = $3, 
                 status = $4, price_per_night = $5, description = $6,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 
             RETURNING *`,
            [room_number, floor_id, room_type_id, status, price_per_night, description, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if room has bookings
        const bookingsCheck = await pool.query(
            'SELECT COUNT(*) FROM bookings WHERE room_id = $1 AND status IN ($2, $3)',
            [id, 'confirmed', 'checked_in']
        );
        
        if (parseInt(bookingsCheck.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete room with active or upcoming bookings' 
            });
        }
        
        const result = await pool.query(
            'DELETE FROM rooms WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;