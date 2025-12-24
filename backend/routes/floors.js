const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// @route   GET /api/floors
// @desc    Get all floors
// @access  Private
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM floors ORDER BY floor_number'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching floors:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/floors/:id
// @desc    Get single floor
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM floors WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Floor not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching floor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/floors
// @desc    Create new floor
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { floor_number, floor_name, description } = req.body;
        
        if (!floor_number) {
            return res.status(400).json({ error: 'Floor number is required' });
        }
        
        const result = await pool.query(
            `INSERT INTO floors (floor_number, floor_name, description) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [floor_number, floor_name, description]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating floor:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Floor number already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

// @route   PUT /api/floors/:id
// @desc    Update floor
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { floor_number, floor_name, description } = req.body;
        
        const result = await pool.query(
            `UPDATE floors 
             SET floor_number = $1, floor_name = $2, description = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 
             RETURNING *`,
            [floor_number, floor_name, description, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Floor not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating floor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /api/floors/:id
// @desc    Delete floor
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if floor has rooms
        const roomsCheck = await pool.query(
            'SELECT COUNT(*) FROM rooms WHERE floor_id = $1',
            [id]
        );
        
        if (parseInt(roomsCheck.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete floor with existing rooms. Delete rooms first.' 
            });
        }
        
        const result = await pool.query(
            'DELETE FROM floors WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Floor not found' });
        }
        
        res.json({ message: 'Floor deleted successfully' });
    } catch (error) {
        console.error('Error deleting floor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;