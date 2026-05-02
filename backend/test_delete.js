const pool = require('./config/db');

async function testDelete() {
    try {
        const examId = process.argv[2];
        if (!examId) {
            console.log("Please provide an exam ID to delete. Usage: node test_delete.js <id>");
            process.exit(1);
        }
        console.log(`Attempting to delete exam ${examId}...`);
        const [result] = await pool.execute('DELETE FROM exams WHERE id = ?', [examId]);
        console.log("Delete result:", result);
        process.exit(0);
    } catch (err) {
        console.error("Delete failed:", err);
        process.exit(1);
    }
}

testDelete();
