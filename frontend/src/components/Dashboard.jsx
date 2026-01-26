import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import SummaryCard from './SummaryCard';
import { CategoryPieChart, CategoryBarChart } from './Charts';
import { getDateRanges } from '../utils/helpers';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dateRanges = getDateRanges();
  
  useEffect(() => {
    fetchSummary();
  }, [dateRange]);
  
  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const range = dateRanges[dateRange];
      const response = await transactionAPI.getSummary({
        startDate: range.start,
        endDate: range.end,
      });
      
      setSummary(response.data.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('Failed to load dashboard data. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };
  
  const getDateRangeLabel = () => {
    const labels = {
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      last30Days: 'Last 30 Days',
      last90Days: 'Last 90 Days',
    };
    return labels[dateRange] || 'This Month';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            <h3 className="text-lg font-semibold text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchSummary}
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
      {/* Header with date range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="block w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="last30Days">Last 30 Days</option>
            <option value="last90Days">Last 90 Days</option>
          </select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Income"
          amount={summary?.income || 0}
          type="income"
          icon="💵"
          trend={getDateRangeLabel()}
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary?.expenses || 0}
          type="expense"
          icon="💳"
          trend={getDateRangeLabel()}
        />
        <SummaryCard
          title="Net Savings"
          amount={summary?.net || 0}
          type="net"
          icon="💰"
          trend={getDateRangeLabel()}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={summary?.categoryTotals || []} />
        <CategoryBarChart data={summary?.categoryTotals || []} />
      </div>
      
      {/* Account Summary */}
      {summary?.accounts && summary.accounts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.accounts.map((account, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.account_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.account_type === 'credit_card' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {account.account_type === 'credit_card' ? 'Credit Card' : 'Checking'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.count}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      account.total >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${Math.abs(account.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {(!summary?.categoryTotals || summary.categoryTotals.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by uploading your first CSV file with transactions
          </p>
          <a
            href="/upload"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Upload CSV
          </a>
        </div>
      )}
    </div>
  );
}
