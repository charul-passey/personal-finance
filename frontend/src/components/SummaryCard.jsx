import { formatCurrency } from '../utils/helpers';

export default function SummaryCard({ title, amount, type, icon, trend }) {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  const isNet = type === 'net';
  
  let bgColor = 'bg-gray-50';
  let textColor = 'text-gray-900';
  let iconBg = 'bg-gray-100';
  
  if (isIncome) {
    bgColor = 'bg-green-50';
    textColor = 'text-green-900';
    iconBg = 'bg-green-100';
  } else if (isExpense) {
    bgColor = 'bg-red-50';
    textColor = 'text-red-900';
    iconBg = 'bg-red-100';
  } else if (isNet) {
    bgColor = amount >= 0 ? 'bg-blue-50' : 'bg-orange-50';
    textColor = amount >= 0 ? 'text-blue-900' : 'text-orange-900';
    iconBg = amount >= 0 ? 'bg-blue-100' : 'bg-orange-100';
  }
  
  return (
    <div className={`${bgColor} rounded-lg shadow-sm p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>
            {formatCurrency(amount)}
          </p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`${iconBg} rounded-full p-3`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
