const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || 'OBnormal';





// Middleware
app.use(cors());
app.use(bodyParser.json());


// Redis Client
const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://@127.0.0.1:6379'
});


client.connect()
    .then(() => console.log('Connected to Redis'))
    .catch(err => console.error('Redis connection error:', err));


// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


// Utility Function
const handleServerError = (res, error, message = 'Internal Server Error') => {
    console.error(error);
    return res.status(500).json({ message: message, error: error.message });
};




const validateStudentData = (data) => {
    if (!data.id || !data.firstName || !data.lastName || !data.age ||
        !data.gender || !data.course || !data.email || !data.address) {
        throw new Error('All student fields are required.');
    }
    if (isNaN(parseInt(data.age))) {
        throw new Error('Age must be a number.');
    }
    return data;
};


// --- User Authentication ---


// Register Endpoint
app.post('/register', async (req, res) => {
    const { username, password, secretCode } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if the username already exists
        const existingUser = await client.hGetAll(`user:${username}`);
        if (Object.keys(existingUser).length > 0) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        let role = 'user';

        // Compare the secretCode directly with the hardcoded ADMIN_SECRET_CODE
        if (secretCode && secretCode === ADMIN_SECRET_CODE) {
            role = 'admin';
        }

        await client.hSet(`user:${username}`, 'password', hashedPassword);
        await client.hSet(`user:${username}`, 'role', role);

        res.status(201).json({ message: 'User registered successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
});


// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;


    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }


    try {
        const user = await client.hGetAll(`user:${username}`);


        if (Object.keys(user).length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }


        const passwordMatch = await bcrypt.compare(password, user.password);


        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }


        const token = jwt.sign({ username: username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });


        res.json({ token, role: user.role });
    } catch (error) {
        handleServerError(res, error, 'Failed to login');
    }
});


// --- Authentication Middleware ---
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];


    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }


    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};


// --- Authorization Middleware ---
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Unauthorized: insufficient role' });
        }
        next();
    };
};


// --- Student CRUD Operations (with RBAC) ---


// POST /students (Admin only)
app.post('/students', authenticate, authorize(['admin']), async (req, res) => {
    try {
        console.log('Received student data:', req.body);  // 🔍 Log received data


        const studentData = validateStudentData(req.body);


        const existingStudent = await client.exists(`student:${studentData.id}`);
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this ID already exists' });
        }


        for (const key in studentData) {
            await client.hSet(`student:${studentData.id}`, key, studentData[key]);
        }


        res.status(201).json({ message: 'Student saved successfully' });
    } catch (error) {
        console.error('Error saving student:', error);
        res.status(500).json({ message: 'Failed to save student', error: error.message });
    }
});


// GET /students (All users)
app.get('/students', authenticate, async (req, res) => {
    try {
        console.log("Fetching students from Redis..."); // Debug log
        const { search } = req.query;
        console.log("Search term:", search);


        const keys = await client.keys('student:*');
        console.log("Keys found:", keys); // Debug log


        let students = await Promise.all(keys.map(async (key) => {
            const studentData = await client.hGetAll(key);
            console.log(`Student Data for ${key}:`, studentData); // Debug log
            return { id: key.split(':')[1], ...studentData };
        }));


        if (search) {
            students = students.filter(student =>
                Object.values(student).some(value =>
                    String(value).toLowerCase().includes(search.toLowerCase())
                )
            );
        }


        res.json(students);
    } catch (error) {
        handleServerError(res, error, 'Failed to retrieve students');
    }
});


// GET /students/:id (All users)
app.get('/students/:id', authenticate, async (req, res) => {
    const id = req.params.id;


    try {
        const student = await client.hGetAll(`student:${id}`);
        if (Object.keys(student).length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        handleServerError(res, error, 'Failed to retrieve student');
    }
});


// PUT /students/:id (Admin only)
app.put('/students/:id', authenticate, authorize(['admin']), async (req, res) => {
    const id = req.params.id;
    try {
        const updateData = req.body;


        const existingStudent = await client.hGetAll(`student:${id}`);
        if (Object.keys(existingStudent).length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }


        for (const key in updateData) {
            try {
                await client.hSet(`student:${id}`, key, updateData[key]);
            } catch (redisError) {
                return res.status(500).json({ message: `Failed to update field ${key}`, error: redisError.message });
            }
        }


        res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        handleServerError(res, error, 'Failed to update student');
    }
});


// DELETE /students/:id (Admin only)
app.delete('/students/:id', authenticate, authorize(['admin']), async (req, res) => {
    const id = req.params.id;
    console.log(`Attempting to delete student with ID: ${id}`);


    try {
        // Fetch the student data from Redis
        const student = await client.hGetAll(`student:${id}`);
        console.log('Student data fetched:', student);


        if (Object.keys(student).length === 0) {
            console.log('Student not found');
            return res.status(404).json({ message: 'Student not found' });
        }


        // Delete the student from Redis
        await client.del(`student:${id}`);
        console.log(`Student with ID: ${id} deleted successfully`);


        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Failed to delete student', error: error.message });
    }
});


// CSV Upload Route
app.post('/students/upload', authenticate, authorize(['admin']), upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }


    const students = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            try {
                console.log("Processing row:", row); // Debugging
                const studentData = validateStudentData(row);
                students.push(studentData);
            } catch (error) {
                console.error('Invalid row:', row);
            }
        })
        .on('end', async () => {
            try {
                for (const student of students) {
                    console.log("Saving student:", student); // Debugging
                    const existingStudent = await client.exists(`student:${student.id}`);
                    if (!existingStudent) {
                        for (const key in student) {
                            await client.hSet(`student:${student.id}`, key, student[key]);
                        }
                    }
                }
                res.status(201).json({ message: 'CSV uploaded successfully' });
            } catch (error) {
                handleServerError(res, error, 'Failed to process CSV');
            }
        });
});








// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
