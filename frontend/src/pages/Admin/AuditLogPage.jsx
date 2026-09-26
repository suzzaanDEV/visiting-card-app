import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, fetchAuditStats, fetchAuditActions } from '../../features/admin/adminThunks';
import {
  FiActivity, FiAlertTriangle, FiCheckCircle, FiXCircle, FiRefreshCw,
  FiSearch, FiDownload, FiChevronDown, FiChevronRight, FiFileText, FiClock, FiZap,
} from 'react-icons/fi';
import AdminLayout from '../../components/Admin/AdminLayout';
import EmptyState from '../../components/ui/EmptyState';
import { API_BASE_URL } from '../../services/apiService';

const SEVERITY_ICONS = {
  info: <FiCheckCircle className="w-4 h-4 text-blue-500" />,
  warning: <FiAlertTriangle className="w-4 h-4 text-amber-500" />,
  critical: <FiXCircle className="w-4 h-4 text-red-500" />
};

const SEVERITY_BADGE = {
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  critical: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
};

const ACTION_LABELS = {
  'user.register': 'User Registered', 'user.login': 'User Login', 'user.logout': 'User Logout',
  'user.update': 'User Updated', 'user.delete': 'User Deleted', 'user.ban': 'User Banned', 'user.unban': 'User Unbanned',
  'admin.login': 'Admin Login', 'admin.logout': 'Admin Logout', 'admin.update_settings': 'Settings Updated',
  'admin.backup': 'Admin Backup', 'admin.restore': 'Admin Restore',
  'admin.create_template': 'Template Created', 'admin.update_template': 'Template Updated', 'admin.delete_template': 'Template Deleted',
  'admin.create_category': 'Category Created', 'admin.update_category': 'Category Updated', 'admin.delete_category': 'Category Deleted',
  'admin.feature_card': 'Card Featured', 'admin.unfeature_card': 'Card Unfeatured', 'admin.delete_card': 'Card Deleted',
  'admin.approve_access': 'Access Approved', 'admin.reject_access': 'Access Rejected',
  'card.create': 'Card Created', 'card.update': 'Card Updated', 'card.delete': 'Card Deleted',
  'card.love': 'Card Liked', 'card.share': 'Card Shared', 'card.view': 'Card Viewed',
  'card.archive': 'Card Archived', 'card.restore': 'Card Restored', 'card.privacy_change': 'Privacy Changed',
  'notification.send': 'Notification Sent', 'notification.mark_read': 'Notification Read',
  'policy.create': 'Policy Created', 'policy.update': 'Policy Updated', 'policy.publish': 'Policy Published',
  'auth.password_change': 'Password Changed', 'auth.password_reset': 'Password Reset', 'auth.email_verify': 'Email Verified',
  'auth.two_factor_enable': '2FA Enabled', 'auth.two_factor_disable': '2FA Disabled',
  'auth.two_factor_login': '2FA Login', 'auth.two_factor_login_failed': '2FA Login Failed',
  'system.error': 'System Error', 'system.backup': 'System Backup', 'system.restore': 'System Restore'
};

const ENTITY_TYPES = ['admin', 'user', 'card', 'template', 'category', 'policy', 'notification', 'system'];

const labelFor = (action) => ACTION_LABELS[action] || (action ? action.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unknown');

const fmtDate = (iso) => iso ? new Date(iso).toLocaleString() : '—';

const renderValue = (v) => {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v);
};

