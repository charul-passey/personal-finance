import { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function UploadCSV() {
  const [file, setFile] = useState(null);
  const [accountType, setAccountType] = useState('credit_card');
  const [accountName, setAccountName] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setPreview(null);
  };
  
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  const handlePreview = async () => {
    if (!file || !accountName.trim()) {
      setError('Please select a file and enter an account name');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('account_type', accountType);
      formData.append('account_name', accountName.trim());
      
      const response = await uploadAPI.preview(formData);
      setPreview(response.data.data);
    } catch (err) {
      console.error('Error previewing CSV:', err);
      setError(err.response?.data?.error || 'Failed to preview CSV. Make sure the file format is correct.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleUpload = async () => {
    if (!file || !accountName.trim()) {
      setError('Please select a file and enter an account name');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('account_type', accountType);
      formData.append('account_name', accountName.trim());
      
      const response = await uploadAPI.upload(formData);
      
      setSuccess(true);
      setPreview(response.data.data);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFile(null);
        setAccountName('');
        setPreview(null);
        setSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    } catch (err) {
      console.error('Error uploading CSV:', err);
      setError(err.response?.data?.error || 'Failed to upload CSV. Make sure the backend server is running.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Upload CSV</h2>
        <p className="mt-2 text-gray-600">
          Upload credit card or checking account statements to track your finances
        </p>
      </div>
      
      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            
            {file ? (
              <div>
                <span className="text-5xl mb-4 block">📄</span>
                <p className="text-lg font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-4 text-sm text-red-600 hover:text-red-700"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <span className="text-5xl mb-4 block">📁</span>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer transition-colors"
                >
                  Browse Files
                </label>
              </div>
            )}
          </div>
          
          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type *
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="credit_card">Credit Card</option>
                <option value="checking">Checking Account</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g., Chase Freedom, Wells Fargo Checking"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePreview}
              disabled={!file || !accountName.trim() || uploading}
              className="flex-1 px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Processing...' : 'Preview'}
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || !accountName.trim() || uploading}
              className="flex-1 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload & Save'}
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-xl mr-2">✅</span>
                <p className="text-green-800">
                  Successfully uploaded {preview?.count} transactions!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* CSV Format Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 CSV Format Guide</h3>
        <p className="text-blue-800 mb-3">
          Your CSV file should include these columns (in any order):
        </p>
        <ul className="list-disc list-inside text-blue-800 space-y-1 mb-3">
          <li><strong>Date</strong> - Transaction date (MM/DD/YYYY, YYYY-MM-DD, etc.)</li>
          <li><strong>Description</strong> - Merchant or transaction description</li>
          <li><strong>Amount</strong> - Transaction amount (negative for expenses, positive for income)</li>
        </ul>
        <p className="text-sm text-blue-700">
          💡 Tip: Most bank CSV exports work automatically. The system will auto-detect column names and formats.
        </p>
      </div>
      
      {/* Preview Table */}
      {preview && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Preview ({preview.count} transactions)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing first {preview.preview?.length || 0} transactions
            </p>
          </div>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.preview?.map((transaction, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {transaction.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
