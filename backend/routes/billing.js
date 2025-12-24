const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// @route   GET /api/billing/transactions
// @desc    Get all transactions
// @access  Private
router.get('/transactions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, b.guest_id, g.first_name, g.last_name, r.room_number
            FROM transactions t
            LEFT JOIN bookings b ON t.booking_id = b.id
            LEFT JOIN guests g ON b.guest_id = g.id
            LEFT JOIN rooms r ON b.room_id = r.id
            ORDER BY t.transaction_date DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/billing/invoice/:bookingId
// @desc    Get invoice for booking
// @access  Private
router.get('/invoice/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const result = await pool.query(`
            SELECT 
                b.*,
                g.first_name, g.last_name, g.phone, g.email,
                r.room_number, r.price_per_night,
                f.floor_number,
                rt.type_name as room_type,
                COALESCE(SUM(
                    CASE WHEN t.transaction_type = 'booking' THEN t.amount 
                         WHEN t.transaction_type = 'additional_charge' THEN t.amount
                         ELSE 0 
                    END
                ), 0) as total_paid,
                ARRAY_AGG(
                    CASE WHEN t.transaction_type != 'booking' 
                    THEN json_build_object(
                        'type', t.transaction_type,
                        'amount', t.amount,
                        'date', t.transaction_date,
                        'notes', t.notes
                    ) 
                    ELSE NULL 
                    END
                ) FILTER (WHERE t.transaction_type != 'booking') as additional_charges
            FROM bookings b
            LEFT JOIN guests g ON b.guest_id = g.id
            LEFT JOIN rooms r ON b.room_id = r.id
            LEFT JOIN floors f ON r.floor_id = f.id
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            LEFT JOIN transactions t ON b.id = t.booking_id
            WHERE b.id = $1
            GROUP BY b.id, g.id, r.id, f.id, rt.id
        `, [bookingId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/billing/transaction
// @desc    Add transaction (additional charge/refund)
// @access  Private
router.post('/transaction', async (req, res) => {
    try {
        const { 
            booking_id, 
            transaction_type, 
            amount, 
            payment_method, 
            notes 
        } = req.body;
        
        if (!booking_id || !transaction_type || !amount || !payment_method) {
            return res.status(400).json({ 
                error: 'Booking ID, transaction type, amount, and payment method are required' 
            });
        }
        
        // Validate transaction type
        const validTypes = ['additional_charge', 'refund'];
        if (!validTypes.includes(transaction_type)) {
            return res.status(400).json({ 
                error: 'Invalid transaction type. Use: additional_charge, refund' 
            });
        }
        
        const result = await pool.query(
            `INSERT INTO transactions 
             (booking_id, transaction_type, amount, payment_method, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [booking_id, transaction_type, amount, payment_method, notes]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/billing/reports/revenue
// @desc    Get revenue reports
// @access  Private
router.get('/reports/revenue', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        let query = `
            SELECT 
                DATE(t.transaction_date) as date,
                t.transaction_type,
                t.payment_method,
                SUM(t.amount) as total_amount,
                COUNT(*) as transaction_count
            FROM transactions t
            WHERE t.payment_status = 'completed'
        `;
        
        const queryParams = [];
        
        if (start_date && end_date) {
            query += ` AND DATE(t.transaction_date) BETWEEN $1 AND $2`;
            queryParams.push(start_date, end_date);
        }
        
        query += `
            GROUP BY DATE(t.transaction_date), t.transaction_type, t.payment_method
            ORDER BY DATE(t.transaction_date) DESC, t.transaction_type
        `;
        
        const result = await pool.query(query, queryParams);
        
        // Calculate summary
        const summary = {
            total_revenue: 0,
            booking_revenue: 0,
            additional_charges: 0,
            refunds: 0,
            by_payment_method: {}
        };
        
        result.rows.forEach(row => {
            summary.total_revenue += parseFloat(row.total_amount);
            
            if (row.transaction_type === 'booking') {
                summary.booking_revenue += parseFloat(row.total_amount);
            } else if (row.transaction_type === 'additional_charge') {
                summary.additional_charges += parseFloat(row.total_amount);
            } else if (row.transaction_type === 'refund') {
                summary.refunds += parseFloat(row.total_amount);
            }
            
            if (!summary.by_payment_method[row.payment_method]) {
                summary.by_payment_method[row.payment_method] = 0;
            }
            summary.by_payment_method[row.payment_method] += parseFloat(row.total_amount);
        });
        
        res.json({
            transactions: result.rows,
            summary: summary
        });
    } catch (error) {
        console.error('Error generating revenue report:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/billing/reports/occupancy
// @desc    Get occupancy reports
// @access  Private
router.get('/reports/occupancy', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        const currentDate = new Date().toISOString().split('T')[0];
        const defaultStart = new Date();
        defaultStart.setDate(defaultStart.getDate() - 30); // Last 30 days
        
        const startDate = start_date || defaultStart.toISOString().split('T')[0];
        const endDate = end_date || currentDate;
        
        const result = await pool.query(`
            SELECT 
                DATE(check_in_date) as date,
                COUNT(*) as bookings_count,
                SUM(number_of_guests) as total_guests,
                SUM(
                    CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END
                ) as active_stays,
                SUM(
                    CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END
                ) as completed_stays
            FROM bookings
            WHERE check_in_date BETWEEN $1 AND $2
            GROUP BY DATE(check_in_date)
            ORDER BY DATE(check_in_date) DESC
        `, [startDate, endDate]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error generating occupancy report:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;