const mysql2 = require("mysql2/promise");

const pool = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: "manger",
    database: "online_exam_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the database connection
pool.getConnection()
    .then((connection) => {
        console.log("✅ Successfully connected to the MySQL Database!");
        connection.release();
    })
    .catch((err) => {
        console.error("❌ Failed to connect to MySQL Database Error:");
        console.error(err.message);
    });

module.exports = pool;
