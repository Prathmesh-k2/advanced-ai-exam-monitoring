const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Student: Submit Exam
router.post('/submit', authenticateToken, async (req, res) => {
    const { examId, answers } = req.body; 
    // answers expected format: { questionId: 'A', questionId2: 'C', ... }
    try {
        const [questions] = await pool.execute('SELECT id, correct_option, question_type FROM questions WHERE exam_id = ?', [examId]);
        
        if (questions.length === 0) return res.status(400).json({ message: 'No questions in this exam' });

        let score = 0;
        let total = questions.length;
        
        questions.forEach(q => {
            const studentAns = answers[q.id] ? String(answers[q.id]).trim().toLowerCase() : '';
            const correctAns = q.correct_option ? String(q.correct_option).trim().toLowerCase() : '';
            
            if (studentAns && studentAns === correctAns) {
                score++;
            }
        });

        const [result] = await pool.execute(
            'INSERT INTO results (user_id, exam_id, score, total_questions) VALUES (?, ?, ?, ?)',
            [req.user.id, examId, score, total]
        );

        res.status(201).json({ message: 'Exam submitted successfully', score, total });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Student: Get my results
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const [results] = await pool.execute(
            `SELECT r.*, e.title as exam_title 
            FROM results r 
            JOIN exams e ON r.exam_id = e.id 
            WHERE r.user_id = ? ORDER BY r.submitted_at DESC`,
            [req.user.id]
        );
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Get all results for an exam
router.get('/exam/:examId', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [results] = await pool.execute(
            `SELECT r.*, u.name as user_name, u.email as user_email 
            FROM results r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.exam_id = ? ORDER BY r.score DESC`,
            [req.params.examId]
        );
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
