import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBell, FiCheck, FiX, FiShield, FiHeart, FiShare2,
  FiTrash, FiEye, FiRefreshCw, FiBellOff, FiAlertCircle,
  FiUser, FiMail, FiSmartphone, FiZap,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  fetchNotifications,
  fetchNotificationStats,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  approveAccessRequest,
  rejectAccessRequest
} from '../../features/notifications/notificationsThunks';
import { setPushPermission, setPushSubscribed } from '../../features/notifications/notificationsSlice';
import { isPushSupported, requestPermission, subscribeToPush, isSubscribed } from '../../utils/pushNotifications';
import { ListSkeleton } from '../../components/UI/LoadingSkeleton';
import EmptyState from '../../components/UI/EmptyState';

const POLL_INTERVAL = 30000;

const NOTIF_TYPE_CONFIG = {
  card_loved: { icon: FiHeart, color: 'text-red-500', nav: (n) => n.data?.shortLink ? `/c/${n.data.shortLink}` : (n.data?.actionUrl?.startsWith('/c/') ? n.data.actionUrl : null) },
  card_shared: { icon: FiShare2, color: 'text-emerald-500', nav: (n) => n.data?.shortLink ? `/c/${n.data.shortLink}` : (n.data?.actionUrl?.startsWith('/c/') ? n.data.actionUrl : null) },
  access_request: { icon: FiShield, color: 'text-blue-500', nav: () => '/access-requests' },
  access_approved: { icon: FiCheck, color: 'text-green-500', nav: () => '/access-requests' },
  access_rejected: { icon: FiX, color: 'text-red-500', nav: () => '/access-requests' },
  card_viewed: { icon: FiEye, color: 'text-purple-500', nav: (n) => n.data?.shortLink ? `/c/${n.data.shortLink}` : (n.data?.actionUrl?.startsWith('/c/') ? n.data.actionUrl : null) },
  system: { icon: FiAlertCircle, color: 'text-yellow-500', nav: () => null },
  welcome: { icon: FiZap, color: 'text-emerald-500', nav: () => '/dashboard' },
  default: { icon: FiBell, color: 'text-gray-500 dark:text-slate-400', nav: () => null },
};

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: notifications, unreadCount, loading, stats } = useSelector((s) => s.notifications);
  const [filter, setFilter] = useState('all');
  const [pushStatus, setPushStatus] = useState('unsupported');
  const [actionLoading, setActionLoading] = useState(null);
  const [enablingPush, setEnablingPush] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchNotifications({ page: 1, limit: 50 }));
    dispatch(fetchNotificationStats());
  }, [dispatch]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (isPushSupported()) {
      const perm = Notification.permission;
      setPushStatus(perm);
      dispatch(setPushPermission(perm));
      isSubscribed().then((sub) => dispatch(setPushSubscribed(sub)));
    }
  }, [dispatch]);

  const handleEnablePush = async () => {
    setEnablingPush(true);
    try {
      const perm = await requestPermission();
      setPushStatus(perm);
      dispatch(setPushPermission(perm));
      if (perm === 'granted') {
        const result = await subscribeToPush();
        if (result.success) {
          dispatch(setPushSubscribed(true));
          toast.success('Push notifications enabled');
        } else {
          toast.error('Failed to enable push notifications');
        }
      } else if (perm === 'denied') {
        toast.error('Notifications blocked by browser');
      }
    } finally {
      setEnablingPush(false);
    }
  };

  const getTypeConfig = (type) => NOTIF_TYPE_CONFIG[type] || NOTIF_TYPE_CONFIG.default;

  const getNotificationIcon = (type) => {
    const cfg = getTypeConfig(type);
    const Icon = cfg.icon;
    return <Icon className={`w-4 h-4 ${cfg.color}`} />;
  };

  const formatTimeAgo = (dateString) => {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const tabFilters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'card', label: 'Cards' },
    { key: 'access', label: 'Access' },
    { key: 'system', label: 'System' },
  ];

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'card') return ['card_loved', 'card_shared', 'card_viewed'].includes(n.type);
    if (filter === 'access') return ['access_request', 'access_approved', 'access_rejected'].includes(n.type);
    if (filter === 'system') return ['system', 'welcome', undefined].includes(n.type);
    return true;
  });

  const filterCounts = {
    all: notifications.length,
    unread: unreadCount,
    card: notifications.filter((n) => ['card_loved', 'card_shared', 'card_viewed'].includes(n.type)).length,
    access: notifications.filter((n) => ['access_request', 'access_approved', 'access_rejected'].includes(n.type)).length,
    system: notifications.filter((n) => ['system', 'welcome', undefined].includes(n.type)).length,
  };

  const handleMarkRead = (id) => {
    setActionLoading(`read:${id}`);
    dispatch(markNotificationRead(id)).finally(() => setActionLoading(null));
  };
  const handleMarkAllRead = () => {
    setActionLoading('mark-all');
    dispatch(markAllNotificationsRead()).finally(() => setActionLoading(null));
    toast.success('All notifications marked as read');
  };
  const handleDelete = (id) => {
    setActionLoading(`delete:${id}`);
    dispatch(deleteNotification(id)).finally(() => setActionLoading(null));
  };
  const handleAccept = (requestId) => {
    setActionLoading(`approve:${requestId}`);
    dispatch(approveAccessRequest({ requestId })).finally(() => setActionLoading(null));
  };
  const handleReject = (requestId) => {
    setActionLoading(`reject:${requestId}`);
    dispatch(rejectAccessRequest({ requestId })).finally(() => setActionLoading(null));
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) dispatch(markNotificationRead(n._id));
    const cfg = getTypeConfig(n.type);
    const path = cfg.nav(n);
    if (path) navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 dark:from-slate-950 dark:to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Notifications</h1>
              <p className="text-gray-600 dark:text-slate-400 mt-2">Stay updated on your cards</p>
            </div>
            <div className="flex items-center space-x-3 flex-wrap">
              {isPushSupported() && pushStatus !== 'granted' && (
                <button onClick={handleEnablePush} disabled={enablingPush} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {enablingPush ? (
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  ) : (
                    <FiBell className="w-4 h-4" />
                  )}
                  <span>{enablingPush ? 'Enabling...' : 'Enable Push'}</span>
                </button>
              )}
              {isPushSupported() && pushStatus === 'granted' && (
                <span className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm">
                  <FiBell className="w-4 h-4" /><span>Push enabled</span>
                </span>
              )}
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} disabled={actionLoading === 'mark-all'} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {actionLoading === 'mark-all' ? (
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                  <span>{actionLoading === 'mark-all' ? 'Marking...' : 'Mark all read'}</span>
                </button>
              )}
              <button onClick={load} disabled={loading} className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-full">
                  <FiBell className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.total || notifications.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-full">
                  <FiBellOff className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Unread</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.unread || unreadCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
                  <FiCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.today || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Filters */}
          <div className="flex space-x-1 bg-white dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700 overflow-x-auto">
            {tabFilters.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap ${
                  filter === f.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}>
                <span>{f.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? 'bg-emerald-500 text-emerald-100' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                  {filterCounts[f.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Notification List */}
          {loading && notifications.length === 0 ? (
            <ListSkeleton count={5} />
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <EmptyState
                icon={<FiBell className="h-10 w-10" />}
                title={
                  filter === 'unread' ? 'All caught up!' : 'No notifications'
                }
                description={
                  filter === 'unread'
                    ? "You've read all your notifications. Check back later for updates."
                    : filter === 'all'
                      ? "You'll see notifications here when activity happens on your cards."
                      : `No ${filter} notifications to show.`
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((n) => {
                const navPath = getTypeConfig(n.type).nav(n);
                return (
                  <motion.div key={n._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-4 transition-all ${
                      navPath ? 'cursor-pointer hover:shadow-md' : 'hover:shadow-sm'
                    } ${!n.isRead ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700'}`}
                    onClick={() => handleNotificationClick(n)}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{n.title}</p>
                              {!n.isRead && <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{n.message}</p>
                            <div className="flex items-center space-x-3 mt-2">
                              <p className="text-xs text-gray-400 dark:text-slate-500">{formatTimeAgo(n.createdAt)}</p>
                              {n.type && (
                                <span className="text-xs text-gray-400 dark:text-slate-500 capitalize bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                  {n.type.replace(/_/g, ' ')}
                                </span>
                              )}
                            </div>
                            {n.type === 'access_request' && n.data?.requestId && (
                              <div className="flex space-x-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleAccept(n.data.requestId)} disabled={actionLoading === `approve:${n.data.requestId}` || actionLoading === `reject:${n.data.requestId}`} className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                  {actionLoading === `approve:${n.data.requestId}` ? (
                                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                  ) : (
                                    <FiCheck className="w-3 h-3" />
                                  )}
                                  <span>Accept</span>
                                </button>
                                <button onClick={() => handleReject(n.data.requestId)} disabled={actionLoading === `approve:${n.data.requestId}` || actionLoading === `reject:${n.data.requestId}`} className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                  {actionLoading === `reject:${n.data.requestId}` ? (
                                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                  ) : (
                                    <FiX className="w-3 h-3" />
                                  )}
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
                            {!n.isRead && (
                              <button onClick={() => handleMarkRead(n._id)} disabled={actionLoading === `read:${n._id}`} className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded disabled:opacity-50" title="Mark as read">
                                {actionLoading === `read:${n._id}` ? (
                                  <span className="block animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                                ) : (
                                  <FiEye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                            <button onClick={() => handleDelete(n._id)} disabled={actionLoading === `delete:${n._id}`} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded disabled:opacity-50" title="Delete">
                              {actionLoading === `delete:${n._id}` ? (
                                <span className="block animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                              ) : (
                                <FiTrash className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
