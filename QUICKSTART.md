# Quick Start Guide

Welcome to your Personal Finance Tracker! This guide will get you up and running in minutes.

## ⚡ Quick Start (Easiest Method)

### Option 1: Using the Start Script (Recommended)

```bash
./start.sh
```

This script will automatically:
- Install all dependencies (if not already installed)
- Start the backend server on http://localhost:3001
- Start the frontend server on http://localhost:5173

Press `Ctrl+C` to stop both servers when done.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # First time only
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

## 📋 What You Can Do

### 1. Upload Your First CSV File

1. Open your browser to http://localhost:5173
2. Click "Upload CSV" in the navigation
3. Try the included sample file: `sample-transactions.csv`
   - Or drag and drop your own bank CSV file
4. Select account type (Credit Card or Checking)
5. Enter an account name (e.g., "Chase Sapphire")
6. Click "Preview" to see what will be imported
7. Click "Upload & Save" to import the transactions

### 2. View Your Dashboard

1. Click "Dashboard" in the navigation
2. See your financial summary:
   - Total Income
   - Total Expenses
   - Net Savings
3. View charts showing spending by category
4. Use the date range selector to view different time periods

### 3. Manage Transactions

1. Click "Transactions" in the navigation
2. View all your transactions in a table
3. Use filters to narrow down:
   - Date range
   - Category
   - Account
   - Search by description
4. Edit categories by clicking "Edit"
5. Delete transactions by clicking "Delete"

## 📊 Sample Data Included

The project includes `sample-transactions.csv` with 15 sample transactions that demonstrate:
- Various spending categories (Groceries, Dining, Transportation, Bills, etc.)
- Income deposit (Salary)
- Different date formats
- Automatic categorization

Try uploading it to see the app in action!

## 🎨 Key Features

✅ **Auto-Categorization**: Transactions are automatically categorized based on merchant names
✅ **Multiple Date Formats**: Supports MM/DD/YYYY, YYYY-MM-DD, and more
✅ **CSV Flexibility**: Works with most bank CSV formats
✅ **Real-time Updates**: Changes are reflected immediately
✅ **Beautiful Charts**: Pie and bar charts for spending visualization
✅ **Responsive Design**: Works on desktop, tablet, and mobile

## 📝 CSV Format

Your CSV file needs three columns (they can be named differently):

| Column | Examples | Description |
|--------|----------|-------------|
| Date | "Date", "Transaction Date", "Post Date" | Transaction date |
| Description | "Description", "Merchant", "Details" | Transaction description |
| Amount | "Amount", "Transaction Amount" | Amount (negative for expenses) |

Example CSV:
```csv
Date,Description,Amount
01/15/2026,WHOLE FOODS,-87.45
01/18/2026,SALARY DEPOSIT,3500.00
01/20/2026,NETFLIX,-15.99
```

## 🔧 Troubleshooting

### Backend won't start
- Make sure port 3001 is not in use
- Check that you ran `npm install` in the backend folder
- Look for error messages in the terminal

### Frontend won't start
- Make sure port 5173 is not in use
- Check that you ran `npm install` in the frontend folder
- Try deleting `node_modules` and running `npm install` again

### CSV upload fails
- Verify your CSV has Date, Description, and Amount columns
- Check that dates are in a recognizable format
- Make sure amounts are numbers ($ signs and commas are OK)

### No data shows on dashboard
- Upload at least one CSV file first
- Check the date range filter - adjust to include your transactions
- Make sure the backend is running

## 🎯 Next Steps

1. **Upload your real bank statements**: Download CSV files from your credit cards and bank accounts
2. **Adjust categories**: Click "Edit" on transactions to recategorize them
3. **Track your spending**: Use the dashboard to see where your money goes
4. **Set a routine**: Upload new statements weekly or monthly

## 🚀 Both Servers Running

If you see these messages, you're all set:

**Backend:**
```
Database initialized successfully
Server running on http://localhost:3001
API endpoints available at http://localhost:3001/api
```

**Frontend:**
```
VITE v7.3.1 ready in XXXXms
➜ Local: http://localhost:5173/
```

**Now open your browser to:** http://localhost:5173

Enjoy tracking your finances! 💰
