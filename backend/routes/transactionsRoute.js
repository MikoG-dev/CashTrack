import express from 'express';
import {
    authenticateToken
} from '../middlewares/authMiddleware.js';
import {
    addTransaction,
    getTransaction,
    getIncomeTransactions,
    searchTransactions,
    updateTransaction,
    getDashboardData,
    exportTransactions,
    clearTransactions,
    deleteTransaction,
    getExpenseTransactions
} from '../controllers/transactionController.js';

const router = express.Router();

// All transactions (paginated, summary)
router.get('/get/transactions', authenticateToken, getTransaction);

// Only incomes (paginated, summary)
router.get('/get/income', authenticateToken, getIncomeTransactions);

// Only expenses (paginated, summary)
router.get('/get/expenses', authenticateToken, getExpenseTransactions);

// Add transaction
router.post('/add/transactions', authenticateToken, addTransaction);


// transactionRoutes.js
router.delete("/transactions/clear", authenticateToken, clearTransactions);

// Edit transactions by id
router.put('/transactions/:id', authenticateToken, updateTransaction);



// Delete transaction by id
router.delete('/transactions/:id', authenticateToken, deleteTransaction);


// Export transactions (income / expense / all)
router.get('/export/transactions', authenticateToken, exportTransactions);

// Dashboard data
router.get('/dashboard', authenticateToken, getDashboardData);

// Search (income/expense) with pagination
router.get('/search/transactions', authenticateToken, searchTransactions);


export default router;