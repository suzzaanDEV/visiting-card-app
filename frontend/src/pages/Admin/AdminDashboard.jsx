import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import AdminLayout from '../../components/Admin/AdminLayout';
import { LineChartComponent, BarChartComponent } from '../../components/Admin/ChartComponent';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      // Fetch dashboard stats
      const dashboardResponse = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (dashboardResponse.ok) {
        const dashboard = await dashboardResponse.json();
        setDashboardData(dashboard);
      }

      // Fetch analytics data
      const analyticsResponse = await fetch(`/api/admin/analytics?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        setAnalyticsData(analytics);
      }

      // Fetch real-time data
      const realtimeResponse = await fetch('/api/admin/realtime', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (realtimeResponse.ok) {
        const realtime = await realtimeResponse.json();
        setRealtimeData(realtime);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <FiTrendingUp className="w-4 h-4 mr-1" /> : <FiTrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const TopCardItem = ({ card, rank }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
        rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
      }`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {card.title || card.fullName || 'Untitled Card'}
        </h4>
        <p className="text-xs text-gray-500">
          {card.owner?.name || card.owner?.username || 'Unknown Owner'}
        </p>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900">{card.views || 0}</div>
        <div className="text-xs text-gray-500">views</div>
      </div>
    </motion.div>
  );

  const ActivityItem = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <FiActivity className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {activity.description || 'Activity'}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(activity.timestamp).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor your platform's performance and activity</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={dashboardData?.totalUsers || 0}
            icon={<FaUsers className="w-6 h-6 text-blue-600" />}
            color="bg-blue-100"
            trend={dashboardData?.userGrowth || 0}
            subtitle="Active accounts"
          />
          <StatCard
            title="Total Cards"
            value={dashboardData?.totalCards || 0}
            icon={<FaCreditCard className="w-6 h-6 text-green-600" />}
            color="bg-green-100"
            trend={dashboardData?.cardGrowth || 0}
            subtitle="Created cards"
          />
          <StatCard
            title="Total Views"
            value={analyticsData?.overview?.totalViews || 0}
            icon={<FaEye className="w-6 h-6 text-purple-600" />}
            color="bg-purple-100"
            subtitle="Card views"
          />
          <StatCard
            title="Total Engagement"
            value={
              (analyticsData?.overview?.totalLoves || 0) + 
              (analyticsData?.overview?.totalShares || 0) + 
              (analyticsData?.overview?.totalDownloads || 0)
            }
            icon={<FaHeart className="w-6 h-6 text-red-600" />}
            color="bg-red-100"
            subtitle="Loves, shares & downloads"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <FiTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <LineChartComponent
              data={analyticsData?.userGrowth || []}
              title="User Growth"
              color="#3B82F6"
            />
          </motion.div>

          {/* Card Creation Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Card Creation</h3>
              <FiCreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <BarChartComponent
              data={analyticsData?.cardGrowth || []}
              title="Card Creation"
              color="#10B981"
            />
          </motion.div>
        </div>

        {/* Top Performing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Cards</h3>
            <FaCrown className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {analyticsData?.topCards?.slice(0, 5).map((card, index) => (
              <TopCardItem key={card._id} card={card} rank={index + 1} />
            ))}
            {(!analyticsData?.topCards || analyticsData.topCards.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <FiCreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No cards with views yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <FiActivity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              {analyticsData?.recentActivity?.slice(0, 8).map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
              {(!analyticsData?.recentActivity || analyticsData.recentActivity.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <FiActivity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaEye className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Today's Views</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {realtimeData?.todayViews || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaCreditCard className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">New Cards</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {realtimeData?.todayCards || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaUsers className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Active Users</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {realtimeData?.activeUsers || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FiUser className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">New Users</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {realtimeData?.todayUsers || 0}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 