// app.js
import express from 'express';
import transactionRoutes from './routes/transactionsRoute.js';
import dotenv from 'dotenv';
import {
    register,
    logout,
    login,
    refreshToken
} from './controllers/authController.js';
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Public routes
app.post('/register', register);
app.post('/login', login);
app.post('/auth/refresh', refreshToken);

// Protected routes
app.use('/api', transactionRoutes);

app.get('/', (req, res) => {
    res.send('Cash Book API - Welcome!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});