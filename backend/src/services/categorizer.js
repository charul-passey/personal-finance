// Auto-categorization based on keywords in transaction descriptions
const categoryRules = {
  'Groceries': [
    'whole foods', 'safeway', 'trader joe', 'kroger', 'walmart', 'target',
    'grocery', 'supermarket', 'food mart', 'albertsons', 'publix', 'costco',
    'sam\'s club', 'aldi', 'sprouts', 'fresh market'
  ],
  'Dining': [
    'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'burger',
    'pizza', 'subway', 'chipotle', 'panera', 'doordash', 'uber eats',
    'grubhub', 'postmates', 'dine', 'bar & grill', 'kitchen', 'bistro',
    'taco bell', 'wendy\'s', 'kfc', 'chick-fil-a', 'domino', 'papa john'
  ],
  'Transportation': [
    'uber', 'lyft', 'taxi', 'gas', 'fuel', 'shell', 'chevron', 'exxon',
    'bp', 'parking', 'metro', 'transit', 'airline', 'car wash', 'auto',
    'dmv', 'registration', 'insurance', 'geico', 'state farm'
  ],
  'Bills': [
    'electric', 'utility', 'water', 'gas company', 'internet', 'phone',
    'verizon', 'at&t', 'tmobile', 'comcast', 'spectrum', 'netflix',
    'spotify', 'hulu', 'disney+', 'amazon prime', 'apple.com/bill',
    'subscription', 'mortgage', 'rent', 'insurance premium'
  ],
  'Shopping': [
    'amazon', 'ebay', 'etsy', 'best buy', 'home depot', 'lowe\'s',
    'macy\'s', 'nordstrom', 'gap', 'old navy', 'zara', 'h&m',
    'nike', 'adidas', 'apple store', 'mall', 'retail', 'shop'
  ],
  'Entertainment': [
    'movie', 'theater', 'cinema', 'amc', 'regal', 'spotify', 'steam',
    'playstation', 'xbox', 'nintendo', 'concert', 'ticketmaster',
    'gym', 'fitness', 'sport', 'golf', 'bowling', 'zoo', 'museum'
  ],
  'Healthcare': [
    'pharmacy', 'cvs', 'walgreens', 'rite aid', 'hospital', 'medical',
    'doctor', 'clinic', 'dental', 'vision', 'health', 'laboratory',
    'prescription'
  ],
  'Salary': [
    'payroll', 'salary', 'direct dep', 'employer', 'wages', 'paycheck'
  ],
  'Investment': [
    'dividend', 'interest', 'capital gain', 'stock', 'bond', 'investment'
  ],
  'Refund': [
    'refund', 'return', 'reimbursement', 'credit adjustment'
  ]
};

/**
 * Categorize a transaction based on its description
 * @param {string} description - Transaction description
 * @param {number} amount - Transaction amount (positive for income, negative for expense)
 * @returns {string} - Category name
 */
export function categorizeTransaction(description, amount) {
  const lowerDesc = description.toLowerCase();
  
  // Check each category's keywords
  for (const [category, keywords] of Object.entries(categoryRules)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Default categorization based on amount
  if (amount > 0) {
    return 'Other Income';
  }
  
  return 'Other';
}

/**
 * Get all available categories
 * @param {Database} db - SQLite database instance
 * @returns {Array} - Array of category objects
 */
export function getCategories(db) {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  return stmt.all();
}
