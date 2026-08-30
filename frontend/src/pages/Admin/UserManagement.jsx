import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiUserCheck,
  FiUserX, FiMail, FiPhone, FiCalendar, FiMapPin, FiGlobe, FiActivity,
  FiCreditCard, FiHeart, FiShare2, FiDownload, FiStar,
  FiMoreVertical, FiRefreshCw, FiDownload as FiDownloadIcon, FiUpload, FiX
} from 'react-icons/fi';
import { FaUserShield, FaUserCheck, FaUserTimes, FaCrown } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, filterStatus, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchQuery,
        sortBy,
        sortOrder,
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        console.error('Failed to fetch users:', response.status);
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = {}) => {
    const loadingKey = `${userId}:${action}`;
    setActionLoading(loadingKey);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      let url = `/api/admin/users/${userId}`;
      let method = 'PUT';

      switch (action) {
        case 'ban':
          url += '/ban';
          method = 'POST';
          break;
        case 'unban':
          url += '/unban';
          method = 'POST';
          break;
        case 'delete':
          method = 'DELETE';
          break;
        case 'update':
          method = 'PUT';
          break;
        default:
          break;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method !== 'DELETE' ? JSON.stringify(data) : undefined
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success(responseData.message || `User ${action}ed successfully`);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    setBulkLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const promises = selectedUsers.map(userId => 
        handleUserAction(userId, action)
      );

      await Promise.all(promises);
      setSelectedUsers([]);
      toast.success(`Bulk ${action} completed`);
    } catch (error) {
      console.error(`Error bulk ${action}ing users:`, error);
      toast.error(`Failed to bulk ${action} users`);
    } finally {
      setBulkLoading(false);
    }
  };

  const refreshUsers = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const UserCard = ({ user }) => {
    const isSelected = selectedUsers.includes(user._id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200 ${
          isSelected ? 'ring-2 ring-emerald-500 bg-emerald-100 dark:bg-emerald-900/40' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedUsers([...selectedUsers, user._id]);
                } else {
                  setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                }
              }}
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400 rounded focus:ring-emerald-500"
            />
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 truncate">
                  {user.name || user.username}
                </h3>
                {user.role === 'admin' && (
                  <FaCrown className="h-4 w-4 text-yellow-500" />
                )}
                {user.isActive ? (
                  <FaUserCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <FaUserTimes className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-gray-600 dark:text-slate-400 text-sm">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-slate-400">
                <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                <span>Cards: {user.cardCount || 0}</span>
                <span>Views: {user.totalViews || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedUser(user);
                setShowUserModal(true);
              }}
              className="p-2 text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:bg-emerald-900/40 rounded-lg transition-colors"
            >
              <FiEye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleUserAction(user._id, user.isActive ? 'ban' : 'unban')}
              disabled={actionLoading === `${user._id}:${user.isActive ? 'ban' : 'unban'}`}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                user.isActive 
                  ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:text-red-300 hover:bg-red-100 dark:bg-red-900/40' 
                  : 'text-green-600 dark:text-green-400 hover:text-green-700 dark:text-green-300 hover:bg-green-100 dark:bg-green-900/40'
              }`}
              title={user.isActive ? 'Ban User' : 'Unban User'}
            >
              {actionLoading === `${user._id}:${user.isActive ? 'ban' : 'unban'}` ? (
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
              ) : user.isActive ? <FiUserX className="h-4 w-4" /> : <FiUserCheck className="h-4 w-4" />}
            </button>
            <button
              onClick={() => handleUserAction(user._id, 'delete')}
              disabled={actionLoading === `${user._id}:delete`}
              className="p-2 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:text-red-400 hover:bg-red-100 dark:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === `${user._id}:delete` ? (
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
              ) : <FiTrash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* User Stats */}
        <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{user.cardCount || 0}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Cards</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{user.totalViews || 0}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{user.totalLoves || 0}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Loves</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{user.totalShares || 0}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Shares</div>
          </div>
        </div>
      </motion.div>
    );
  };

  const UserModal = ({ user, isOpen, onClose }) => {
    if (!user || !isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">User Details</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:bg-slate-700 rounded-lg"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Name</label>
                    <p className="text-gray-900 dark:text-slate-100">{user.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Username</label>
                    <p className="text-gray-900 dark:text-slate-100">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</label>
                    <p className="text-gray-900 dark:text-slate-100">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Role</label>
                    <p className="text-gray-900 dark:text-slate-100 capitalize">{user.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Total Cards</span>
                    <span className="font-semibold">{user.cardCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Total Views</span>
                    <span className="font-semibold">{user.totalViews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Total Loves</span>
                    <span className="font-semibold">{user.totalLoves || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Total Shares</span>
                    <span className="font-semibold">{user.totalShares || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Member Since</span>
                    <span className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleUserAction(user._id, 'update', { isActive: !user.isActive })}
                disabled={actionLoading === `${user._id}:update`}
                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  user.isActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {actionLoading === `${user._id}:update` ? (
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                ) : user.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleUserAction(user._id, 'delete')}
                disabled={actionLoading === `${user._id}:delete`}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === `${user._id}:delete` ? (
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                ) : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">User Management</h1>
          <p className="text-gray-600 dark:text-slate-400">Manage all users and their permissions</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('ban')}
                disabled={bulkLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading ? (
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                ) : `Ban Selected (${selectedUsers.length})`}
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
          
          <button
            onClick={refreshUsers}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent inline-block" />
            ) : <FiRefreshCw className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
            <option value="admin">Admins</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="createdAt">Join Date</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="cardCount">Card Count</option>
            <option value="totalViews">Total Views</option>
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {users.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 disabled:text-gray-400 dark:text-slate-500 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-medium ${
                  currentPage === page
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:bg-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 disabled:text-gray-400 dark:text-slate-500 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
      />
    </AdminLayout>
  );
};

export default UserManagement; 