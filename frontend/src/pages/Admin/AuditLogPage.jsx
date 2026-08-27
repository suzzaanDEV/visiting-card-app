import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, fetchAuditStats } from '../../features/admin/adminThunks';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiXCircle, FiFilter, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from '../../components/Admin/AdminLayout';
import EmptyState from '../../components/UI/EmptyState';

const SEVERITY_ICONS = {
  info: <FiCheckCircle className="w-4 h-4 text-blue-500" />,
  warning: <FiAlertTriangle className="w-4 h-4 text-amber-500" />,
  critical: <FiXCircle className="w-4 h-4 text-red-500" />
};

const SEVERITY_COLORS = {
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
};

export default function AuditLogPage() {
  const dispatch = useDispatch();
  const { auditLogs = [], auditStats = null } = useSelector(s => s.admin);
  const [filters, setFilters] = useState({ action: '', severity: '', limit: 50 });
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      dispatch(fetchAuditLogs(filters)),
      dispatch(fetchAuditStats())
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [dispatch, filters]);

  const handleFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  return (
    <AdminLayout title="Audit Log">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">System activity and security events</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm">
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
                {a._id} ({a.count})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <select value={filters.severity} onChange={e => handleFilter('severity', e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
          <option value="">All Severity</option>
          <option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option>
        </select>
        <select value={filters.action} onChange={e => handleFilter('action', e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
          <option value="">All Actions</option>
          <option value="user.login">User Login</option><option value="user.register">User Register</option>
          <option value="card.create">Card Create</option><option value="card.delete">Card Delete</option>
          <option value="admin.login">Admin Login</option><option value="admin.update_settings">Settings Update</option>
          <option value="auth.password_change">Password Change</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
          {(Array.isArray(auditLogs) ? auditLogs : []).map(log => (
            <div key={log._id} className={`p-4 border-l-4 ${SEVERITY_COLORS[log.severity] || 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {SEVERITY_ICONS[log.severity]}
                  <span className="font-medium text-sm text-slate-900 dark:text-white">{log.action}</span>
                  {log.entityType && <span className="text-xs text-slate-500 dark:text-slate-400">({log.entityType})</span>}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(log.metadata).slice(0, 5).map(([k, v]) => (
                    <span key={k} className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded">
                      {k}: {typeof v === 'string' ? v.substring(0, 50) : JSON.stringify(v).substring(0, 50)}
                    </span>
                  ))}
                </div>
              )}
              {!log.success && log.errorMessage && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{log.errorMessage}</p>
              )}
            </div>
          ))}
          {(!auditLogs || auditLogs.length === 0) && (
            <EmptyState
              icon={<FiActivity className="w-8 h-8" />}
              title="No audit logs found"
              description="System activity and security events will appear here."
            />
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
