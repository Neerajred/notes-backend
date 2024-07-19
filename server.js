const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();


const app = express();
app.use(cors());
app.use(bodyParser.json());


const SECRET_KEY = 'NOTES_2024_NIRAJ';

const db = new sqlite3.Database('notes-project.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            title TEXT,
            content TEXT,
            tags TEXT,
            backgroundColor TEXT DEFAULT '#ffffff',
            isArchived INTEGER DEFAULT 0,
            isTrashed INTEGER DEFAULT 0,
            reminderDate TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )
    `);
});


const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(query, [email, hashedPassword], function (err) {
        if (err) {
            return res.status(400).json({ error: 'User already exists' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

//create a new note
app.post('/notes', authMiddleware, (req, res) => {
    const { title, content, tags, backgroundColor, reminderDate } = req.body;
    const query = `INSERT INTO notes (userId, title, content, tags, backgroundColor, reminderDate) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [req.userId, title, content, tags.join(','), backgroundColor, reminderDate], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error creating note' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

//initial content sync 
app.get('/notes', authMiddleware, (req, res) => {
    const query = `SELECT * FROM notes WHERE userId = ? AND isTrashed = 0 AND isArchived = 0`;
    db.all(query, [req.userId], (err, notes) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching notes' });
        }
        res.json(notes);
    });
});

// delete note
app.delete('/notes/:id', authMiddleware, (req, res) => {
    const noteId = req.params.id;
    const query = `UPDATE notes SET isTrashed = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`;
    db.run(query, [noteId, req.userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error deleting note' });
        }
        res.status(200).json({ id: noteId });
    });
});

// archeive note
app.put('/notes/:id/archive', authMiddleware, (req, res) => {
    const noteId = req.params.id;
    const query = `UPDATE notes SET isArchived = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`;
    db.run(query, [noteId, req.userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error archiving note' });
        }
        res.status(200).json({ id: noteId });
    });
});

// to restore to notes
app.put('/notes/:id/restore', authMiddleware, (req, res) => {
    const noteId = req.params.id;
    const query = `UPDATE notes SET isTrashed = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`;
    db.run(query, [noteId, req.userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error deleting note' });
        }
        res.status(200).json({ id: noteId });
    });
});

// from archive to restore
app.put('/notes/:id/archive/restore', authMiddleware, (req, res) => {
    const noteId = req.params.id;
    const query = `UPDATE notes SET isArchived = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`;
    db.run(query, [noteId, req.userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error restoring archiving note' });
        }
        res.status(200).json({ id: noteId });
    });
});




//to get trashed notes
app.get('/notes/trash', authMiddleware, (req, res) => {
    const query = `SELECT * FROM notes WHERE userId = ? AND isTrashed = 1`;
    db.all(query, [req.userId], (err, notes) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching trashed notes' });
        }
        res.json(notes);
    });
});

//to update a note
app.put('/notes/:id', authMiddleware, (req, res) => {
    const noteId = req.params.id;
    const { title, content, tags, backgroundColor, reminderDate } = req.body;
    const query = `UPDATE notes SET title = ?, content = ?, tags = ?, backgroundColor = ?, reminderDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`;
    db.run(query, [title, content, tags.join(','), backgroundColor, reminderDate, noteId, req.userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error updating note' });
        }
        res.status(200).json({ id: noteId });
    });
});

// Get archived notes route
app.get('/notes/archived', authMiddleware, (req, res) => {
    const query = `SELECT * FROM notes WHERE userId = ? AND isArchived = 1 AND isTrashed = 0`;
    db.all(query, [req.userId], (err, notes) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching archived notes' });
        }
        res.json(notes);
    });
});

// get note by id
app.get('/notes/:id', authMiddleware, (req, res) => {
    const noteId = req.params.id;
    const query = `SELECT * FROM notes WHERE id = ? AND userId = ?`;
    db.get(query, [noteId, req.userId], (err, note) => {
        if (err || !note) {
            return res.status(500).json({ error: 'Error fetching note' });
        }
        res.json(note);
    });
});

app.listen("5000",()=>{
    console.log("server started at http://localhost:5000");
})