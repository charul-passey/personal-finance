# Personal Finance Tracker

A full-stack web application for tracking personal finances, categorizing expenses, and visualizing spending patterns.

## Features

- 📊 **Dashboard** - Visual overview of income, expenses, and net savings
- 💳 **Transaction Management** - View, filter, search, and edit transactions
- 📁 **CSV Upload** - Import transactions from credit card and bank statements
- 🏷️ **Auto-Categorization** - Automatic transaction categorization using keyword matching
- 📈 **Charts & Analytics** - Pie charts and bar charts for spending analysis
- 🎨 **Modern UI** - Clean, responsive interface built with React and TailwindCSS

## Tech Stack

### Backend
- **Node.js** with Express
- **SQLite** database (zero-config, file-based)
- **better-sqlite3** for database operations
- **Multer** for file uploads
- **Papa Parse** for CSV parsing

### Frontend
- **React** with Vite
- **React Router** for navigation
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **Axios** for API calls
- **date-fns** for date formatting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install Backend Dependencies**

```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**

```bash
cd frontend
npm install
```

### Running the Application

1. **Start the Backend Server**

```bash
cd backend
npm start
```

The backend will run on `http://localhost:3001`

2. **Start the Frontend Development Server**

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## Usage

### Uploading Transactions

1. Click on "Upload CSV" in the navigation
2. Drag and drop your CSV file or click "Browse Files"
3. Select account type (Credit Card or Checking)
4. Enter an account name (e.g., "Chase Sapphire", "Wells Fargo Checking")
5. Click "Preview" to see how your transactions will be imported
6. Click "Upload & Save" to save the transactions

### CSV Format

Your CSV file should contain these columns (in any order):
- **Date** - Transaction date (supports MM/DD/YYYY, YYYY-MM-DD, and other formats)
- **Description** - Merchant or transaction description
- **Amount** - Transaction amount (negative for expenses, positive for income)

Example CSV format:

```csv
Date,Description,Amount
01/15/2026,WHOLE FOODS MARKET,-87.45
01/18/2026,SALARY DEPOSIT,3500.00
01/20/2026,NETFLIX SUBSCRIPTION,-15.99
```

A sample CSV file is included: `sample-transactions.csv`

### Managing Transactions

- **View Transactions** - Click "Transactions" to see all your transactions
- **Filter** - Use date range, category, and account filters
- **Search** - Search by transaction description
- **Edit Category** - Click "Edit" to change a transaction's category
- **Delete** - Click "Delete" to remove a transaction

### Dashboard

The dashboard provides:
- Summary cards showing total income, expenses, and net savings
- Pie chart showing spending by category
- Bar chart showing top spending categories
- Account overview table

## Categories

The app automatically categorizes transactions into these categories:

**Expenses:**
- Groceries (Whole Foods, Safeway, etc.)
- Dining (Restaurants, coffee shops, food delivery)
- Transportation (Uber, gas stations, parking)
- Bills (Utilities, subscriptions, insurance)
- Shopping (Amazon, retail stores)
- Entertainment (Movies, gym, gaming)
- Healthcare (Pharmacy, medical)
- Other

**Income:**
- Salary
- Investment
- Refund
- Other Income

## Project Structure

```
personal-finance-app/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express server
│   │   ├── database/
│   │   │   ├── db.js             # Database initialization
│   │   │   └── schema.sql        # Database schema
│   │   ├── routes/
│   │   │   ├── transactions.js   # Transaction API routes
│   │   │   └── upload.js         # Upload API routes
│   │   └── services/
│   │       ├── categorizer.js    # Auto-categorization logic
│   │       └── csvParser.js      # CSV parsing service
│   ├── package.json
│   └── finance.db                # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main app component
│   │   ├── components/
│   │   │   ├── Dashboard.jsx     # Dashboard page
│   │   │   ├── TransactionList.jsx # Transactions page
│   │   │   ├── UploadCSV.jsx     # Upload page
│   │   │   ├── SummaryCard.jsx   # Summary card component
│   │   │   └── Charts.jsx        # Chart components
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   └── utils/
│   │       └── helpers.js        # Helper functions
│   └── package.json
└── sample-transactions.csv       # Sample CSV for testing
```

## API Endpoints

### Transactions

- `GET /api/transactions` - Get all transactions (with optional filters)
  - Query params: `startDate`, `endDate`, `accountType`, `accountName`, `category`
- `GET /api/transactions/summary` - Get aggregated summary data
  - Query params: `startDate`, `endDate`
- `GET /api/transactions/categories/list` - Get all categories
- `POST /api/transactions` - Create a new transaction manually
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Upload

- `POST /api/upload` - Upload and save CSV file
- `POST /api/upload/preview` - Preview CSV without saving

## Future Enhancements

- Budget setting and tracking
- Recurring transaction detection
- Export data to CSV/Excel
- Multi-user support with authentication
- Monthly comparisons and trends
- Bank API integration (Plaid)
- Mobile app

## License

MIT

## Author

Charul Passey
