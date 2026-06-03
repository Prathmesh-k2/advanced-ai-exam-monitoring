# 🔌 Backend API Documentation

Complete reference for all API endpoints, functions, and middleware used in the Advanced AI Exam Monitoring System.

---

## 📋 Table of Contents

- [Core Configuration](#core-configuration)
- [Authentication Middleware](#authentication-middleware)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Exam Routes](#exam-routes)
  - [Results Routes](#results-routes)
  - [User Routes](#user-routes)
- [Database Connection](#database-connection)
- [Error Handling](#error-handling)

---

## 🔧 Core Configuration

### Database Connection (`backend/config/db.js`)

**Purpose:** Establishes and manages MySQL database connection pool

```javascript
const pool = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: "manger",
    database: "online_exam_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
```

**Key Parameters:**
- `host`: Database server address
- `user`: MySQL username
- `password`: MySQL password
- `database`: Database name
- `connectionLimit`: Maximum concurrent connections (10)
- `waitForConnections`: Queue requests if limit reached

**Exported Functions:**
- `getConnection()` - Returns a promise with database connection
- `execute(query, values)` - Executes prepared statement (prevents SQL injection)

**Example Usage:**
```javascript
const pool = require('../config/db');
const [results] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

---

## 🔐 Authentication Middleware

### File: `backend/middleware/auth.js`

Provides JWT-based authentication and authorization checks.

### Function: `authenticateToken(req, res, next)`

**Purpose:** Validates JWT token from request headers

**Parameters:**
- `req` - Express request object
- `res` - Express response object  
- `next` - Express next middleware function

**How it works:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature using `JWT_SECRET`
3. Attaches decoded user data to `req.user`
4. Proceeds to next middleware if valid

**Usage:**
```javascript
router.get('/protected', authenticateToken, (req, res) => {
    // req.user contains: { id, email, role, name }
});
```

**Error Responses:**
- `401 Unauthorized` - No token provided
- `403 Forbidden` - Invalid or expired token

### Function: `authorizeAdmin(req, res, next)`

**Purpose:** Restricts endpoint access to admin users only

**Parameters:**
- `req` - Express request object (must have `req.user` from authenticateToken)
- `res` - Express response object
- `next` - Express next middleware function

**How it works:**
1. Checks if `req.user.role === 'admin'`
2. Allows access only for admin users
3. Rejects all non-admin requests

**Usage:**
```javascript
router.post('/admin-only', authenticateToken, authorizeAdmin, (req, res) => {
    // Only admins can access this
});
```

**Error Response:**
- `403 Forbidden` - User role is not admin

---

## 📡 API Endpoints

### Authentication Routes (`backend/routes/auth.js`)

#### **POST** `/api/auth/register`

**Purpose:** Register new user account

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "student" // optional, defaults to 'student'
}
```

**Response (Success - 201):**
```json
{
    "message": "User registered successfully"
}
```

**Function Logic:**
1. Checks if email already exists in database
2. Hashes password using bcrypt (10 rounds)
3. Inserts new user record
4. Returns success message

**Error Responses:**
- `400 Bad Request` - User already exists with that email
- `500 Server Error` - Database error

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "student"
  }'
```

---

#### **POST** `/api/auth/login`

**Purpose:** Authenticate user and generate JWT token

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student"
    }
}
```

**Function Logic:**
1. Retrieves user from database by email
2. Compares provided password with stored hash
3. Generates JWT token (expires in 2 hours)
4. Returns token and user information

**Error Responses:**
- `400 Bad Request` - Invalid email or password
- `500 Server Error` - Database error

**Token Structure:**
```javascript
{
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: timestamp,
    exp: timestamp + 2 hours
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

### Exam Routes (`backend/routes/exams.js`)

#### **GET** `/api/exams`

**Purpose:** Retrieve all exams (available to authenticated users)

**Authentication:** Required (JWT token)

**Response (Success - 200):**
```json
[
    {
        "id": 1,
        "title": "Mathematics Final Exam",
        "description": "Comprehensive math exam covering algebra and geometry",
        "created_by": 1,
        "created_at": "2024-01-15T10:30:00Z"
    },
    // ... more exams
]
```

**Function Logic:**
1. Verifies authentication token
2. Queries all exams from database
3. Orders by creation date (newest first)
4. Returns exam list

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Server Error` - Database error

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/exams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### **POST** `/api/exams`

**Purpose:** Create new exam (Admin only)

**Authentication:** Required + Admin role

**Request Body:**
```json
{
    "title": "Physics Final Exam",
    "description": "Comprehensive physics exam"
}
```

**Response (Success - 201):**
```json
{
    "message": "Exam created",
    "examId": 5
}
```

**Function Logic:**
1. Verifies authentication and admin role
2. Extracts title and description from request
3. Inserts exam record with creator ID
4. Returns new exam ID

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `403 Forbidden` - User is not admin
- `500 Server Error` - Database error

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/exams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Physics Final Exam",
    "description": "Comprehensive physics exam"
  }'
```

---

#### **POST** `/api/exams/:id/questions`

**Purpose:** Add question to exam (Admin only)

**Authentication:** Required + Admin role

**Parameters:**
- `id` - Exam ID

**Request Body:**
```json
{
    "question_text": "What is 2 + 2?",
    "option_a": "3",
    "option_b": "4",
    "option_c": "5",
    "option_d": "6",
    "correct_option": "B",
    "question_type": "mcq"
}
```

**Response (Success - 201):**
```json
{
    "message": "Question added successfully"
}
```

**Function Logic:**
1. Verifies authentication and admin role
2. Validates exam exists
3. Inserts question with options and correct answer
4. Sets question type (defaults to 'mcq')

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `403 Forbidden` - User is not admin
- `500 Server Error` - Database error

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/exams/5/questions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "What is 2 + 2?",
    "option_a": "3",
    "option_b": "4",
    "option_c": "5",
    "option_d": "6",
    "correct_option": "B",
    "question_type": "mcq"
  }'
```

---

#### **GET** `/api/exams/:id`

**Purpose:** Get exam details with questions

**Authentication:** Required (JWT token)

**Parameters:**
- `id` - Exam ID

**Response (Success - 200):**
```json
{
    "exam": {
        "id": 1,
        "title": "Mathematics Final Exam",
        "description": "Comprehensive math exam",
        "created_by": 1,
        "created_at": "2024-01-15T10:30:00Z"
    },
    "questions": [
        {
            "id": 1,
            "exam_id": 1,
            "question_text": "What is 2 + 2?",
            "option_a": "3",
            "option_b": "4",
            "option_c": "5",
            "option_d": "6",
            "question_type": "mcq"
            // Note: correct_option only included for admins
        },
        // ... more questions
    ]
}
```

**Function Logic:**
1. Verifies authentication token
2. Retrieves exam details by ID
3. Fetches all questions for exam
4. Filters correct_option for non-admin users (security)
5. Returns exam with questions

**Special Behavior:**
- **Students**: Don't see `correct_option` field
- **Admins**: See all fields including `correct_option`

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `404 Not Found` - Exam doesn't exist
- `500 Server Error` - Database error

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/exams/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### **PUT** `/api/exams/:id`

**Purpose:** Update exam details (Admin only)

**Authentication:** Required + Admin role

**Parameters:**
- `id` - Exam ID

**Request Body:**
```json
{
    "title": "Updated Exam Title",
    "description": "Updated description"
}
```

**Response (Success - 200):**
```json
{
    "message": "Exam updated successfully"
}
```

**Function Logic:**
1. Verifies authentication and admin role
2. Updates exam title and description
3. Returns success message

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `403 Forbidden` - User is not admin
- `500 Server Error` - Database error

---

#### **DELETE** `/api/exams/:id`

**Purpose:** Delete exam and all associated data (Admin only)

**Authentication:** Required + Admin role

**Parameters:**
- `id` - Exam ID

**Response (Success - 200):**
```json
{
    "message": "Exam deleted successfully"
}
```

**Function Logic:**
1. Verifies authentication and admin role
2. Logs deletion request
3. Deletes exam from database
4. Returns success message

**Cascading Deletes:** Typically deletes:
- Associated questions
- Associated results (if configured)

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `403 Forbidden` - User is not admin
- `500 Server Error` - Database error

---

#### **GET** `/api/exams/metrics`

**Purpose:** Get dashboard metrics (Admin only)

**Authentication:** Required + Admin role

**Response (Success - 200):**
```json
{
    "totalExams": 15,
    "totalStudents": 250,
    "totalResults": 1500
}
```

**Function Logic:**
1. Verifies authentication and admin role
2. Counts total exams in system
3. Counts total student users
4. Counts total submitted results
5. Returns metrics

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `403 Forbidden` - User is not admin
- `500 Server Error` - Database error

---

### Results Routes (`backend/routes/results.js`)

#### **POST** `/api/results/submit`

**Purpose:** Submit exam answers and calculate score

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
    "examId": 1,
    "answers": {
        "1": "A",
        "2": "C",
        "3": "B",
        "4": "D"
    }
}
```

**Response (Success - 201):**
```json
{
    "message": "Exam submitted successfully",
    "score": 3,
    "total": 4
}
```

**Function Logic:**
1. Verifies authentication token
2. Retrieves all questions for exam with correct answers
3. Compares student answers with correct options
4. Calculates score (number of correct answers)
5. Stores result in database
6. Returns score and total questions

**Answer Format:**
- Keys: Question IDs
- Values: Student's selected option (A, B, C, D, etc.)
- Case-insensitive matching

**Scoring:** 
- 1 point per correct answer
- 0 points for incorrect or missing answers

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `400 Bad Request` - No questions in exam
- `500 Server Error` - Database error

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/results/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "examId": 1,
    "answers": {
        "1": "A",
        "2": "C",
        "3": "B"
    }
  }'
```

---

#### **GET** `/api/results/my`

**Purpose:** Get all exam results for current student

**Authentication:** Required (JWT token)

**Response (Success - 200):**
```json
[
    {
        "id": 1,
        "user_id": 5,
        "exam_id": 1,
        "exam_title": "Mathematics Final Exam",
        "score": 18,
        "total_questions": 20,
        "submitted_at": "2024-01-15T14:30:00Z"
    },
    {
        "id": 2,
        "user_id": 5,
        "exam_id": 2,
        "exam_title": "Physics Final Exam",
        "score": 15,
        "total_questions": 20,
        "submitted_at": "2024-01-16T10:15:00Z"
    }
]
```

**Function Logic:**
1. Verifies authentication token
2. Retrieves all results for current user
3. Joins with exam table to get exam titles
4. Orders by submission date (newest first)
5. Returns result history

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `500 Server Error` - Database error

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/results/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### **GET** `/api/results/exam/:examId`

**Purpose:** Get all student results for specific exam (Admin only)

**Authentication:** Required + Admin role

**Parameters:**
- `examId` - Exam ID

**Response (Success - 200):**
```json
[
    {
        "id": 1,
        "user_id": 5,
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "exam_id": 1,
        "score": 18,
        "total_questions": 20,
        "submitted_at": "2024-01-15T14:30:00Z"
    },
    {
        "id": 2,
        "user_id": 6,
        "user_name": "Jane Smith",
        "user_email": "jane@example.com",
        "exam_id": 1,
        "score": 19,
        "total_questions": 20,
        "submitted_at": "2024-01-15T15:45:00Z"
    }
]
```

**Function Logic:**
1. Verifies authentication and admin role
2. Retrieves all results for specific exam
3. Joins with users table for student information
4. Orders by score (highest first)
5. Returns results with student details

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `403 Forbidden` - User is not admin
- `500 Server Error` - Database error

---

### User Routes (`backend/routes/users.js`)

#### **GET** `/api/users/students`

**Purpose:** Get list of all students (Admin only)

**Authentication:** Required + Admin role

**Response (Success - 200):**
```json
[
    {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2024-01-10T08:00:00Z"
    },
    {
        "id": 6,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "created_at": "2024-01-10T09:15:00Z"
    }
]
```

**Function Logic:**
1. Verifies authentication and admin role
2. Queries all users with 'student' role
3. Returns basic student information
4. Orders by registration date (newest first)

**Error Responses:**
- `401 Unauthorized` - Token missing/invalid
- `403 Forbidden` - User is not admin
- `500 Server Error` - Database error

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/users/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🗄️ Database Connection

### Connection Pool Management

**Key Features:**
- **Prepared Statements:** All queries use parameterized queries (`?`) to prevent SQL injection
- **Connection Pooling:** Maintains up to 10 concurrent connections
- **Connection Queuing:** Requests queue if limit is reached
- **Async/Await:** All operations return promises

**Typical Query Pattern:**
```javascript
const [results] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
);
```

**Response Format:**
- `results[0]` or `[rows]` - Query result rows
- `results[1]` or `[fields]` - Column metadata

---

## ⚠️ Error Handling

### Standard Error Responses

All endpoints follow consistent error handling:

**400 Bad Request**
```json
{
    "message": "Descriptive error message",
    "error": "Additional error details"
}
```

**401 Unauthorized**
```json
{
    "message": "Access Denied" // or "Invalid Token"
}
```

**403 Forbidden**
```json
{
    "message": "Admin access required" // or role-specific message
}
```

**404 Not Found**
```json
{
    "message": "Exam not found" // or resource-specific message
}
```

**500 Server Error**
```json
{
    "message": "Server error",
    "error": "Detailed error message"
}
```

---

## 🔒 Security Best Practices

1. **JWT Tokens:** All protected endpoints require valid JWT token
2. **Password Hashing:** Passwords hashed with bcrypt (10 rounds)
3. **Role-Based Access:** Endpoints check user role for authorization
4. **SQL Injection Prevention:** All queries use prepared statements
5. **Data Filtering:** Sensitive data (correct answers) filtered for non-admin users

---

## 📝 Environment Variables Required

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=manger
DB_NAME=online_exam_db
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

---

**Last Updated:** 2024  
**API Version:** 1.0  
**Maintainer:** Prathmesh-k2
