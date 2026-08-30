import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaBell, FaCheck, FaTimes, FaShieldAlt, FaHeart, FaShareAlt,
  FaTrash, FaEye
} from 'react-icons/fa';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, approveAccessRequest, rejectAccessRequest } from '../../features/notifications/notificationsThunks';

const POLL_INTERVAL = 30000;

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: notifications, unreadCount, loading } = useSelector((s) => s.notifications);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const load = useCallback(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [load]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'access_request': return <FaShieldAlt className="w-4 h-4 text-emerald-500" />;
      case 'access_approved': return <FaCheck className="w-4 h-4 text-green-500" />;
      case 'access_rejected': return <FaTimes className="w-4 h-4 text-red-500" />;
      case 'card_loved': return <FaHeart className="w-4 h-4 text-red-500" />;
      case 'card_shared': return <FaShareAlt className="w-4 h-4 text-emerald-500" />;
      default: return <FaBell className="w-4 h-4 text-gray-500 dark:text-slate-400" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const runAction = (key, fn) => {
    setActionLoading(key);
    Promise.resolve(fn()).finally(() => setActionLoading(null));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => runAction('mark-all', () => dispatch(markAllNotificationsRead()))}
                      disabled={actionLoading === 'mark-all'}
                      className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'mark-all' ? (
                        <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                      ) : (
                        'Mark all read'
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {loading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-slate-400">
                    <FaBell className="w-8 h-8 mb-2" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                          !n.isRead ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                        }`}
                        onClick={() => {
                          if (n.data?.actionUrl) {
                            navigate(n.data.actionUrl);
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{n.title}</p>
                                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{n.message}</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{formatTimeAgo(n.createdAt)}</p>
                                {n.type === 'access_request' && n.data?.requestId && (
                                  <div className="flex space-x-2 mt-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => runAction(`approve:${n.data.requestId}`, () => dispatch(approveAccessRequest({ requestId: n.data.requestId })))}
                                      disabled={actionLoading === `approve:${n.data.requestId}`}
                                      className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {actionLoading === `approve:${n.data.requestId}` ? (
                                        <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                      ) : (
                                        <FaCheck className="w-2.5 h-2.5" />
                                      )}
                                      <span>Accept</span>
                                    </button>
                                    <button
                                      onClick={() => runAction(`reject:${n.data.requestId}`, () => dispatch(rejectAccessRequest({ requestId: n.data.requestId })))}
                                      disabled={actionLoading === `reject:${n.data.requestId}`}
                                      className="flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {actionLoading === `reject:${n.data.requestId}` ? (
                                        <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                      ) : (
                                        <FaTimes className="w-2.5 h-2.5" />
                                      )}
                                      <span>Reject</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
                                {!n.isRead && (
                                  <button
                                    onClick={() => runAction(`read:${n._id}`, () => dispatch(markNotificationRead(n._id)))}
                                    disabled={actionLoading === `read:${n._id}`}
                                    className="p-1 text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                                    title="Mark as read"
                                  >
                                    {actionLoading === `read:${n._id}` ? (
                                      <span className="block animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
                                    ) : (
                                      <FaEye className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => runAction(`delete:${n._id}`, () => dispatch(deleteNotification(n._id)))}
                                  disabled={actionLoading === `delete:${n._id}`}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                  title="Delete"
                                >
                                  {actionLoading === `delete:${n._id}` ? (
                                    <span className="block animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
                                  ) : (
                                    <FaTrash className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/notifications');
                    }}
                    className="w-full text-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
