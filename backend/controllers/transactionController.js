import db from '../config/db.js';

const buildWhereClause = (userId, query, type = null) => {
    const {
        from,
        to,
        date
    } = query;

    let whereClause = "WHERE user_id = ?";
    let params = [userId];

    if (type) {
        whereClause += " AND type = ?";
        params.push(type);
    }

    if (date) {
        whereClause += " AND DATE(date) = ?";
        params.push(date);
    } else {
        if (from) {
            whereClause += " AND DATE(date) >= ?";
            params.push(from);
        }
        if (to) {
            whereClause += " AND DATE(date) <= ?";
            params.push(to);
        }
    }

    return {
        whereClause,
        params
    };
};

const fetchTransactions = (req, res, type = null) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const {
        whereClause,
        params
    } = buildWhereClause(userId, req.query, type);

    const sql = `
        SELECT * FROM transactions
        ${whereClause}
        ORDER BY date DESC
        LIMIT ? OFFSET ?
    `;
    const countSql = `SELECT COUNT(*) as total FROM transactions ${whereClause}`;
    const summarySql = `
        SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        ${whereClause}
    `;

    const queryParams = [...params, limit, offset];

    db.query(sql, queryParams, (err, results) => {
        if (err) return res.status(500).json({
            error: err.message
        });

        db.query(countSql, params, (err, countResult) => {
            if (err) return res.status(500).json({
                error: err.message
            });

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            db.query(summarySql, params, (err, summaryResult) => {
                if (err) return res.status(500).json({
                    error: err.message
                });

                const {
                    total_income,
                    total_expense
                } = summaryResult[0];
                const balance = (total_income || 0) - (total_expense || 0);

                res.json({
                    page,
                    limit,
                    total,
                    totalPages,
                    transactions: results,
                    summary: {
                        total_income: total_income || 0,
                        total_expense: total_expense || 0,
                        balance
                    }
                });
            });
        });
    });
};

export const getTransaction = (req, res) => fetchTransactions(req, res, null);
export const getIncomeTransactions = (req, res) => fetchTransactions(req, res, 'income');
export const getExpenseTransactions = (req, res) => fetchTransactions(req, res, 'expense');

export const addTransaction = (req, res) => {
    if (!req.body) {
        return res.status(401).json({
            error: 'Description,Amount and type is required'
        });
    }
    const {
        description,
        amount,
        type
    } = req.body;

    const query = 'INSERT INTO transactions (user_id, description, amount, type) VALUES (?, ?, ?, ?)';
    db.query(query, [req.user.id, description, amount, type], (err, result) => {
        if (err) return res.status(500).json({
            error: 'Failed to save transaction'
        });
        res.status(201).json({
            id: result.insertId,
            message: 'Transaction added'
        });
    });
};

// Update transaction
export const updateTransaction = (req, res) => {

    const {
        id
    } = req.params; // transaction id from URL
    const {
        description,
        amount,
        type
    } = req.body;

    if (!description || !amount || !type) {
        return res.status(400).json({
            error: 'Description, amount and type are required'
        });
    }

    const query = `
        UPDATE transactions 
        SET description = ?, amount = ?, type = ? 
        WHERE id = ? AND user_id = ?
    `;
    db.query(query, [description, amount, type, id, req.user.id], (err, result) => {
        if (err) return res.status(500).json({
            error: 'Database error'
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Transaction not found or not authorized'
            });
        }

        res.json({
            message: 'Transaction updated successfully'
        });
    });
};

// Delete transaction
export const deleteTransaction = (req, res) => {
    console.log(req.params)
    const {
        id
    } = req.params;

    const query = `
        DELETE FROM transactions 
        WHERE id = ? AND user_id = ?
    `;
    db.query(query, [id, req.user.id], (err, result) => {
        if (err) return res.status(500).json({
            error: 'Database error'
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Transaction not found or not authorized'
            });
        }

        res.json({
            message: 'Transaction deleted successfully'
        });
    });
};

