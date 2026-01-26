import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount));
};

export const formatDate = (dateString) => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const getDateRanges = () => {
  const today = new Date();
  
  return {
    today: {
      start: format(today, 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
    },
    thisWeek: {
      start: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      end: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    },
    thisMonth: {
      start: format(startOfMonth(today), 'yyyy-MM-dd'),
      end: format(endOfMonth(today), 'yyyy-MM-dd'),
    },
    last30Days: {
      start: format(subDays(today, 30), 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
    },
    last90Days: {
      start: format(subDays(today, 90), 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
    },
  };
};

export const getCategoryColor = (category) => {
  const colors = {
    'Groceries': '#10b981',
    'Dining': '#f59e0b',
    'Transportation': '#3b82f6',
    'Bills': '#8b5cf6',
    'Shopping': '#ec4899',
    'Entertainment': '#06b6d4',
    'Healthcare': '#ef4444',
    'Other': '#6b7280',
    'Salary': '#22c55e',
    'Investment': '#14b8a6',
    'Refund': '#84cc16',
    'Other Income': '#a3e635',
  };
  
  return colors[category] || '#6b7280';
};
