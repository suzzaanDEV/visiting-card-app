import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiBarChart2, FiPieChart, FiTrendingUp, FiTrendingDown, FiUsers,
  FiCreditCard, FiEye, FiHeart, FiShare2, FiDownload, FiCalendar,
  FiFilter, FiRefreshCw, FiDownload as FiDownloadIcon, FiGlobe,
  FiSmartphone, FiMonitor, FiTablet, FiMapPin, FiActivity
} from 'react-icons/fi';
import { 
  FaChartLine, FaUsers, FaCreditCard, FaEye, FaHeart, FaShareAlt,
  FaDownload, FaGlobe, FaMobile, FaDesktop, FaTablet, FaMapMarkedAlt
} from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      totalCards: 0,
      totalViews: 0,
      totalRevenue: 0,
      growthRate: 0
    },
    userGrowth: [],
    cardGrowth: [],
    deviceAnalytics: {
      desktop: 0,
      mobile: 0,
      tablet: 0
    },
    geographicAnalytics: {},
    engagementMetrics: {
      views: 0,
      loves: 0,
      shares: 0,
      downloads: 0,
      avgSessionTime: 0,
      bounceRate: 0
    },
    topCards: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

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
        // Use fallback data
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
      // Use fallback data
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
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
          <span className="text-gray-500 text-sm ml-2">from last period</span>
        </div>
      )}
    </motion.div>
  );

  const ChartCard = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'card_created': return FiCreditCard;
        case 'card_viewed': return FiEye;
        case 'card_shared': return FiShare2;
        case 'user_registered': return FiUsers;
        case 'card_loved': return FiHeart;
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
          <p className="text-sm font-medium text-gray-900 truncate">
            {activity.user} {activity.card && `• ${activity.card}`}
          </p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    );
  };

  const TopCardItem = ({ card, rank }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
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
        <span>{card.loves} ❤️</span>
        <span>{card.shares} 📤</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            onClick={fetchAnalytics}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiRefreshCw className="h-5 w-5" />
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
        <ChartCard title="User Growth">
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <FiBarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">User growth chart</p>
              <p className="text-gray-400 text-xs">Data points: {analytics.userGrowth?.length || 0}</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Card Creation">
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <FiTrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Card creation trend</p>
              <p className="text-gray-400 text-xs">Data points: {analytics.cardGrowth?.length || 0}</p>
            </div>
          </div>
        </ChartCard>
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
        <ChartCard title="Device Usage" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaDesktop className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700">Desktop</span>
              </div>
              <span className="text-sm font-semibold">{analytics.deviceAnalytics?.desktop || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaMobile className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">Mobile</span>
              </div>
              <span className="text-sm font-semibold">{analytics.deviceAnalytics?.mobile || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaTablet className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-700">Tablet</span>
              </div>
              <span className="text-sm font-semibold">{analytics.deviceAnalytics?.tablet || 0}%</span>
            </div>
          </div>
        </ChartCard>

        {/* Geographic Analytics */}
        <ChartCard title="Geographic Distribution" className="lg:col-span-1">
          <div className="space-y-3">
            {Object.entries(analytics.geographicAnalytics || {}).map(([country, percentage]) => (
              <div key={country} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{country}</span>
                </div>
                <span className="text-sm font-semibold">{percentage}%</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Session Analytics */}
        <ChartCard title="Session Analytics" className="lg:col-span-1">
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
        </ChartCard>
      </div>

      {/* Top Cards and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <ChartCard title="Top Performing Cards">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(analytics.topCards || []).map((card, index) => (
              <TopCardItem key={card.id} card={card} rank={index + 1} />
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recent Activity">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(analytics.recentActivity || []).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </ChartCard>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard; 