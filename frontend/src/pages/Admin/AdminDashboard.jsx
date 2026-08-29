import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiActivity, FiArrowRight, FiCreditCard, FiRefreshCw, FiTrendingDown, FiTrendingUp, FiUser } from 'react-icons/fi';
import { FaCreditCard, FaCrown, FaEye, FaHeart, FaUsers } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import { BarChartComponent, LineChartComponent, PieChartComponent } from '../../components/Admin/ChartComponent';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../services/apiService';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchAdminEndpoint = async (endpoint, token) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`);
    }

    return response.json();
  };

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const [dashboard, analytics, realtime] = await Promise.all([
        fetchAdminEndpoint('/admin/dashboard', token),
        fetchAdminEndpoint(`/admin/analytics?period=${selectedPeriod}`, token),
        fetchAdminEndpoint('/admin/realtime', token)
      ]);

      setDashboardData(dashboard);
      setAnalyticsData(analytics);
      setRealtimeData(realtime);
      setLastSyncedAt(new Date());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load admin dashboard data');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const overview = analyticsData?.overview || {};
  const engagement = {
    loves: overview.totalLoves || analyticsData?.engagementMetrics?.loves || 0,
    shares: overview.totalShares || analyticsData?.engagementMetrics?.shares || 0,
    downloads: overview.totalDownloads || analyticsData?.engagementMetrics?.downloads || 0
  };

  const totalEngagement = engagement.loves + engagement.shares + engagement.downloads;
  const engagementRate = useMemo(() => {
    const totalViews = overview.totalViews || 0;
    if (!totalViews) return 0;
    return Number(((totalEngagement / totalViews) * 100).toFixed(2));
  }, [overview.totalViews, totalEngagement]);

  const platformHealth = useMemo(() => {
    const uptime = realtimeData?.uptimeDetails || null;
    const apiLatency = realtimeData?.averageApiLatency ?? 0;
    const dbConnected = dashboardData?.databaseStatus !== 'disconnected';
    const status = dbConnected && apiLatency < 500 ? 'Healthy' : 'Attention needed';
    const uptimeLabel = uptime
      ? `${uptime.days > 0 ? `${uptime.days}d ` : ''}${uptime.hours > 0 ? `${uptime.hours}h ` : ''}${uptime.minutes}m`
      : '—';
    return { uptimeLabel, apiLatency, status };
  }, [realtimeData, dashboardData]);

  const geoCount = Object.keys(analyticsData?.geographicAnalytics || {}).length;
  const deviceTotalPct = (analyticsData?.deviceAnalytics?.desktop || 0) +
    (analyticsData?.deviceAnalytics?.mobile || 0) +
    (analyticsData?.deviceAnalytics?.tablet || 0);

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
      className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
        rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : rank === 3 ? 'bg-orange-500' : 'bg-emerald-500'
      }`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
          {card.title || card.fullName || 'Untitled Card'}
        </h4>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {card.owner?.name || card.owner?.username || 'Unknown Owner'}
        </p>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{card.views || 0}</div>
        <div className="text-xs text-gray-500 dark:text-slate-400">views</div>
      </div>
    </motion.div>
  );

  const ActivityItem = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-700 rounded-lg transition-colors"
    >
      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
        <FiActivity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
          {activity.description || 'Activity'}
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {new Date(activity.timestamp).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">Monitor your platform's performance and activity</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-900/40 px-4 py-3">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {lastSyncedAt ? `Last synced at ${lastSyncedAt.toLocaleTimeString()}` : 'Syncing dashboard data...'}
          </p>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Auto-refresh every 60 seconds</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={dashboardData?.totalUsers || overview.totalUsers || 0}
            icon={<FaUsers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            color="bg-emerald-100 dark:bg-emerald-900/40"
            subtitle="All time"
          />
          <StatCard
            title="Total Cards"
            value={dashboardData?.totalCards || overview.totalCards || 0}
            icon={<FaCreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />}
            color="bg-green-100 dark:bg-green-900/40"
            subtitle="All time"
          />
          <StatCard
            title="Total Views"
            value={analyticsData?.overview?.totalViews || 0}
            icon={<FaEye className="w-6 h-6 text-green-600 dark:text-green-400" />}
            color="bg-green-100 dark:bg-green-900/40"
            subtitle="Card views"
          />
          <StatCard
            title="Total Engagement"
            value={totalEngagement}
            icon={<FaHeart className="w-6 h-6 text-red-600 dark:text-red-400" />}
            color="bg-red-100 dark:bg-red-900/40"
            subtitle={`Engagement rate ${engagementRate}%`}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">User Growth</h3>
              <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <LineChartComponent
              data={analyticsData?.userGrowth || []}
              title="User Growth"
              color="#10B981"
            />
          </motion.div>

          {/* Card Creation Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Card Creation</h3>
              <FiCreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <BarChartComponent
              data={analyticsData?.cardGrowth || []}
              title="Card Creation"
              color="#10B981"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Device Distribution</h3>
            {deviceTotalPct === 0 ? (
              <div className="text-center py-12">
                <FiActivity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-400" />
                <p className="text-gray-500 dark:text-slate-400 text-sm">No device data available yet</p>
              </div>
            ) : (
              <PieChartComponent
                data={analyticsData?.deviceAnalytics || { desktop: 0, mobile: 0, tablet: 0 }}
                title="Traffic by Device"
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Global Reach</h3>
            {geoCount === 0 ? (
              <div className="text-center py-12">
                <FiActivity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-400" />
                <p className="text-gray-500 dark:text-slate-400 text-sm">No geographic data available yet</p>
              </div>
            ) : (
              <PieChartComponent
                data={analyticsData?.geographicAnalytics || {}}
                title="Visits by Region"
              />
            )}
          </motion.div>
        </div>

        {/* Top Performing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Top Performing Cards</h3>
            <FaCrown className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {analyticsData?.topCards?.slice(0, 5).map((card, index) => (
              <TopCardItem key={card._id} card={card} rank={index + 1} />
            ))}
            {(!analyticsData?.topCards || analyticsData.topCards.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                <FiCreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-400" />
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
            className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Recent Activity</h3>
              <FiActivity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              {analyticsData?.recentActivity?.slice(0, 8).map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
              {(!analyticsData?.recentActivity || analyticsData.recentActivity.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <FiActivity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-400" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaEye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Today's Views</span>
                </div>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {realtimeData?.todayViews || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaCreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">New Cards</span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {realtimeData?.todayCards || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaUsers className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Active Users</span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {realtimeData?.activeUsers || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FiUser className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">New Users</span>
                </div>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {realtimeData?.todayUsers || 0}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Platform Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">System Status</span>
                <span className={`text-sm font-semibold ${platformHealth.status === 'Healthy' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {platformHealth.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Uptime</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{platformHealth.uptimeLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Avg API Latency</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{platformHealth.apiLatency}ms</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Admin Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { to: '/admin/users', label: 'Manage Users' },
                { to: '/admin/cards', label: 'Review Cards' },
                { to: '/admin/templates', label: 'Templates' },
                { to: '/admin/access-requests', label: 'Access Requests' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 p-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/40 hover:text-emerald-700 dark:text-emerald-300 transition-colors"
                >
                  <span>{item.label}</span>
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 