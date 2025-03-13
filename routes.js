const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const router = express.Router();

// In-memory storage
let users = [];
let events = [];

// Create Event
router.post('/events', (req, res) => {
    try {
        const { name, userId, description, date } = req.body;

        if (!name || !userId) {
            return res.status(400).json({ success: false, message: "Please fill all required fields" });
        }

        const event = { id: events.length + 1, name, userId, description, date };
        events.push(event);
        res.json({ success: true, event });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});

// Update Event Category
router.put('/events/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { category } = req.body;
        const event = events.find(event => event.userId == userId);

        if (!event) {
            return res.json({ success: false, message: "Invalid user ID" });
        }
        
        if (!category) {
            return res.json({ success: false, message: "New Category value not given" });
        }

        event.category = category;
        res.json({ success: true, event });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});

// Get Events
router.get('/events', (req, res) => {
    res.json({ success: true, events });
});

// Register User
router.post('/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { id: users.length + 1, name, email, password: hashedPassword };
        users.push(user);

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.status(201).json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});

// User Login
router.post('/users/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Enter a valid email" });
        }

        const user = users.find(u => u.email === email);
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});

// Get User by ID
router.get('/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const user = users.find(u => u.id == id);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});

// Function to reset in-memory data
function resetData() {
    users.length = 0;
    events.length = 0;
}

module.exports = { router, users, events, resetData };
