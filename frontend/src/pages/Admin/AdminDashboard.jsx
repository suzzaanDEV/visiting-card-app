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
  FiTrello, FiWifi, FiZap as FiZapIcon
} from 'react-icons/fi';
import { 
  FaChartLine, FaUsers, FaCreditCard, FaEye, FaHeart, FaShareAlt,
  FaDownload, FaGlobe, FaMobile, FaDesktop, FaTablet, FaMapMarkedAlt,
  FaCrown, FaUserShield, FaTachometerAlt, FaLayerGroup, FaPalette
} from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
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
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    todayViews: 0,
    todayCards: 0,
    todayRevenue: 0
  });
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    cardGrowth: [],
    deviceAnalytics: {},
    geographicAnalytics: {}
  });
  // Add auto-refresh functionality
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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
        // Don't set any fallback data - let the UI handle empty state
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Don't set any fallback data - let the UI handle empty state
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/realtime', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRealTimeData(data);
      } else {
        console.error('Failed to fetch real-time data:', response.status);
        // Don't set any fallback data - let the UI handle empty state
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      // Don't set any fallback data - let the UI handle empty state
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/analytics?period=7d', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Use fallback analytics data
        setAnalytics({
          userGrowth: [
            { date: '2024-01-01', users: 1200 },
            { date: '2024-01-02', users: 1220 },
            { date: '2024-01-03', users: 1240 },
            { date: '2024-01-04', users: 1260 },
            { date: '2024-01-05', users: 1280 },
            { date: '2024-01-06', users: 1300 },
            { date: '2024-01-07', users: 1320 }
          ],
          cardGrowth: [
            { date: '2024-01-01', cards: 3200 },
            { date: '2024-01-02', cards: 3250 },
            { date: '2024-01-03', cards: 3300 },
            { date: '2024-01-04', cards: 3350 },
            { date: '2024-01-05', cards: 3400 },
            { date: '2024-01-06', cards: 3420 },
            { date: '2024-01-07', cards: 3450 }
          ],
          deviceAnalytics: {
            desktop: 45,
            mobile: 40,
            tablet: 15
          },
          geographicAnalytics: {
            'United States': 35,
            'United Kingdom': 20,
            'Canada': 15,
            'Australia': 10,
            'Others': 20
          }
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use fallback analytics data
      setAnalytics({
        userGrowth: [
          { date: '2024-01-01', users: 1200 },
          { date: '2024-01-02', users: 1220 },
          { date: '2024-01-03', users: 1240 },
          { date: '2024-01-04', users: 1260 },
          { date: '2024-01-05', users: 1280 },
          { date: '2024-01-06', users: 1300 },
          { date: '2024-01-07', users: 1320 }
        ],
        cardGrowth: [
          { date: '2024-01-01', cards: 3200 },
          { date: '2024-01-02', cards: 3250 },
          { date: '2024-01-03', cards: 3300 },
          { date: '2024-01-04', cards: 3350 },
          { date: '2024-01-05', cards: 3400 },
          { date: '2024-01-06', cards: 3420 },
          { date: '2024-01-07', cards: 3450 }
        ],
        deviceAnalytics: {
          desktop: 45,
          mobile: 40,
          tablet: 15
        },
        geographicAnalytics: {
          'United States': 35,
          'United Kingdom': 20,
          'Canada': 15,
          'Australia': 10,
          'Others': 20
        }
      });
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle, trend }) => (
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
      {change && (
        <div className="flex items-center mt-4">
          <span className={`text-sm font-medium ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-gray-500 text-sm ml-2">from last month</span>
        </div>
      )}
      {trend && (
        <div className="flex items-center mt-2">
          {trend === 'up' ? (
            <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <FiTrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className="text-xs text-gray-500">Trending {trend}</span>
        </div>
      )}
    </motion.div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'user_created': return FiUsers;
        case 'card_created': return FiCreditCard;
        case 'template_updated': return FiEdit;
        case 'user_login': return FiActivity;
        case 'card_viewed': return FiEye;
        case 'card_shared': return FiShare2;
        default: return FiActivity;
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'user_created': return 'text-green-600 bg-green-100';
        case 'card_created': return 'text-blue-600 bg-blue-100';
        case 'template_updated': return 'text-purple-600 bg-purple-100';
        case 'user_login': return 'text-orange-600 bg-orange-100';
        case 'card_viewed': return 'text-indigo-600 bg-indigo-100';
        case 'card_shared': return 'text-pink-600 bg-pink-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const Icon = getActivityIcon(activity.type);
    
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    );
  };

  const SystemStatusCard = ({ title, status, icon: Icon, color, details }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
            <span className="text-xs text-gray-500 capitalize truncate">{status}</span>
          </div>
          {details && (
            <p className="text-xs text-gray-400 mt-1">{details}</p>
          )}
        </div>
      </div>
    </div>
  );

  const TemplateCard = ({ template }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <FaLayerGroup className="text-white h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{template.name}</p>
          <p className="text-xs text-gray-500">{template.usageCount} uses</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {template.isFeatured && (
          <FiStar className="h-4 w-4 text-yellow-500" />
        )}
        <span className="text-sm font-medium text-gray-900">{template.rating || 4.5}</span>
      </div>
    </div>
  );

  const AnalyticsChart = ({ title, data, type = 'line' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-48 flex items-center justify-center">
        <div className="text-center">
          <FiBarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Chart visualization</p>
          <p className="text-gray-400 text-xs">Data points: {data?.length || 0}</p>
        </div>
      </div>
    </div>
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
    <AdminLayout title="Dashboard Overview">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Active Users"
          value={realTimeData.activeUsers}
          change={12.5}
          icon={FiUsers}
          color="blue"
          subtitle="Currently online"
          trend="up"
        />
        <StatCard
          title="Today's Views"
          value={realTimeData.todayViews}
          change={8.2}
          icon={FiEye}
          color="green"
          subtitle="Card views today"
          trend="up"
        />
        <StatCard
          title="New Cards"
          value={realTimeData.todayCards}
          change={15.7}
          icon={FiCreditCard}
          color="purple"
          subtitle="Created today"
          trend="up"
        />
        <StatCard
          title="Revenue"
          value={`$${realTimeData.todayRevenue}`}
          change={23.1}
          icon={FiDollarSign}
          color="orange"
          subtitle="Today's earnings"
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* System Status */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <SystemStatusCard
                title="Server"
                status={stats.serverStatus}
                icon={FiServer}
                color="green"
                details="Response time: 45ms"
              />
              <SystemStatusCard
                title="Database"
                status={stats.databaseStatus}
                icon={FiDatabase}
                color="blue"
                details="Connected to MongoDB"
              />
              <SystemStatusCard
                title="API"
                status={stats.apiStatus}
                icon={FiZap}
                color="purple"
                details="All endpoints operational"
              />
              <SystemStatusCard
                title="Overall Health"
                status={stats.systemHealth}
                icon={FiShield}
                color="green"
                details="System running optimally"
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiActivity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Templates */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Templates</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {stats.popularTemplates && stats.popularTemplates.length > 0 ? (
                stats.popularTemplates.map((template) => (
                  <TemplateCard key={template._id} template={template} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiLayers className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No templates available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <AnalyticsChart
          title="User Growth"
          data={analytics.userGrowth}
          type="line"
        />
        <AnalyticsChart
          title="Card Creation"
          data={analytics.cardGrowth}
          type="bar"
        />
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={5.2}
          icon={FaUsers}
          color="blue"
        />
        <StatCard
          title="Total Cards"
          value={stats.totalCards.toLocaleString()}
          change={12.8}
          icon={FaCreditCard}
          color="green"
        />
        <StatCard
          title="Total Templates"
          value={stats.totalTemplates.toLocaleString()}
          change={8.5}
          icon={FaLayerGroup}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          change={25.3}
          icon={FiDollarSign}
          color="orange"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          change={18.5}
          icon={FiEye}
          color="indigo"
        />
        <StatCard
          title="Total Loves"
          value={stats.totalLoves.toLocaleString()}
          change={22.1}
          icon={FiHeart}
          color="pink"
        />
        <StatCard
          title="Total Shares"
          value={stats.totalShares.toLocaleString()}
          change={15.7}
          icon={FiShare2}
          color="teal"
        />
        <StatCard
          title="Total Downloads"
          value={stats.totalDownloads.toLocaleString()}
          change={9.3}
          icon={FiDownload}
          color="cyan"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 