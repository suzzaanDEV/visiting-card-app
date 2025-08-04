import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiCreditCard, FiTrendingUp, FiEye, FiDownload, FiShare2,
  FiSettings, FiLogOut, FiPlus, FiEdit, FiTrash2, FiGrid, FiBarChart2,
  FiAlertCircle, FiCheckCircle, FiClock, FiStar, FiZap, FiMenu, FiX,
  FiActivity, FiDollarSign, FiGlobe, FiSmartphone, FiDatabase, FiServer,
  FiShield, FiBell, FiSearch, FiFilter, FiRefreshCw, FiArrowRight,
  FiCalendar, FiMapPin, FiHeart, FiMessageSquare, FiAward, FiHome,
  FiLayers, FiFileText, FiPieChart, FiUserCheck, FiLock, FiUnlock,
  FiTrello, FiMonitor, FiCpu, FiHardDrive, FiWifi
} from 'react-icons/fi';
import { 
  FaChartLine, FaUsers, FaCreditCard, FaEye, FaHeart, FaShareAlt,
  FaDownload, FaGlobe, FaMobile, FaDesktop, FaTablet, FaMapMarkedAlt,
  FaCrown, FaUserShield, FaCog, FaTachometerAlt, FaLayerGroup, FaPalette
} from 'react-icons/fa';
import { logout } from '../../features/auth/authThunks';
import toast from 'react-hot-toast';

const AdminLayout = ({ children, title = 'Admin Dashboard' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Add notification system
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const navigation = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FaTachometerAlt,
      path: '/admin',
      color: 'blue',
      description: 'Overview and analytics'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: FiUsers,
      path: '/admin/users',
      color: 'green',
      description: 'Manage users and permissions'
    },
    {
      id: 'cards',
      label: 'Card Management',
      icon: FiCreditCard,
      path: '/admin/cards',
      color: 'purple',
      description: 'Manage visiting cards'
    },
    {
      id: 'access-requests',
      label: 'Access Requests',
      icon: FiShield,
      path: '/admin/access-requests',
      color: 'yellow',
      description: 'Manage private card access'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FiLayers,
      path: '/admin/templates',
      color: 'orange',
      description: 'Design templates'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: FiBarChart2,
      path: '/admin/analytics',
      color: 'indigo',
      description: 'Detailed analytics'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FiSettings,
      path: '/admin/settings',
      color: 'gray',
      description: 'System configuration'
    }
  ];

  const handleLogout = () => {
    // Clear admin data from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Navigate to admin login
    navigate('/admin/login');
    toast.success('Admin logged out successfully');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    toast.info('Search functionality coming soon');
  };

  const getCurrentNavItem = () => {
    return navigation.find(item => location.pathname.startsWith(item.path)) || navigation[0];
  };

  const getUserInfo = () => {
    // Get admin user from localStorage
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      const parsedUser = JSON.parse(adminUser);
      return {
        name: parsedUser.name || parsedUser.username || 'Admin',
        email: parsedUser.email || 'admin@cardly.com'
      };
    }
    
    return {
      name: 'Admin',
      email: 'admin@cardly.com'
    };
  };

  const userInfo = getUserInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="hidden lg:block w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaCrown className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-lg">Admin Panel</h1>
                <p className="text-gray-500 text-sm">Control Center</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {userInfo.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm font-medium">{userInfo.name}</p>
                <p className="text-gray-500 text-xs">{userInfo.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <FiLogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        className={`fixed lg:hidden inset-y-0 left-0 z-50 w-80 bg-white shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaCrown className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-lg">Admin Panel</h1>
                <p className="text-gray-500 text-sm">Control Center</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {userInfo.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm font-medium">{userInfo.name}</p>
                <p className="text-gray-500 text-xs">{userInfo.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <FiLogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-500 text-sm">
                  {getCurrentNavItem()?.label} • Admin Panel
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search - Hidden on mobile */}
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64"
                  />
                </div>
              </form>

              {/* Mobile Search Button */}
              <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <FiSearch className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                <FiBell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Refresh */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <FiRefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 