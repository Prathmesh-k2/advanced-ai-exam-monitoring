const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin: Get all students
router.get('/students', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [students] = await pool.execute(
            "SELECT id, name, email, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC"
        );
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
