import express from 'express';
import cors from 'cors';
import { existsSync, mkdirSync } from 'fs';
import transactionsRouter from './routes/transactions.js';
import uploadRouter from './routes/upload.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
if (!existsSync('uploads')) {
  mkdirSync('uploads');
}

// Initialize database (imported for side effects)
import './database/db.js';

// Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/upload', uploadRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Personal Finance API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
