import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  FiBarChart2, FiUsers, FiCreditCard, FiEye, FiHeart, FiShare2, FiDownload,
  FiCalendar, FiRefreshCw, FiPlay, FiPause, FiActivity
} from 'react-icons/fi';
import { FaUsers, FaCreditCard, FaDesktop, FaMobile, FaTablet } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import { LineChartComponent, BarChartComponent, PieChartComponent, ProgressBar } from '../../components/Admin/ChartComponent';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../services/apiService';

const PERIOD_DAYS = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
const DAY_MS = 24 * 60 * 60 * 1000;

// Real percentage change; null when there is no previous data to compare against.
const pctChange = (cur, prev) => {
  if (prev > 0) {
    return Math.round(((cur - prev) / prev) * 1000) / 10;
  }
  return cur > 0 ? null : undefined;
};

const sumCounts = (series) => (series || []).reduce((sum, d) => sum + (d.count || 0), 0);

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      totalCards: 0,
      totalViews: 0,
      totalLoves: 0,
      totalShares: 0,
      totalDownloads: 0
    },
    userGrowth: [],
    cardGrowth: [],
    deviceAnalytics: { desktop: 0, mobile: 0, tablet: 0 },
    geographicAnalytics: {},
    engagementMetrics: { views: 0, loves: 0, shares: 0, downloads: 0, avgSessionTime: 0, bounceRate: 0 },
    topCards: [],
    recentActivity: []
  });
  const [deltas, setDeltas] = useState({});
  const [rangeLabel, setRangeLabel] = useState('Last 7 Days');

  const useCustomRange = fromDate && toDate;

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      // Build the current window and the immediately-previous window of the same width,
      // so deltas are computed from real data instead of hardcoded numbers.
      let currentParams = `period=${period}`;
      let previousParams = '';
      let label = `Last ${PERIOD_DAYS[period] || 7} Days`;

      if (useCustomRange) {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        const widthMs = Math.max(1, end.getTime() - start.getTime());
        currentParams = `from=${start.toISOString()}&to=${end.toISOString()}`;
        previousParams = `from=${new Date(start.getTime() - widthMs).toISOString()}&to=${new Date(start.getTime() - 1).toISOString()}`;
        label = `${fromDate} to ${toDate}`;
      } else {
        const days = PERIOD_DAYS[period] || 7;
        const now = Date.now();
        previousParams = `from=${new Date(now - 2 * days * DAY_MS).toISOString()}&to=${new Date(now - days * DAY_MS - 1).toISOString()}`;
      }
      setRangeLabel(label);

      const headers = { 'Authorization': `Bearer ${token}` };
      const url = `${API_BASE_URL}/admin/analytics`;

      const [currentRes, previousRes] = await Promise.all([
        fetch(`${url}?${currentParams}`, { headers }),
        previousParams ? fetch(`${url}?${previousParams}`, { headers }) : Promise.resolve(null)
      ]);

      if (!currentRes.ok) throw new Error(`Analytics request failed (${currentRes.status})`);

      const data = await currentRes.json();
      let prev = null;
      if (previousRes) {
        if (!previousRes.ok) throw new Error('Analytics comparison request failed');
        prev = await previousRes.json();
      }

      setAnalytics(data);

      if (prev) {
        const currEng = data.engagementMetrics || {};
        const prevEng = prev.engagementMetrics || {};
        setDeltas({
          users: pctChange(sumCounts(data.userGrowth), sumCounts(prev.userGrowth)),
          cards: pctChange(sumCounts(data.cardGrowth), sumCounts(prev.cardGrowth)),
          views: pctChange(currEng.views || 0, prevEng.views || 0),
          loves: pctChange(currEng.loves || 0, prevEng.loves || 0),
          shares: pctChange(currEng.shares || 0, prevEng.shares || 0),
          downloads: pctChange(currEng.downloads || 0, prevEng.downloads || 0)
        });
      } else {
        setDeltas({});
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalytics();
      }, 60000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, fromDate, toDate, autoRefresh]);

  const exportCSV = () => {
    const rows = [];
    rows.push(['Metric', 'Value']);
    rows.push(['Period', rangeLabel]);
    rows.push(['Total Users (all time)', analytics.overview?.totalUsers || 0]);
    rows.push(['Total Cards (all time)', analytics.overview?.totalCards || 0]);
    rows.push(['Views', analytics.engagementMetrics?.views || 0]);
    rows.push(['Loves', analytics.engagementMetrics?.loves || 0]);
    rows.push(['Shares', analytics.engagementMetrics?.shares || 0]);
    rows.push(['Downloads', analytics.engagementMetrics?.downloads || 0]);
    rows.push(['Bounce Rate (%)', analytics.engagementMetrics?.bounceRate || 0]);
    rows.push([]);
    rows.push(['Date', 'Users Registered', 'Cards Created']);
    const byDate = {};
    (analytics.userGrowth || []).forEach(u => {
      byDate[u._id] = [u.count || 0, 0];
    });
    (analytics.cardGrowth || []).forEach(c => {
      byDate[c._id] = byDate[c._id] ? [byDate[c._id][0], c.count || 0] : [0, c.count || 0];
    });
    Object.keys(byDate).sort().forEach(d => rows.push([d, ...byDate[d]]));

    const csv = rows
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardly-analytics-${labelToSlug(rangeLabel)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported');
  };

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle, loading = false }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-slate-400 text-sm font-medium">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-slate-100 mt-1">{value}</p>
          )}
          {subtitle && (
            <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="text-white h-6 w-6" />
        </div>
      </div>
      {change !== undefined && change !== null && (
        <div className="flex items-center mt-4">
          <span className={`text-sm font-medium ${
            change > 0 ? 'text-green-600 dark:text-green-400' : change < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-gray-500 dark:text-slate-400 text-sm ml-2">vs previous period</span>
        </div>
      )}
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
        case 'card_downloaded': return FiDownload;
        default: return FiActivity;
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'card_created': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40';
        case 'card_viewed': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40';
        case 'card_shared': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40';
        case 'user_registered': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40';
        case 'card_loved': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40';
        case 'card_downloaded': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40';
        default: return 'text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700';
      }
    };

    const Icon = getActivityIcon(activity.type);

    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-700 rounded-lg transition-colors">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
            {activity.user} {activity.card && `• ${activity.card}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">{activity.description} · {activity.time}</p>
        </div>
      </div>
    );
  };

  const TopCardItem = ({ card, rank }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-700 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{card.title || card.fullName}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">{card.views} views</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-slate-400">
        <span className="flex items-center">
          <FiHeart className="h-3 w-3 mr-1 text-red-500" />
          {card.loves}
        </span>
        <span className="flex items-center">
          <FiShare2 className="h-3 w-3 mr-1 text-emerald-500" />
          {card.shares}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">Loading analytics data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const deviceTotal = (analytics.deviceAnalytics?.desktop || 0) + (analytics.deviceAnalytics?.mobile || 0) + (analytics.deviceAnalytics?.tablet || 0);
  const totalEvents = (analytics.engagementMetrics?.views || 0) + (analytics.engagementMetrics?.loves || 0) + (analytics.engagementMetrics?.shares || 0) + (analytics.engagementMetrics?.downloads || 0);
  const avgSessionTime = analytics.engagementMetrics?.avgSessionTime || 0;

  return (
    <AdminLayout title="Analytics Dashboard">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-400">
            {rangeLabel} — all numbers computed from real database activity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 xl:mt-0">
          <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg">
            <FiCalendar className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-sm focus:outline-none"
            />
            <span className="text-gray-400">–</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-sm focus:outline-none"
            />
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={useCustomRange}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button
            onClick={async () => {
              setRefreshing(true);
              await fetchAnalytics();
              setRefreshing(false);
              toast.success('Analytics refreshed');
            }}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent inline-block" />
            ) : <FiRefreshCw className="h-5 w-5" />}
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh
                ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 hover:bg-green-200'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {autoRefresh ? <FiPlay className="h-5 w-5" /> : <FiPause className="h-5 w-5" />}
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <FiDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={(analytics.overview?.totalUsers || 0).toLocaleString()}
          change={deltas.users}
          icon={FaUsers}
          color="emerald"
          subtitle="All time"
        />
        <StatCard
          title="New Users in Period"
          value={sumCounts(analytics.userGrowth).toLocaleString()}
          change={deltas.users}
          icon={FiUsers}
          color="green"
          subtitle={rangeLabel}
        />
        <StatCard
          title="Total Cards"
          value={(analytics.overview?.totalCards || 0).toLocaleString()}
          change={deltas.cards}
          icon={FaCreditCard}
          color="green"
          subtitle="All time"
        />
        <StatCard
          title="New Cards in Period"
          value={sumCounts(analytics.cardGrowth).toLocaleString()}
          change={deltas.cards}
          icon={FiCreditCard}
          color="green"
          subtitle={rangeLabel}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <LineChartComponent
          title="User Growth"
          data={analytics.userGrowth}
          color="#10B981"
        />
        <BarChartComponent
          title="Card Creation"
          data={analytics.cardGrowth}
          color="#10B981"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Views"
          value={(analytics.engagementMetrics?.views || 0).toLocaleString()}
          change={deltas.views}
          icon={FiEye}
          color="green"
          subtitle={rangeLabel}
        />
        <StatCard
          title="Total Loves"
          value={(analytics.engagementMetrics?.loves || 0).toLocaleString()}
          change={deltas.loves}
          icon={FiHeart}
          color="green"
          subtitle={rangeLabel}
        />
        <StatCard
          title="Total Shares"
          value={(analytics.engagementMetrics?.shares || 0).toLocaleString()}
          change={deltas.shares}
          icon={FiShare2}
          color="emerald"
          subtitle={rangeLabel}
        />
        <StatCard
          title="Total Downloads"
          value={(analytics.engagementMetrics?.downloads || 0).toLocaleString()}
          change={deltas.downloads}
          icon={FiDownload}
          color="emerald"
          subtitle={rangeLabel}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* Device Analytics */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Device Usage</h3>
          {deviceTotal === 0 ? (
            <div className="text-center py-6">
              <FiBarChart2 className="h-10 w-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">No device data available yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center space-x-2 mb-2">
                <FaDesktop className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Desktop</span>
              </div>
              <ProgressBar label="Desktop" value={analytics.deviceAnalytics?.desktop || 0} color="emerald" />
              <div className="flex items-center space-x-2 mb-2">
                <FaMobile className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Mobile</span>
              </div>
              <ProgressBar label="Mobile" value={analytics.deviceAnalytics?.mobile || 0} color="green" />
              <div className="flex items-center space-x-2 mb-2">
                <FaTablet className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Tablet</span>
              </div>
              <ProgressBar label="Tablet" value={analytics.deviceAnalytics?.tablet || 0} color="green" />
            </div>
          )}
        </div>

        {/* Geographic Analytics */}
        <PieChartComponent
          title="Geographic Distribution"
          data={analytics.geographicAnalytics || {}}
        />

        {/* Session Analytics */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Session Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-slate-300">Bounce Rate</span>
              <span className="text-sm font-semibold">{(analytics.engagementMetrics?.bounceRate || 0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-slate-300">Total Events</span>
              <span className="text-sm font-semibold">{totalEvents.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-slate-300">Avg Session Time</span>
              <span className="text-sm font-semibold">
                {avgSessionTime > 0 ? `${avgSessionTime} min` : '—'}
              </span>
            </div>
            {avgSessionTime === 0 && (
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Session duration is not tracked until per-visit timestamps are recorded.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top Cards and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Top Performing Cards</h3>
          {(analytics.topCards || []).length === 0 ? (
            <div className="text-center py-8">
              <FiBarChart2 className="h-10 w-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">No data available yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {(analytics.topCards || []).map((card, index) => (
                  <TopCardItem key={card._id} card={card} rank={index + 1} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Recent Activity</h3>
          {(analytics.recentActivity || []).length === 0 ? (
            <div className="text-center py-8">
              <FiActivity className="h-10 w-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">No data available yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {(analytics.recentActivity || []).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

function labelToSlug(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default AnalyticsDashboard;