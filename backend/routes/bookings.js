const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// @route   GET /api/bookings
// @desc    Get all bookings with details
// @access  Private
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, 
                   g.first_name, g.last_name, g.phone, g.email,
                   r.room_number, r.status as room_status,
                   f.floor_number,
                   rt.type_name as room_type,
                   t.transaction_date, t.payment_method, t.payment_status
            FROM bookings b
            LEFT JOIN guests g ON b.guest_id = g.id
            LEFT JOIN rooms r ON b.room_id = r.id
            LEFT JOIN floors f ON r.floor_id = f.id
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            LEFT JOIN transactions t ON b.id = t.booking_id AND t.transaction_type = 'booking'
            ORDER BY b.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT b.*, 
                   g.first_name, g.last_name, g.phone, g.email, g.address, g.government_id, g.id_type,
                   r.room_number, r.price_per_night, r.status as room_status,
                   f.floor_number,
                   rt.type_name as room_type
            FROM bookings b
            LEFT JOIN guests g ON b.guest_id = g.id
            LEFT JOIN rooms r ON b.room_id = r.id
            LEFT JOIN floors f ON r.floor_id = f.id
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            WHERE b.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/bookings/status/:status
// @desc    Get bookings by status
// @access  Private
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const result = await pool.query(`
            SELECT b.*, g.first_name, g.last_name, r.room_number
            FROM bookings b
            LEFT JOIN guests g ON b.guest_id = g.id
            LEFT JOIN rooms r ON b.room_id = r.id
            WHERE b.status = $1
            ORDER BY b.check_in_date
        `, [status]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bookings by status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { 
            guest_id, 
            room_id, 
            check_in_date, 
            check_out_date, 
            number_of_guests,
            total_amount,
            special_requests,
            payment_method 
        } = req.body;
        
        // Validate required fields
        if (!guest_id || !room_id || !check_in_date || !check_out_date || !number_of_guests || !total_amount) {
            throw new Error('Missing required fields');
        }
        
        // Check if room is available
        const roomCheck = await client.query(
            'SELECT status, price_per_night FROM rooms WHERE id = $1',
            [room_id]
        );
        
        if (roomCheck.rows.length === 0) {
            throw new Error('Room not found');
        }
        
        if (roomCheck.rows[0].status !== 'available') {
            throw new Error('Room is not available for booking');
        }
        
        // Check for date conflicts
        const dateConflict = await client.query(
            `SELECT COUNT(*) FROM bookings 
             WHERE room_id = $1 
             AND status IN ('confirmed', 'checked_in')
             AND (
                 (check_in_date <= $2 AND check_out_date >= $2) OR
                 (check_in_date <= $3 AND check_out_date >= $3) OR
                 (check_in_date >= $2 AND check_out_date <= $3)
             )`,
            [room_id, check_in_date, check_out_date]
        );
        
        if (parseInt(dateConflict.rows[0].count) > 0) {
            throw new Error('Room is already booked for these dates');
        }
        
        // Create booking
        const bookingResult = await client.query(
            `INSERT INTO bookings 
             (guest_id, room_id, check_in_date, check_out_date, number_of_guests, total_amount, special_requests)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [guest_id, room_id, check_in_date, check_out_date, number_of_guests, total_amount, special_requests]
        );
        
        // Update room status
        await client.query(
            'UPDATE rooms SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['booked', room_id]
        );
        
        // Create transaction record
        await client.query(
            `INSERT INTO transactions 
             (booking_id, transaction_type, amount, payment_method)
             VALUES ($1, $2, $3, $4)`,
            [bookingResult.rows[0].id, 'booking', total_amount, payment_method || 'cash']
        );
        
        await client.query('COMMIT');
        
        res.status(201).json(bookingResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating booking:', error);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
});

// @route   PUT /api/bookings/:id/checkin
// @desc    Check in guest
// @access  Private
router.put('/:id/checkin', async (req, res) => {
    try {
        const { id } = req.params;
        
        const bookingCheck = await pool.query(
            'SELECT room_id, status FROM bookings WHERE id = $1',
            [id]
        );
        
        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        if (bookingCheck.rows[0].status !== 'confirmed') {
            return res.status(400).json({ error: 'Booking is not in confirmed status' });
        }
        
        // Update booking status
        const bookingResult = await pool.query(
            `UPDATE bookings 
             SET status = 'checked_in', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 
             RETURNING *`,
            [id]
        );
        
        // Update room status
        await pool.query(
            'UPDATE rooms SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['occupied', bookingCheck.rows[0].room_id]
        );
        
        res.json(bookingResult.rows[0]);
    } catch (error) {
        console.error('Error during check-in:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/bookings/:id/checkout
// @desc    Check out guest
// @access  Private
router.put('/:id/checkout', async (req, res) => {
    try {
        const { id } = req.params;
        const { additional_charges = 0, payment_method = 'cash' } = req.body;
        
        const bookingCheck = await pool.query(
            'SELECT room_id, status, total_amount FROM bookings WHERE id = $1',
            [id]
        );
        
        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        if (bookingCheck.rows[0].status !== 'checked_in') {
            return res.status(400).json({ error: 'Guest is not checked in' });
        }
        
        // Update booking status
        const bookingResult = await pool.query(
            `UPDATE bookings 
             SET status = 'checked_out', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 
             RETURNING *`,
            [id]
        );
        
        // Update room status
        await pool.query(
            'UPDATE rooms SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['available', bookingCheck.rows[0].room_id]
        );
        
        // Record additional charges if any
        if (additional_charges > 0) {
            await pool.query(
                `INSERT INTO transactions 
                 (booking_id, transaction_type, amount, payment_method, notes)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, 'additional_charge', additional_charges, payment_method, 'Additional charges during stay']
            );
        }
        
        res.json({
            ...bookingResult.rows[0],
            additional_charges,
            total_paid: bookingCheck.rows[0].total_amount + additional_charges
        });
    } catch (error) {
        console.error('Error during check-out:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        
        const bookingCheck = await pool.query(
            'SELECT room_id, status FROM bookings WHERE id = $1',
            [id]
        );
        
        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        if (bookingCheck.rows[0].status !== 'confirmed') {
            return res.status(400).json({ error: 'Only confirmed bookings can be cancelled' });
        }
        
        // Update booking status
        const bookingResult = await pool.query(
            `UPDATE bookings 
             SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 
             RETURNING *`,
            [id]
        );
        
        // Update room status
        await pool.query(
            'UPDATE rooms SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['available', bookingCheck.rows[0].room_id]
        );
        
        res.json(bookingResult.rows[0]);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete booking
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM bookings WHERE id = $1 AND status = $2 RETURNING *',
            [id, 'cancelled']
        );
        
        if (result.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Only cancelled bookings can be deleted or booking not found' 
            });
        }
        
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;