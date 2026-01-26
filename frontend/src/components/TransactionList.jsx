import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { formatCurrency, formatDate, getCategoryColor, getDateRanges } from '../utils/helpers';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  
  // Filters
  const [dateRange, setDateRange] = useState('last30Days');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const dateRanges = getDateRanges();
  
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [dateRange, categoryFilter, accountFilter]);
  
  const fetchCategories = async () => {
    try {
      const response = await transactionAPI.getCategories();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const range = dateRanges[dateRange];
      const params = {
        startDate: range.start,
        endDate: range.end,
      };
      
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      
      if (accountFilter) {
        params.accountName = accountFilter;
      }
      
      const response = await transactionAPI.getAll(params);
      setTransactions(response.data.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditCategory = (transaction) => {
    setEditingId(transaction.id);
    setEditCategory(transaction.category);
  };
  
  const handleSaveCategory = async (id) => {
    try {
      await transactionAPI.update(id, { category: editCategory });
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Failed to update category');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCategory('');
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      await transactionAPI.delete(id);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction');
    }
  };
  
  // Get unique accounts from transactions
  const uniqueAccounts = [...new Set(transactions.map(t => t.account_name))];
  
  // Filter transactions by search term
  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Transactions</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchTransactions}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Transactions</h2>
        <div className="mt-4 sm:mt-0 text-sm text-gray-600">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="last30Days">Last 30 Days</option>
              <option value="last90Days">Last 90 Days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account
            </label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Accounts</option>
              {uniqueAccounts.map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      {filteredTransactions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingId === transaction.id ? (
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="block w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                          autoFocus
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: `${getCategoryColor(transaction.category)}20`,
                            color: getCategoryColor(transaction.category),
                          }}
                        >
                          {transaction.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.account_type === 'credit_card'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.account_name}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === transaction.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleSaveCategory(transaction.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditCategory(transaction)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter || accountFilter 
              ? 'Try adjusting your filters'
              : 'Upload a CSV file to get started'}
          </p>
          {!searchTerm && !categoryFilter && !accountFilter && (
            <a
              href="/upload"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Upload CSV
            </a>
          )}
        </div>
      )}
    </div>
  );
}