export default function AuditLogPage() {
  const dispatch = useDispatch();
  const { auditStats = null, auditLogs = [], auditPagination = null, auditActions = [] } = useSelector(s => s.admin);
  const [filters, setFilters] = useState({ severity: '', action: '', entityType: '', success: '', limit: 50 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dispatch(fetchAuditStats());
    dispatch(fetchAuditActions());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: filters.limit, ...filters };
    if (search) params.search = search;
    if (startDate) params.startDate = new Date(startDate).toISOString();
    if (endDate) params.endDate = new Date(new Date(endDate).getTime() + 86400000).toISOString();
    dispatch(fetchAuditLogs(params)).finally(() => setLoading(false));
  }, [dispatch, page, filters, search, startDate, endDate]);

  const applySearch = () => { setPage(1); setSearch(searchInput.trim()); };
  const handleFilter = (key, value) => { setPage(1); setFilters(f => ({ ...f, [key]: value })); };

  const usedActions = useMemo(() => {
    const counts = new Map((auditStats?.actionBreakdown || []).map(a => [a._id, a.count]));
    return auditActions.length
      ? auditActions
      : Array.from(counts.keys()).map(action => ({ action, count: counts.get(action) }));
  }, [auditActions, auditStats]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ format: 'csv', limit: filters.limit || 100, ...filters });
      if (search) params.set('search', search);
      const res = await fetch(`${API_BASE_URL}/admin/audit/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallthrough — keep button state sane
    }
    setExporting(false);
  };

  const totalPages = auditPagination?.totalPages || 1;
  const logs = Array.isArray(auditLogs) ? auditLogs : [];

  return (
    <AdminLayout title="Audit Log">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Every system, user and admin activity with full request context</p>
          </div>
          <button onClick={() => { setLoading(true); dispatch(fetchAuditLogs({ page, limit: filters.limit, ...filters })).finally(() => setLoading(false)); }}
            disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {auditStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Events</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{auditStats.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Today</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{auditStats.todayCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Critical</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{auditStats.criticalCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Failures (24h)</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{auditStats.recentFailures}</p>
            </div>
          </div>
        )}

        {auditStats?.actionBreakdown && auditStats.actionBreakdown.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Top Actions</h2>
            <div className="flex flex-wrap gap-2">
              {auditStats.actionBreakdown.slice(0, 15).map(a => (
                <span key={a._id} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                  {labelFor(a._id)} ({a.count})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') applySearch(); }}
                placeholder="Search action, actor, IP, request id…"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <select value={filters.severity} onChange={e => handleFilter('severity', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
              <option value="">All Severity</option>
              <option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option>
            </select>
            <select value={filters.success} onChange={e => handleFilter('success', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
              <option value="">Success + Failed</option>
              <option value="true">Succeeded</option>
              <option value="false">Failed</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={filters.action} onChange={e => handleFilter('action', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm min-w-[180px]">
              <option value="">All Actions</option>
              {usedActions.map(a => (
                <option key={a.action} value={a.action}>{labelFor(a.action)}{a.count ? ` (${a.count})` : ''}</option>
              ))}
            </select>
            <select value={filters.entityType} onChange={e => handleFilter('entityType', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
              <option value="">All Entities</option>
              {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm" />
            <span className="self-center text-xs text-slate-400">to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm" />
            <select value={filters.limit} onChange={e => handleFilter('limit', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
              <option value="20">20 rows</option><option value="50">50 rows</option><option value="100">100 rows</option>
            </select>
            <button onClick={exportCsv} disabled={exporting || logs.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <FiDownload className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<FiActivity className="w-8 h-8" />}
            title="No audit logs found"
            description="Try clearing filters or changing the date range."
          />
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {logs.map(log => (
                <div key={log._id}>
                  <button
                    onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                    className={`w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition ${log.success === false ? 'bg-red-50/40 dark:bg-red-900/10' : ''}`}
                  >
                    <span className="mt-0.5">{SEVERITY_ICONS[log.severity] || SEVERITY_ICONS.info}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-sm text-slate-900 dark:text-white">{labelFor(log.action)}</span>
                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded-full font-semibold ${SEVERITY_BADGE[log.severity] || SEVERITY_BADGE.info}`}>{log.severity}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{log.entityType || 'system'}</span>
                        {log.success === false && <span className="text-xs font-medium text-red-600 dark:text-red-400">failed</span>}
                        {log.actorEmail && <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">{log.actorEmail}</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1"><FiClock className="w-3 h-3" />{fmtDate(log.createdAt)}</span>
                        {log.method && <span className="font-mono">{log.method} {log.path}</span>}
                        {log.statusCode && <span className="font-mono">→ {log.statusCode}</span>}
                        {log.elapsedMs !== undefined && <span className="font-mono">{log.elapsedMs}ms</span>}
                      </p>
                    </div>
                    {expanded === log._id ? <FiChevronDown className="w-4 h-4 text-slate-400 mt-1" /> : <FiChevronRight className="w-4 h-4 text-slate-400 mt-1" />}
                  </button>

                  {expanded === log._id && (
                    <div className="px-4 pb-4 ml-8 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                        <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Request ID</p><p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{log.requestId || '—'}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Correlation ID</p><p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{log.correlationId || '—'}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Actor</p><p className="text-xs text-slate-700 dark:text-slate-300">{log.actorName || log.actorEmail || 'anonymous'}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-slate-400">IP Address</p><p className="text-xs font-mono text-slate-700 dark:text-slate-300">{log.ipAddress || '—'}</p></div>
                        {log.correlationId === undefined && <div><p className="text-[10px] uppercase tracking-wider text-slate-400">User Agent</p><p className="text-xs text-slate-700 dark:text-slate-300 break-all">{log.userAgent || '—'}</p></div>}
                      </div>

                      {log.before && log.after && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1"><span className="text-red-500">Before</span></p>
                            <pre className="text-xs text-slate-600 dark:text-slate-300 bg-red-50/50 dark:bg-red-900/10 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(log.before, null, 2)}</pre>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1"><span className="text-emerald-600 dark:text-emerald-400">After</span></p>
                            <pre className="text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(log.after, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Metadata</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(log.metadata).map(([k, v]) => (
                              <span key={k} className="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                                {k}: {renderValue(v)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {log.errorMessage && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          <FiXCircle className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{log.errorMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <FiZap className="inline w-3 h-3 text-emerald-500 mr-1 -mt-0.5" />Page {auditPagination?.page || page} of {totalPages} · {auditPagination?.total ?? logs.length} events
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}