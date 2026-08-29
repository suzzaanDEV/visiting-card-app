import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiUsers, FiCreditCard, FiLayers, FiBarChart2, FiSettings, 
  FiBell, FiSearch, FiMenu, FiX, FiLogOut, FiUser, FiShield,
  FiMessageSquare, FiFileText, FiActivity, FiTag, FiSend,
  FiSun, FiMoon, FiMonitor,
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../services/apiService';
import { useTheme } from '../../context/ThemeContext';

const ThemeModeButton = ({ mode, icon: Icon, label, current, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`p-2 rounded-lg transition-colors ${
      current(mode)
        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
        : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
    }`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const AdminLayout = ({ children, title = "Admin Panel" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ siteName: 'Cardly', maintenanceMode: false });
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const checkAdminAuth = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
      navigate('/admin/login');
      return;
    }

    try {
      setAdminUser(JSON.parse(user));
    } catch (error) {
      console.error('Error parsing admin user:', error);
      navigate('/admin/login');
    }
  }, [navigate]);
  useEffect(() => {
    checkAdminAuth();
    fetchNotifications();
    fetchPublicSettings();
  }, [checkAdminAuth]);

  const fetchPublicSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings/public`);
      if (res.ok) {
        const data = await res.json();
        setSiteSettings(data);
      }
    } catch { /* ignore */ }
  };


  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: FiHome,
      current: location.pathname === '/admin'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: FiUsers,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Cards',
      href: '/admin/cards',
      icon: FiCreditCard,
      current: location.pathname === '/admin/cards'
    },
    {
      name: 'Templates',
      href: '/admin/templates',
      icon: FiLayers,
      current: location.pathname === '/admin/templates'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: FiBarChart2,
      current: location.pathname === '/admin/analytics'
    },
    {
      name: 'Access Requests',
      href: '/admin/access-requests',
      icon: FiShield,
      current: location.pathname === '/admin/access-requests'
    },
    {
      name: 'CRM',
      href: '/admin/crm',
      icon: FiMessageSquare,
      current: location.pathname === '/admin/crm'
    },
    {
      name: 'Policies',
      href: '/admin/policies',
      icon: FiFileText,
      current: location.pathname === '/admin/policies'
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: FiTag,
      current: location.pathname === '/admin/categories'
    },
    {
      name: 'Audit Log',
      href: '/admin/audit',
      icon: FiActivity,
      current: location.pathname === '/admin/audit'
    },
    {
      name: 'Broadcasts',
      href: '/admin/broadcasts',
      icon: FiSend,
      current: location.pathname === '/admin/broadcasts'
    },
    {
      name: 'Notif. Templates',
      href: '/admin/notification-templates',
      icon: FiFileText,
      current: location.pathname === '/admin/notification-templates'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: FiSettings,
      current: location.pathname === '/admin/settings'
    },
    {
      name: 'Profile',
      href: '/admin/profile',
      icon: FiUser,
      current: location.pathname === '/admin/profile'
    }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600 opacity-75" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <FaCrown className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">{siteSettings.siteName || 'Cardly'}</h1>
                <p className="text-xs text-gray-500 dark:text-slate-400">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-r-2 border-emerald-700'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      item.current ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-500 dark:hover:text-slate-300'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Admin info */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                  {adminUser?.name || adminUser?.email || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:text-red-400 transition-colors"
                title="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation */}
        <div className="sticky top-0 z-30 bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900 dark:text-slate-100">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-slate-700 p-0.5" title="Theme preference">
                <ThemeModeButton mode="light" icon={FiSun} label="Light mode" current={(m) => theme === m} onClick={() => setTheme('light')} />
                <ThemeModeButton mode="dark" icon={FiMoon} label="Dark mode" current={(m) => theme === m} onClick={() => setTheme('dark')} />
                <ThemeModeButton mode="system" icon={FiMonitor} label="Follow system" current={(m) => theme === m} onClick={() => setTheme('system')} />
              </div>

              {/* Search */}
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:placeholder-gray-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50"
                      >
                      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                            <FiBell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-slate-400" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200 dark:divide-slate-700">
                            {notifications.slice(0, 5).map((notification) => (
                              <div key={notification._id} className={`p-4 hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                                !notification.isRead ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-emerald-500' : ''
                              }`} onClick={async () => {
                                if (!notification.isRead) {
                                  try {
                                    const token = localStorage.getItem('adminToken');
                                    await fetch(`${API_BASE_URL}/admin/notifications/${notification._id}/read`, {
                                      method: 'PUT',
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
                                  } catch { /* ignore */ }
                                }
                              }}>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-slate-700">
                          <button onClick={() => { setShowNotifications(false); navigate('/admin/notifications'); }}
                            className="w-full text-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors">
                            View all notifications
                          </button>
                        </div>
                      )}
                    </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Admin avatar */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {adminUser?.name || adminUser?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {siteSettings.maintenanceMode && (
            <div className="mb-4 px-4 py-3 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-lg text-amber-800 dark:text-amber-200 text-sm font-medium">
              Maintenance mode is currently active. Users may experience limited access.
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 