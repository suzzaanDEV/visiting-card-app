import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiMail, FiPhone, FiAlertTriangle } from 'react-icons/fi';
import { FaExclamationTriangle } from 'react-icons/fa';

const AccountBlocked = ({ contactEmail = 'admin@cardly.com' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Deactivated</h1>
          <p className="text-gray-600">
            Your account has been temporarily suspended
          </p>
        </div>

        {/* Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 font-medium mb-1">
                Access Restricted
              </p>
              <p className="text-sm text-red-700">
                Your account has been deactivated by the administrator. You cannot access the platform at this time.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
          <p className="text-gray-600 text-sm">
            If you believe this is an error or need to reactivate your account, please contact our support team.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiMail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Support</p>
                <p className="text-sm text-gray-600">{contactEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiPhone className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone Support</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = `mailto:${contactEmail}?subject=Account Reactivation Request&body=Hello, I would like to request reactivation of my account.`}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FiMail className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Return to Home
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <FiShield className="w-4 h-4" />
            <span className="text-sm">Cardly Security Team</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountBlocked;
