import Papa from 'papaparse';
import { categorizeTransaction } from './categorizer.js';

/**
 * Parse date from various formats
 * @param {string} dateStr - Date string
 * @returns {string} - ISO date string (YYYY-MM-DD)
 */
function parseDate(dateStr) {
  // Try parsing common formats
  const formats = [
    // MM/DD/YYYY or M/D/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // MM-DD-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  ];
  
  // Try ISO format first
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return dateStr;
  }
  
  // Try MM/DD/YYYY format
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try MM-DD-YYYY format
  const dashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const [, month, day, year] = dashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try to parse with Date constructor as fallback
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  throw new Error(`Unable to parse date: ${dateStr}`);
}

/**
 * Parse amount from string (removes $, commas, handles negatives)
 * @param {string} amountStr - Amount string
 * @returns {number} - Parsed amount
 */
function parseAmount(amountStr) {
  // Remove currency symbols, commas, and spaces
  let cleaned = amountStr.toString().replace(/[$,\s]/g, '');
  
  // Handle parentheses as negative (accounting format)
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }
  
  const amount = parseFloat(cleaned);
  
  if (isNaN(amount)) {
    throw new Error(`Unable to parse amount: ${amountStr}`);
  }
  
  return amount;
}

/**
 * Detect column mappings from CSV headers
 * @param {Array} headers - CSV headers
 * @returns {Object} - Column mapping
 */
function detectColumnMapping(headers) {
  const mapping = {
    date: null,
    description: null,
    amount: null
  };
  
  // Normalize headers to lowercase for matching
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Date column detection
  const datePatterns = ['date', 'transaction date', 'post date', 'posting date', 'trans date'];
  for (let i = 0; i < lowerHeaders.length; i++) {
    if (datePatterns.some(pattern => lowerHeaders[i].includes(pattern))) {
      mapping.date = i;
      break;
    }
  }
  
  // Description column detection
  const descPatterns = ['description', 'merchant', 'desc', 'transaction', 'details', 'name'];
  for (let i = 0; i < lowerHeaders.length; i++) {
    if (descPatterns.some(pattern => lowerHeaders[i].includes(pattern))) {
      mapping.description = i;
      break;
    }
  }
  
  // Amount column detection
  const amountPatterns = ['amount', 'transaction amount', 'debit', 'credit', 'value'];
  for (let i = 0; i < lowerHeaders.length; i++) {
    if (amountPatterns.some(pattern => lowerHeaders[i].includes(pattern))) {
      mapping.amount = i;
      break;
    }
  }
  
  // Validate that we found all required columns
  if (mapping.date === null || mapping.description === null || mapping.amount === null) {
    throw new Error('Could not detect required columns (date, description, amount) in CSV');
  }
  
  return mapping;
}

/**
 * Parse CSV file and return transactions
 * @param {string} csvContent - CSV file content
 * @param {string} accountType - Account type (credit_card or checking)
 * @param {string} accountName - Account name
 * @returns {Promise<Array>} - Array of parsed transactions
 */
export function parseCSV(csvContent, accountType, accountName) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          
          if (!results.data || results.data.length === 0) {
            throw new Error('CSV file is empty or has no valid data');
          }
          
          // Detect column mapping
          const headers = results.meta.fields;
          const mapping = detectColumnMapping(headers);
          
          // Parse transactions
          const transactions = results.data
            .filter(row => {
              // Filter out empty rows
              const values = Object.values(row);
              return values.some(val => val && val.toString().trim() !== '');
            })
            .map(row => {
              const rowArray = Object.values(row);
              
              const dateStr = rowArray[mapping.date];
              const description = rowArray[mapping.description];
              const amountStr = rowArray[mapping.amount];
              
              if (!dateStr || !description || !amountStr) {
                return null; // Skip incomplete rows
              }
              
              const date = parseDate(dateStr);
              const amount = parseAmount(amountStr);
              const category = categorizeTransaction(description, amount);
              
              return {
                date,
                description: description.trim(),
                amount,
                category,
                account_type: accountType,
                account_name: accountName
              };
            })
            .filter(t => t !== null); // Remove null entries
          
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}
