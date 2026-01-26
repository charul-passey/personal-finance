import express from 'express';
import db from '../database/db.js';
import { getCategories } from '../services/categorizer.js';

const router = express.Router();

// Get all transactions with optional filters
router.get('/', (req, res) => {
  try {
    const { startDate, endDate, accountType, accountName, category } = req.query;
    
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    
    if (accountType) {
      query += ' AND account_type = ?';
      params.push(accountType);
    }
    
    if (accountName) {
      query += ' AND account_name = ?';
      params.push(accountName);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY date DESC, created_at DESC';
    
    const stmt = db.prepare(query);
    const transactions = stmt.all(...params);
    
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction summary/aggregated data
router.get('/summary', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = 'SELECT category, SUM(amount) as total FROM transactions WHERE 1=1';
    const params = [];
    
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    
    query += ' GROUP BY category';
    
    const stmt = db.prepare(query);
    const categoryTotals = stmt.all(...params);
    
    // Calculate overall totals
    const income = categoryTotals
      .filter(c => c.total > 0)
      .reduce((sum, c) => sum + c.total, 0);
    
    const expenses = categoryTotals
      .filter(c => c.total < 0)
      .reduce((sum, c) => sum + Math.abs(c.total), 0);
    
    const net = income - expenses;
    
    // Get account breakdown
    let accountQuery = 'SELECT account_name, account_type, COUNT(*) as count, SUM(amount) as total FROM transactions WHERE 1=1';
    const accountParams = [];
    
    if (startDate) {
      accountQuery += ' AND date >= ?';
      accountParams.push(startDate);
    }
    
    if (endDate) {
      accountQuery += ' AND date <= ?';
      accountParams.push(endDate);
    }
    
    accountQuery += ' GROUP BY account_name, account_type';
    
    const accountStmt = db.prepare(accountQuery);
    const accounts = accountStmt.all(...accountParams);
    
    res.json({
      success: true,
      data: {
        income,
        expenses,
        net,
        categoryTotals: categoryTotals.map(c => ({
          category: c.category,
          total: c.total,
          isIncome: c.total > 0
        })),
        accounts
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new transaction manually
router.post('/', (req, res) => {
  try {
    const { date, description, amount, category, account_type, account_name } = req.body;
    
    // Validate required fields
    if (!date || !description || amount === undefined || !category || !account_type || !account_name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    const stmt = db.prepare(`
      INSERT INTO transactions (date, description, amount, category, account_type, account_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(date, description, amount, category, account_type, account_name);
    
    res.json({ 
      success: true, 
      data: { id: result.lastInsertRowid } 
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a transaction (mainly for category changes)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, amount, date } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const params = [];
    
    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    
    if (description) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }
    
    if (date) {
      updates.push('date = ?');
      params.push(date);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }
    
    params.push(id);
    const query = `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`;
    
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a transaction
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all categories
router.get('/categories/list', (req, res) => {
  try {
    const categories = getCategories(db);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
