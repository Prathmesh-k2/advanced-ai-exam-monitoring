const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all exams (for both admin and students)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [exams] = await pool.execute('SELECT * FROM exams ORDER BY created_at DESC');
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Create Exam
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    const { title, description } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO exams (title, description, created_by) VALUES (?, ?, ?)',
            [title, description, req.user.id]
        );
        res.status(201).json({ message: 'Exam created', examId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Add Question to Exam
router.post('/:id/questions', authenticateToken, authorizeAdmin, async (req, res) => {
    const examId = req.params.id;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, question_type } = req.body;
    try {
        await pool.execute(
            `INSERT INTO questions 
            (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, question_type) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [examId, question_text, option_a, option_b, option_c, option_d, correct_option, question_type || 'mcq']
        );
        res.status(201).json({ message: 'Question added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Edit Exam
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { title, description } = req.body;
    try {
        await pool.execute('UPDATE exams SET title = ?, description = ? WHERE id = ?', [title, description, req.params.id]);
        res.json({ message: 'Exam updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Delete Exam
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    console.log(`DELETE request received for exam ID: ${req.params.id}`);
    try {
        await pool.execute('DELETE FROM exams WHERE id = ?', [req.params.id]);
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get standard metrics for admin dashboard
router.get('/metrics', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [[{totalExams}]] = await pool.execute('SELECT COUNT(*) as totalExams FROM exams');
        const [[{totalStudents}]] = await pool.execute("SELECT COUNT(*) as totalStudents FROM users WHERE role='student'");
        const [[{totalResults}]] = await pool.execute('SELECT COUNT(*) as totalResults FROM results');
        res.json({ totalExams, totalStudents, totalResults });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Exam details along with questions (Students use this to take exam, without correct_option if we want to be secure, but let's fetch everything or separate it. For security, we shouldn't send correct_option to students until submitted.)
router.get('/:id', authenticateToken, async (req, res) => {
    const examId = req.params.id;
    try {
        const [exams] = await pool.execute('SELECT * FROM exams WHERE id = ?', [examId]);
        if (exams.length === 0) return res.status(404).json({ message: 'Exam not found' });
        
        let query = 'SELECT id, exam_id, question_text, option_a, option_b, option_c, option_d, question_type FROM questions WHERE exam_id = ?';
        if (req.user.role === 'admin') {
             query = 'SELECT * FROM questions WHERE exam_id = ?';
        }

        const [questions] = await pool.execute(query, [examId]);
        res.json({ exam: exams[0], questions });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
