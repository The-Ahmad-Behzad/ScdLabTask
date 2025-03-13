const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

// In-memory storage
let users = [];
let events = [];

app.post('/events', (req, res) => {
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

app.put('/events/:userId', (req, res) => {
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

app.get('/events', (req, res) => {
    res.json({ success: true, events });
});

app.post('/users', async (req, res) => {
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

app.post('/users/login', (req, res) => {
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

app.get('/users/:id', (req, res) => {
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

const server = app.listen(port, () => {
    console.log(`Event Management listening on port ${port}`);
});

function resetData() {
    users = [];
    events = [];
}

module.exports = { app, users, events, resetData };
