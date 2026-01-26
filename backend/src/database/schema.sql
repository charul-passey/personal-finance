-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('expense', 'income'))
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK(account_type IN ('credit_card', 'checking')),
    account_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, type) VALUES 
    ('Groceries', 'expense'),
    ('Dining', 'expense'),
    ('Transportation', 'expense'),
    ('Bills', 'expense'),
    ('Shopping', 'expense'),
    ('Entertainment', 'expense'),
    ('Healthcare', 'expense'),
    ('Other', 'expense'),
    ('Salary', 'income'),
    ('Investment', 'income'),
    ('Refund', 'income'),
    ('Other Income', 'income');
