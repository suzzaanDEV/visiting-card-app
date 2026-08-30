import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiCreditCard, FiEye, FiDownload, FiShare2,
  FiActivity, FiDollarSign, FiGlobe, FiSmartphone, FiDatabase, FiServer,
  FiShield, FiBell, FiSearch, FiFilter, FiRefreshCw, FiArrowRight,
  FiCalendar, FiMapPin, FiHeart, FiMessageSquare, FiAward, FiZap,
  FiCheckCircle, FiAlertCircle, FiClock, FiStar, FiEdit, FiLayers,
  FiBarChart2, FiPieChart, FiTrendingUp, FiTrendingDown, FiUserPlus,
  FiFileText, FiSettings, FiGrid, FiMonitor, FiCpu, FiHardDrive,
  FiTrello, FiWifi, FiSend, FiX, FiCheck, FiUser, FiLock, FiUnlock
} from 'react-icons/fi';
import { 
  FaChartLine, FaUsers, FaCreditCard, FaEye, FaHeart, FaShareAlt,
  FaDownload, FaGlobe, FaMobile, FaDesktop, FaTablet, FaMapMarkedAlt,
  FaCrown, FaUserShield, FaTachometerAlt, FaLayerGroup, FaPalette,
  FaEnvelope, FaPhone, FaMapMarkerAlt
} from 'react-icons/fa';

import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../services/apiService';
import { getToken } from '../../utils/authStorage';

const AccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    fetchAccessRequests();
  }, []);

  const fetchAccessRequests = async () => {
    try {
      setLoading(true);
      setResponding('refresh');
      const token = getToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cards/access-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        console.error('Failed to fetch access requests:', response.status);
        toast.error('Failed to load access requests');
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
      toast.error('Failed to load access requests');
    } finally {
      setLoading(false);
      setResponding(null);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setResponding('approve');
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/cards/access-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: responseMessage })
      });

      if (response.ok) {
        toast.success('Access request approved');
        fetchAccessRequests();
        setShowModal(false);
        setResponseMessage('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setResponding(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setResponding('reject');
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/cards/access-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: responseMessage })
      });

      if (response.ok) {
        toast.success('Access request rejected');
        fetchAccessRequests();
        setShowModal(false);
        setResponseMessage('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setResponding(null);
    }
  };

  const getFilteredRequests = () => {
    let filtered = requests;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(request => request.status === filter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        request.cardId?.fullName?.toLowerCase().includes(query) ||
        request.requesterId?.name?.toLowerCase().includes(query) ||
        request.requesterId?.email?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 border-yellow-200 dark:border-yellow-800';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'approved':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <FiX className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const RequestCard = ({ request }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-full">
            <FiUser className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {request.requesterId?.name || request.requesterId?.username || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {request.requesterId?.email || 'No email'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
          {getStatusIcon(request.status)}
          <span className="capitalize">{request.status}</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <FiCreditCard className="h-4 w-4 text-gray-500 dark:text-slate-400" />
          <span className="text-sm text-gray-600 dark:text-slate-400">Card:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
            {request.cardId?.fullName || request.cardId?.title || 'Unknown Card'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <FiCalendar className="h-4 w-4 text-gray-500 dark:text-slate-400" />
          <span className="text-sm text-gray-600 dark:text-slate-400">Requested:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
            {formatDate(request.createdAt)}
          </span>
        </div>

        {request.requestMessage && (
          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
            <p className="text-sm text-gray-700 dark:text-slate-300">
              <span className="font-medium">Message:</span> {request.requestMessage}
            </p>
          </div>
        )}

        {request.responseMessage && (
          <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded-lg p-3">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              <span className="font-medium">Your Response:</span> {request.responseMessage}
            </p>
          </div>
        )}
      </div>

      {request.status === 'pending' && (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedRequest(request);
              setShowModal(true);
            }}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FiCheck className="w-4 h-4" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => {
              setSelectedRequest(request);
              setShowModal(true);
            }}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FiX className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      )}
    </motion.div>
  );

  const filteredRequests = getFilteredRequests();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 dark:from-slate-950 dark:to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Access Requests</h1>
              <p className="text-gray-600 dark:text-slate-400 mt-2">Manage access requests for your private cards</p>
            </div>
            <button
              onClick={fetchAccessRequests}
              disabled={responding === 'refresh'}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={`w-4 h-4 ${responding === 'refresh' ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by user or card..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-full">
                  <FiUsers className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{requests.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-full">
                  <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
                  <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {requests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-full">
                  <FiX className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {requests.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No access requests found</h3>
              <p className="text-gray-600 dark:text-slate-400">You don't have any access requests for your cards yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRequests.map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
          )}
        </div>

        {/* Response Modal */}
        <AnimatePresence>
          {showModal && selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Respond to Request</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 dark:text-slate-400 mb-4">
                    {selectedRequest.requesterId?.name || selectedRequest.requesterId?.username} is requesting access to{' '}
                    <strong>{selectedRequest.cardId?.fullName || selectedRequest.cardId?.title}</strong>
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Response Message (optional)
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Add a message to the user..."
                      className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={Boolean(responding)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRejectRequest(selectedRequest._id)}
                    disabled={Boolean(responding)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {responding === 'reject' ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <FiX className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveRequest(selectedRequest._id)}
                    disabled={Boolean(responding)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {responding === 'approve' ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <FiCheck className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AccessRequests; 