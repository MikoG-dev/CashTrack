// auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
export const register = (req, res) => {
    const {
        email,
        fullname,
        password
    } = req.body;

    if (!email || !fullname || !password) {
        return res.status(400).json({
            error: 'email, name and password required'
        });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = 'INSERT INTO users (fullname, email, password) VALUES (?, ?,?)';
    db.query(query, [fullname, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'Email already exists'
                });
            }
            return res.status(500).json({
                error: 'Database error'
            });
        }
        res.status(201).json({
            message: 'User created successfully'
        });
    });
};

// Login and return JWT
export const login = (req, res) => {
    if (!req.body) {
        return res.status(401).json({
            error: 'email and password is required!'
        });
    }
    const {
        email,
        password
    } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const user = results[0];
        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Create JWT token
        const accessToken = jwt.sign({
            id: user.id,
            email: user.email
        }, JWT_SECRET, {
            expiresIn: '1h'
        });
        const refreshToken = jwt.sign({
            id: user.id,
            email: user.email
        }, JWT_SECRET, {
            expiresIn: '7d'
        });

        // Store refresh token in DB (or in-memory for testing)
        const query = 'UPDATE users SET refresh_token = ? WHERE id = ?';
        db.query(query, [refreshToken, user.id], (err) => {
            if (err) return res.status(500).json({
                error: 'DB error'
            });

            // Send tokens
            res.json({
                accessToken,
                refreshToken
            });
        });
    });
};

// refresh.js
export const refreshToken = (req, res) => {
    const {
        token
    } = req.body; // refresh token from frontend

    if (!token) return res.status(401).json({
        error: 'Refresh token required'
    });

    // Verify refresh token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({
            error: 'Invalid refresh token'
        });

        // Optional: check if token matches the one in DB
        const query = 'SELECT * FROM users WHERE id = ? AND refresh_token = ?';
        db.query(query, [user.id, token], (err, results) => {
            if (err || results.length === 0) return res.status(403).json({
                error: 'Token not valid'
            });

            const accessToken = jwt.sign({
                id: user.id,
                email: user.email
            }, JWT_SECRET, {
                expiresIn: '1h'
            });
            res.json({
                accessToken
            });
        });
    });
};

export const logout = (req, res) => {
    const {
        token
    } = req.body;
    if (!token) return res.sendStatus(204);

    // Remove from DB
    const query = 'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?';
    db.query(query, [token], (err) => {
        if (err) return res.status(500).json({
            error: 'DB error'
        });
        res.sendStatus(204);
    });
};