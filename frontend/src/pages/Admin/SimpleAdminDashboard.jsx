import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiCreditCard, FiEye, FiDownload, FiShare2,
  FiActivity, FiDollarSign, FiGlobe, FiSmartphone, FiDatabase, FiServer,
  FiShield, FiBell, FiSearch, FiFilter, FiRefreshCw, FiArrowRight,
  FiCalendar, FiMapPin, FiHeart, FiMessageSquare, FiAward, FiZap,
  FiCheckCircle, FiAlertCircle, FiClock, FiStar, FiEdit, FiLayers,
  FiBarChart2, FiPieChart, FiTrendingUp, FiTrendingDown, FiUserPlus,
  FiFileText, FiSettings, FiGrid, FiMonitor, FiCpu, FiHardDrive
} from 'react-icons/fi';
import { 
  FaChartLine, FaUsers, FaCreditCard, FaEye, FaHeart, FaShareAlt,
  FaDownload, FaGlobe, FaMobile, FaDesktop, FaTablet, FaMapMarkedAlt,
  FaCrown, FaUserShield, FaTachometerAlt, FaLayerGroup, FaPalette
} from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';

const SimpleAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCards: 0,
    totalTemplates: 0,
    totalViews: 0,
    totalLoves: 0,
    totalShares: 0,
    totalDownloads: 0,
    activeUsers: 0,
    newUsersToday: 0,
    revenue: 0,
    recentActivity: [],
    popularTemplates: [],
    systemHealth: 'healthy',
    serverStatus: 'online',
    databaseStatus: 'connected',
    apiStatus: 'operational'
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchCards();
    fetchTemplates();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data:', data);
        setStats(data);
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/users?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/cards?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="text-white h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">
            {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{user.name || user.username}</h4>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-xs text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 text-xs rounded-full ${
            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );

  const CardItem = ({ card }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
          <FiCreditCard className="text-white h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{card.fullName}</h4>
          <p className="text-sm text-gray-600">{card.jobTitle} at {card.company}</p>
          <p className="text-xs text-gray-500">Created: {new Date(card.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{card.views || 0} views</div>
          <div className="text-xs text-gray-500">{card.loveCount || 0} loves</div>
        </div>
      </div>
    </div>
  );

  const TemplateItem = ({ template }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <FiLayers className="text-white h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{template.name}</h4>
          <p className="text-sm text-gray-600">{template.category}</p>
          <p className="text-xs text-gray-500">Used {template.usageCount || 0} times</p>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 text-xs rounded-full ${
            template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {template.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Dashboard">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your visiting card system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={FaUsers}
          color="blue"
          subtitle="Registered users"
        />
        <StatCard
          title="Total Cards"
          value={stats.totalCards.toLocaleString()}
          icon={FaCreditCard}
          color="green"
          subtitle="Created cards"
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          icon={FiEye}
          color="indigo"
          subtitle="Card views"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={FiDollarSign}
          color="orange"
          subtitle="System revenue"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">User Management</h3>
              <p className="text-blue-100 text-sm mt-1">Manage users and permissions</p>
            </div>
            <FaUsers className="h-8 w-8 text-blue-200" />
          </div>
          <button 
            onClick={() => window.location.href = '/admin/users'}
            className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Users
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Card Management</h3>
              <p className="text-green-100 text-sm mt-1">Manage business cards</p>
            </div>
            <FaCreditCard className="h-8 w-8 text-green-200" />
          </div>
          <button 
            onClick={() => window.location.href = '/admin/cards'}
            className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Cards
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Templates</h3>
              <p className="text-purple-100 text-sm mt-1">Manage card templates</p>
            </div>
            <FaLayerGroup className="h-8 w-8 text-purple-200" />
          </div>
          <button 
            onClick={() => window.location.href = '/admin/templates'}
            className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Templates
          </button>
        </motion.div>
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {users.slice(0, 3).map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
            {users.length === 0 && (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
          </div>
        </div>

        {/* Recent Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Cards</h3>
            <button 
              onClick={() => window.location.href = '/admin/cards'}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {cards.slice(0, 3).map((card) => (
              <CardItem key={card._id} card={card} />
            ))}
            {cards.length === 0 && (
              <p className="text-gray-500 text-center py-4">No cards found</p>
            )}
          </div>
        </div>

        {/* Popular Templates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Popular Templates</h3>
            <button 
              onClick={() => window.location.href = '/admin/templates'}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {templates.slice(0, 3).map((template) => (
              <TemplateItem key={template._id} template={template} />
            ))}
            {templates.length === 0 && (
              <p className="text-gray-500 text-center py-4">No templates found</p>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Server: {stats.serverStatus}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Database: {stats.databaseStatus}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">API: {stats.apiStatus}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Overall: {stats.systemHealth}</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SimpleAdminDashboard; 