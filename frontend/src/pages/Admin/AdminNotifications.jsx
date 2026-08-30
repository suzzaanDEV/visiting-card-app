import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { API_BASE_URL } from '../../services/apiService';
import { FiBell, FiCheck, FiRefreshCw, FiInbox } from 'react-icons/fi';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchNotifications = useCallback(async (page = 1, isReadFilter = filter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (isReadFilter && isReadFilter !== 'all') {
        params.set('isRead', isReadFilter === 'read' ? 'true' : 'false');
      }
      const res = await fetch(`${API_BASE_URL}/admin/notifications?${params}`, {
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load notifications');
        setNotifications([]);
      } else {
        setNotifications(data.notifications || []);
        setPagination(data.pagination || { page: 1, total: 0, pages: 0 });
      }
    } catch {
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications(1, filter);
  }, [fetchNotifications, filter]);

  const markAsRead = async (notification) => {
    setActionLoading(notification._id);
    try {
      await fetch(`${API_BASE_URL}/admin/notifications/${notification._id}/read`, {
        method: 'PUT',
        headers: authHeaders()
      });
      setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const filterTabs = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' }
  ];

  return (
    <AdminLayout title="Notifications">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Notifications</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            System and access-request notifications.{' '}
            {!loading && pagination.total > 0 && `${pagination.total} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === tab.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchNotifications(pagination.page, filter)}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <FiInbox className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
            <p className="text-gray-500 dark:text-slate-400">No notifications yet</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
              System and access-request notifications will appear here once they occur.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-5 ${!notification.isRead ? 'bg-emerald-50/60 dark:bg-emerald-900/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                          {notification.title || 'Notification'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification)}
                        disabled={actionLoading === notification._id}
                        className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === notification._id ? (
                          <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                        ) : <FiCheck className="w-3 h-3" />} Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchNotifications(pagination.page - 1, filter)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchNotifications(pagination.page + 1, filter)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;