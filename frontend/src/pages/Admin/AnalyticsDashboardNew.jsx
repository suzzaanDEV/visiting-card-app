import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBarChart2, FiPieChart, FiTrendingUp, FiTrendingDown, FiUsers,
  FiCreditCard, FiEye, FiHeart, FiShare2, FiDownload, FiCalendar,
  FiFilter, FiRefreshCw, FiDownload as FiDownloadIcon, FiGlobe,
  FiSmartphone, FiMonitor, FiTablet, FiMapPin, FiActivity,
  FiPlay, FiPause, FiVolume2, FiZap, FiTarget, FiAward
} from 'react-icons/fi';
import { 
  FaChartLine, FaUsers, FaCreditCard, FaEye, FaHeart, FaShareAlt,
  FaDownload, FaGlobe, FaMobile, FaDesktop, FaTablet, FaMapMarkedAlt,
  FaRocket, FaLightbulb, FaChartBar, FaChartPie, FaTachometerAlt
} from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';

// Enhanced Chart Component
const EnhancedChart = ({ data, title, type = 'line', color = 'blue', height = 'h-64' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg`}>
        <div className="text-center">
          <FiBarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count || d.value || 0));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className={`${height} relative`}>
        {type === 'line' && (
          <svg className="w-full h-full" viewBox={`0 0 ${data.length * 60} 200`}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={`rgb(59, 130, 246)`} stopOpacity="0.3" />
                <stop offset="100%" stopColor={`rgb(59, 130, 246)`} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#gradient-${color})`}
              d={`M 30,180 ${data.map((d, i) => {
                const x = i * 60 + 30;
                const y = 180 - ((d.count || d.value || 0) / maxValue) * 160;
                return `L ${x},${y}`;
              }).join(' ')} L ${data.length * 60 + 30},180 Z`}
            />
            <polyline
              fill="none"
              stroke={`rgb(59, 130, 246)`}
              strokeWidth="3"
              points={data.map((d, i) => {
                const x = i * 60 + 30;
                const y = 180 - ((d.count || d.value || 0) / maxValue) * 160;
                return `${x},${y}`;
              }).join(' ')}
            />
            {data.map((d, i) => {
              const x = i * 60 + 30;
              const y = 180 - ((d.count || d.value || 0) / maxValue) * 160;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="white"
                  stroke={`rgb(59, 130, 246)`}
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        )}
        {type === 'bar' && (
          <div className="flex items-end justify-between h-full space-x-2">
            {data.map((d, i) => {
              const height = ((d.count || d.value || 0) / maxValue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full bg-gradient-to-t from-${color}-500 to-${color}-600 rounded-t transition-all duration-300 hover:from-${color}-600 hover:to-${color}-700`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">
                    {d._id || d.date || i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsDashboardNew = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 1250,
      totalCards: 3400,
      totalViews: 15600,
      totalRevenue: 1250.50,
      growthRate: 12.5
    },
    userGrowth: [
      { _id: '2024-01-01', count: 1200 },
      { _id: '2024-01-02', count: 1220 },
      { _id: '2024-01-03', count: 1240 },
      { _id: '2024-01-04', count: 1260 },
      { _id: '2024-01-05', count: 1280 },
      { _id: '2024-01-06', count: 1300 },
      { _id: '2024-01-07', count: 1320 }
    ],
    cardGrowth: [
      { _id: '2024-01-01', count: 3200 },
      { _id: '2024-01-02', count: 3250 },
      { _id: '2024-01-03', count: 3300 },
      { _id: '2024-01-04', count: 3350 },
      { _id: '2024-01-05', count: 3400 },
      { _id: '2024-01-06', count: 3420 },
      { _id: '2024-01-07', count: 3450 }
    ],
    deviceAnalytics: {
      desktop: 45,
      mobile: 40,
      tablet: 15
    },
    geographicAnalytics: {
      'United States': 35,
      'India': 25,
      'United Kingdom': 15,
      'Canada': 10,
      'Australia': 8,
      'Others': 7
    },
    engagementMetrics: {
      views: 15600,
      loves: 3200,
      shares: 1800,
      downloads: 950,
      avgSessionTime: 4.5,
      bounceRate: 23.5
    },
    topCards: [
      { id: 1, name: 'John Doe - Developer', views: 450, loves: 120, shares: 45 },
      { id: 2, name: 'Jane Smith - Designer', views: 380, loves: 95, shares: 32 },
      { id: 3, name: 'Mike Johnson - Manager', views: 320, loves: 78, shares: 28 },
      { id: 4, name: 'Sarah Wilson - Consultant', views: 290, loves: 65, shares: 22 },
      { id: 5, name: 'David Brown - Engineer', views: 250, loves: 55, shares: 18 }
    ],
    recentActivity: [
      { id: 1, type: 'card_viewed', user: 'John Doe', card: 'Developer Card', time: '2 minutes ago' },
      { id: 2, type: 'card_shared', user: 'Jane Smith', card: 'Designer Card', time: '5 minutes ago' },
      { id: 3, type: 'user_registered', user: 'New User', time: '10 minutes ago' },
      { id: 4, type: 'card_loved', user: 'Mike Johnson', card: 'Manager Card', time: '15 minutes ago' },
      { id: 5, type: 'card_downloaded', user: 'Sarah Wilson', card: 'Consultant Card', time: '20 minutes ago' }
    ]
  });

  useEffect(() => {
    fetchAnalytics();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalytics();
      }, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [period, autoRefresh]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to fetch analytics:', response.status);
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle, loading = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
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
          <span className="text-gray-500 text-sm ml-2">from last period</span>
        </div>
      )}
    </motion.div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'card_created': return FiCreditCard;
        case 'card_viewed': return FiEye;
        case 'card_shared': return FiShare2;
        case 'user_registered': return FiUsers;
        case 'card_loved': return FiHeart;
        case 'card_downloaded': return FiDownload;
        default: return FiActivity;
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'card_created': return 'text-blue-600 bg-blue-100';
        case 'card_viewed': return 'text-green-600 bg-green-100';
        case 'card_shared': return 'text-purple-600 bg-purple-100';
        case 'user_registered': return 'text-orange-600 bg-orange-100';
        case 'card_loved': return 'text-pink-600 bg-pink-100';
        case 'card_downloaded': return 'text-cyan-600 bg-cyan-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const Icon = getActivityIcon(activity.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {activity.user} {activity.card && `• ${activity.card}`}
          </p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </motion.div>
    );
  };

  const TopCardItem = ({ card, rank }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{card.name}</p>
          <p className="text-xs text-gray-500">{card.views} views</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <span className="flex items-center">
          <FiHeart className="h-3 w-3 mr-1 text-red-500" />
          {card.loves}
        </span>
        <span className="flex items-center">
          <FiShare2 className="h-3 w-3 mr-1 text-blue-500" />
          {card.shares}
        </span>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics Dashboard">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Detailed insights and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button
            onClick={() => {
              fetchAnalytics();
              toast.success('Analytics refreshed');
            }}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiRefreshCw className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {autoRefresh ? <FiPlay className="h-5 w-5" /> : <FiPause className="h-5 w-5" />}
          </button>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <FiDownloadIcon className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={(analytics.overview?.totalUsers || 0).toLocaleString()}
          change={12.5}
          icon={FaUsers}
          color="blue"
          subtitle="Registered users"
        />
        <StatCard
          title="Total Cards"
          value={(analytics.overview?.totalCards || 0).toLocaleString()}
          change={8.2}
          icon={FaCreditCard}
          color="green"
          subtitle="Created cards"
        />
        <StatCard
          title="Total Views"
          value={(analytics.overview?.totalViews || 0).toLocaleString()}
          change={15.7}
          icon={FaEye}
          color="purple"
          subtitle="Card views"
        />
        <StatCard
          title="Revenue"
          value={`$${(analytics.overview?.totalRevenue || 0).toLocaleString()}`}
          change={23.1}
          icon={FaChartLine}
          color="orange"
          subtitle="Total earnings"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <EnhancedChart
          title="User Growth"
          data={analytics.userGrowth}
          type="line"
          color="blue"
        />
        <EnhancedChart
          title="Card Creation"
          data={analytics.cardGrowth}
          type="bar"
          color="green"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Views"
          value={(analytics.engagementMetrics?.views || 0).toLocaleString()}
          change={18.5}
          icon={FiEye}
          color="indigo"
        />
        <StatCard
          title="Total Loves"
          value={(analytics.engagementMetrics?.loves || 0).toLocaleString()}
          change={22.1}
          icon={FiHeart}
          color="pink"
        />
        <StatCard
          title="Total Shares"
          value={(analytics.engagementMetrics?.shares || 0).toLocaleString()}
          change={15.7}
          icon={FiShare2}
          color="teal"
        />
        <StatCard
          title="Total Downloads"
          value={(analytics.engagementMetrics?.downloads || 0).toLocaleString()}
          change={9.3}
          icon={FiDownload}
          color="cyan"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* Device Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaDesktop className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700">Desktop</span>
              </div>
              <span className="text-sm font-semibold">{analytics.deviceAnalytics?.desktop || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analytics.deviceAnalytics?.desktop || 0}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaMobile className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">Mobile</span>
              </div>
              <span className="text-sm font-semibold">{analytics.deviceAnalytics?.mobile || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics.deviceAnalytics?.mobile || 0}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaTablet className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-700">Tablet</span>
              </div>
              <span className="text-sm font-semibold">{analytics.deviceAnalytics?.tablet || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${analytics.deviceAnalytics?.tablet || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Geographic Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.geographicAnalytics || {}).map(([country, percentage], index) => (
              <div key={country} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{country}</span>
                </div>
                <span className="text-sm font-semibold">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Session Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Avg Session Time</span>
              <span className="text-sm font-semibold">{analytics.engagementMetrics?.avgSessionTime || 0} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Bounce Rate</span>
              <span className="text-sm font-semibold">{analytics.engagementMetrics?.bounceRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Growth Rate</span>
              <span className="text-sm font-semibold text-green-600">+{analytics.overview?.growthRate || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Cards and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Cards</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {(analytics.topCards || []).map((card, index) => (
                <TopCardItem key={card.id} card={card} rank={index + 1} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {(analytics.recentActivity || []).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboardNew;
