import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getCategoryColor } from '../utils/helpers';

export function CategoryPieChart({ data }) {
  const chartData = data
    .filter(item => item.total < 0) // Only expenses
    .map(item => ({
      name: item.category,
      value: Math.abs(item.total),
    }));
  
  const COLORS = chartData.map(item => getCategoryColor(item.name));
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No expense data available
        </div>
      )}
    </div>
  );
}

export function CategoryBarChart({ data }) {
  const chartData = data
    .filter(item => item.total < 0) // Only expenses
    .map(item => ({
      category: item.category,
      amount: Math.abs(item.total),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8); // Top 8 categories
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Bar dataKey="amount" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No expense data available
        </div>
      )}
    </div>
  );
}
