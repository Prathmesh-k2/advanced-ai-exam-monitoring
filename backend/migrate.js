const pool = require('./config/db');

async function migrate() {
    try {
        console.log("Starting migration...");
        
        // 1. Add question_type column
        await pool.execute("ALTER TABLE questions ADD COLUMN question_type ENUM('mcq', 'text') DEFAULT 'mcq'");
        console.log("Added question_type column.");

        // 2. Modify options to be NULLABLE
        await pool.execute("ALTER TABLE questions MODIFY COLUMN option_a VARCHAR(255) NULL");
        await pool.execute("ALTER TABLE questions MODIFY COLUMN option_b VARCHAR(255) NULL");
        await pool.execute("ALTER TABLE questions MODIFY COLUMN option_c VARCHAR(255) NULL");
        await pool.execute("ALTER TABLE questions MODIFY COLUMN option_d VARCHAR(255) NULL");
        console.log("Modified options to be nullable.");

        // 3. Modify correct_option to support text answers
        await pool.execute("ALTER TABLE questions MODIFY COLUMN correct_option TEXT NULL");
        console.log("Modified correct_option to support text.");

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