export const searchTransactions = (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const {
        q,
        type,
        from,
        to,
        date
    } = req.query;

    let whereClause = "WHERE user_id = ?";
    let params = [userId];

    // type filter (income / expense)
    if (type && (type === 'income' || type === 'expense')) {
        whereClause += " AND type = ?";
        params.push(type);
    }

    // search by description (case-insensitive)
    if (q) {
        whereClause += " AND description LIKE ?";
        params.push(`%${q}%`);
    }

    // date filters
    if (date) {
        whereClause += " AND DATE(date) = ?";
        params.push(date);
    } else {
        if (from) {
            whereClause += " AND DATE(date) >= ?";
            params.push(from);
        }
        if (to) {
            whereClause += " AND DATE(date) <= ?";
            params.push(to);
        }
    }

    const sql = `
        SELECT * FROM transactions
        ${whereClause}
        ORDER BY date DESC
        LIMIT ? OFFSET ?
    `;
    const countSql = `SELECT COUNT(*) as total FROM transactions ${whereClause}`;
    const summarySql = `
        SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        ${whereClause}
    `;

    const queryParams = [...params, limit, offset];

    db.query(sql, queryParams, (err, results) => {
        if (err) return res.status(500).json({
            error: err.message
        });

        db.query(countSql, params, (err, countResult) => {
            if (err) return res.status(500).json({
                error: err.message
            });

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            db.query(summarySql, params, (err, summaryResult) => {
                if (err) return res.status(500).json({
                    error: err.message
                });

                const {
                    total_income,
                    total_expense
                } = summaryResult[0];
                const balance = (total_income || 0) - (total_expense || 0);

                res.json({
                    page,
                    limit,
                    total,
                    totalPages,
                    transactions: results,
                    summary: {
                        total_income: total_income || 0,
                        total_expense: total_expense || 0,
                        balance
                    }
                });
            });
        });
    });
};

export const getDashboardData = (req, res) => {
    const userId = req.user.id;

    // Total summary
    const totalSql = `
        SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        WHERE user_id = ?
    `;

    // Monthly summary (last 5 months)
    const monthlySql = `
        SELECT 
            DATE_FORMAT(date, '%Y-%m') as month,
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE user_id = ?
          AND date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
        GROUP BY month
        ORDER BY month
    `;

    // Weekly summary (last 4 weeks)
    const weeklySql = `
        SELECT 
            WEEK(date, 1) as week_number,
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE user_id = ?
          AND date >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
        GROUP BY week_number
        ORDER BY week_number
    `;

    db.query(totalSql, [userId], (err, totalResult) => {
        if (err) return res.status(500).json({
            error: err.message
        });

        const {
            total_income = 0, total_expense = 0
        } = totalResult[0];
        const total_balance = total_income - total_expense;

        db.query(monthlySql, [userId], (err, monthlyResult) => {
            if (err) return res.status(500).json({
                error: err.message
            });

            const monthlyData = monthlyResult.map(row => ({
                month: row.month,
                income: row.income,
                expense: row.expense
            }));

            db.query(weeklySql, [userId], (err, weeklyResult) => {
                if (err) return res.status(500).json({
                    error: err.message
                });

                const weeklyData = weeklyResult.map(row => ({
                    week: `Week ${row.week_number}`,
                    income: row.income,
                    expense: row.expense
                }));

                res.json({
                    total: {
                        total_income,
                        total_expense,
                        total_balance
                    },
                    monthly: monthlyData,
                    weekly: weeklyData
                });
            });
        });
    });
};

export const exportTransactions = (req, res) => {
    const userId = req.user.id;
    const {
        type,
        from,
        to
    } = req.query;

    let whereClause = "WHERE user_id = ?";
    let params = [userId];

    if (type && (type === 'income' || type === 'expense')) {
        whereClause += " AND type = ?";
        params.push(type);
    }

    if (from) {
        whereClause += " AND DATE(date) >= ?";
        params.push(from);
    }
    if (to) {
        whereClause += " AND DATE(date) <= ?";
        params.push(to);
    }

    const sql = `SELECT id, description, amount, type, date FROM transactions ${whereClause} ORDER BY date DESC`;

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({
            error: err.message
        });

        // Send data to frontend to export
        res.json({
            transactions: results
        });
    });
};

export const clearTransactions = (req, res) => {
    const userId = req.user.id;
    const sql = "DELETE FROM transactions WHERE user_id = ?";
    db.query(sql, [userId], (err) => {
        if (err) return res.status(500).json({
            error: err.message
        });
        res.json({
            message: "All transactions cleared"
        });
    });
};



/* How it works
Pagination
/get/transactions?page=2&limit=20 → returns page 2 (rows 21–40).
 Date filtering
 Specific date: /get/transactions?date=2025-08-17
 From → To: /get/transactions?from=2025-08-01&to=2025-08-15
 Summary
 Returns total income, total expense, and net balance for that filter.*/