import express from 'express';
import multer from 'multer';
import { readFileSync, unlinkSync } from 'fs';
import db from '../database/db.js';
import { parseCSV } from '../services/csvParser.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload and parse CSV
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const { account_type, account_name } = req.body;
    
    if (!account_type || !account_name) {
      // Clean up uploaded file
      unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        error: 'Missing account_type or account_name' 
      });
    }
    
    // Validate account_type
    if (account_type !== 'credit_card' && account_type !== 'checking') {
      unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        error: 'account_type must be either "credit_card" or "checking"' 
      });
    }
    
    // Read CSV file
    const csvContent = readFileSync(req.file.path, 'utf-8');
    
    // Parse CSV
    const transactions = await parseCSV(csvContent, account_type, account_name);
    
    // Insert transactions into database
    const insertStmt = db.prepare(`
      INSERT INTO transactions (date, description, amount, category, account_type, account_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((transactions) => {
      for (const t of transactions) {
        insertStmt.run(t.date, t.description, t.amount, t.category, t.account_type, t.account_name);
      }
    });
    
    insertMany(transactions);
    
    // Clean up uploaded file
    unlinkSync(req.file.path);
    
    res.json({ 
      success: true, 
      data: { 
        count: transactions.length,
        transactions: transactions.slice(0, 10) // Return first 10 for preview
      } 
    });
  } catch (error) {
    console.error('Error processing CSV upload:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Preview CSV without saving
router.post('/preview', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const { account_type, account_name } = req.body;
    
    if (!account_type || !account_name) {
      unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        error: 'Missing account_type or account_name' 
      });
    }
    
    // Read and parse CSV
    const csvContent = readFileSync(req.file.path, 'utf-8');
    const transactions = await parseCSV(csvContent, account_type, account_name);
    
    // Clean up uploaded file
    unlinkSync(req.file.path);
    
    // Return preview (first 20 transactions)
    res.json({ 
      success: true, 
      data: { 
        count: transactions.length,
        preview: transactions.slice(0, 20) 
      } 
    });
  } catch (error) {
    console.error('Error previewing CSV:', error);
    
    if (req.file) {
      try {
        unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
