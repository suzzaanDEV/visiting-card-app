import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend, FiPlus, FiTrash2, FiClock, FiCheckCircle, FiXCircle,
  FiEye, FiBarChart2, FiChevronLeft, FiChevronRight, FiCalendar,
  FiMail, FiSmartphone, FiMonitor, FiUsers, FiX, FiEdit2,
  FiAlertCircle, FiLoader, FiFilter,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import {
  fetchBroadcasts, createBroadcast, updateBroadcast, deleteBroadcast,
  sendBroadcast, scheduleBroadcast, cancelBroadcast, fetchBroadcastStats,
} from '../../features/admin/adminThunks';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  sending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  sent: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const CHANNEL_ICONS = { inApp: FiMonitor, push: FiSmartphone, email: FiMail };

const emptyForm = {
  title: '', message: '', richContent: '', imageUrl: '',
  ctaText: '', ctaUrl: '', priority: 'normal',
  audience: { type: 'all', filters: {} },
  channels: { inApp: true, push: false, email: false },
  emailSubject: '', emailHtmlBody: '',
  pushTitle: '', pushBody: '',
  scheduleType: 'now', scheduledAt: '',
};

const BroadcastManagement = () => {
  const dispatch = useDispatch();
  const { data: broadcasts, loading } = useSelector((s) => s.admin.broadcasts);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBroadcasts({ page, limit: 10, status: statusFilter }));
  }, [dispatch, page, statusFilter]);

  const totalBroadcasts = broadcasts.length;
  const sentCount = broadcasts.filter((b) => b.status === 'sent').length;
  const deliveredCount = broadcasts.reduce((sum, b) => sum + (b.deliveryStats?.delivered || 0), 0);
  const failedCount = broadcasts.reduce((sum, b) => sum + (b.deliveryStats?.failed || 0), 0);
  const openRate = deliveredCount > 0
    ? ((broadcasts.reduce((sum, b) => sum + (b.deliveryStats?.opened || 0), 0) / deliveredCount) * 100).toFixed(1)
    : 0;

  const openForm = (broadcast = null) => {
    if (broadcast) {
      setEditingId(broadcast._id);
      setForm({
        title: broadcast.title || '',
        message: broadcast.message || '',
        richContent: broadcast.richContent || '',
        imageUrl: broadcast.imageUrl || '',
        ctaText: broadcast.ctaText || '',
        ctaUrl: broadcast.ctaUrl || '',
        priority: broadcast.priority || 'normal',
        audience: broadcast.audience || { type: 'all' },
        channels: broadcast.channels || { inApp: true },
        emailSubject: broadcast.emailSubject || '',
        emailHtmlBody: broadcast.emailHtmlBody || '',
        pushTitle: broadcast.pushTitle || '',
        pushBody: broadcast.pushBody || '',
        scheduleType: broadcast.scheduledAt ? 'later' : 'now',
        scheduledAt: broadcast.scheduledAt ? new Date(broadcast.scheduledAt).toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setFormStep(1);
    setShowForm(true);
  };

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }));
  const updateAudience = (patch) => setForm((f) => ({ ...f, audience: { ...f.audience, ...patch } }));
  const updateChannels = (patch) => setForm((f) => ({ ...f, channels: { ...f.channels, ...patch } }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title: form.title, message: form.message, richContent: form.richContent,
        imageUrl: form.imageUrl, ctaText: form.ctaText, ctaUrl: form.ctaUrl,
        priority: form.priority, audience: form.audience, channels: form.channels,
        emailSubject: form.emailSubject, emailHtmlBody: form.emailHtmlBody,
        pushTitle: form.pushTitle, pushBody: form.pushBody,
      };
      if (editingId) {
        await dispatch(updateBroadcast({ id: editingId, ...payload })).unwrap();
        toast.success('Broadcast updated');
      } else {
        await dispatch(createBroadcast(payload)).unwrap();
        toast.success('Broadcast created');
      }
      if (form.scheduleType === 'later' && form.scheduledAt) {
        if (editingId) await dispatch(scheduleBroadcast({ id: editingId, scheduledAt: form.scheduledAt })).unwrap();
      }
      setShowForm(false);
      dispatch(fetchBroadcasts({ page, limit: 10, status: statusFilter }));
    } catch (e) {
      toast.error(e || 'Failed to save broadcast');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSend = async (id) => {
    setActionLoading(id);
    try {
      await dispatch(sendBroadcast(id)).unwrap();
      toast.success('Broadcast sent');
      dispatch(fetchBroadcasts({ page, limit: 10, status: statusFilter }));
    } catch (e) { toast.error(e || 'Failed to send'); }
    setActionLoading(null);
  };

  const handleCancel = async (id) => {
    setActionLoading(id);
    try {
      await dispatch(cancelBroadcast(id)).unwrap();
      toast.success('Broadcast cancelled');
      dispatch(fetchBroadcasts({ page, limit: 10, status: statusFilter }));
    } catch (e) { toast.error(e || 'Failed to cancel'); }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this broadcast?')) return;
    setActionLoading(`delete:${id}`);
    try {
      await dispatch(deleteBroadcast(id)).unwrap();
      toast.success('Broadcast deleted');
    } catch (e) { toast.error(e || 'Failed to delete'); }
    setActionLoading(null);
  };

  const handleShowDetails = async (id) => {
    setShowDetails(id);
    setDetailsLoading(true);
    try {
      const result = await dispatch(fetchBroadcastStats(id)).unwrap();
      setDetailsData(result);
    } catch { setDetailsData(null); }
    setDetailsLoading(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  const statCards = [
    { label: 'Total', value: totalBroadcasts, icon: FiSend, color: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Sent', value: sentCount, icon: FiCheckCircle, color: 'bg-green-100 dark:bg-green-900/40', iconColor: 'text-green-600 dark:text-green-400' },
    { label: 'Delivered', value: deliveredCount, icon: FiEye, color: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Failed', value: failedCount, icon: FiXCircle, color: 'bg-red-100 dark:bg-red-900/40', iconColor: 'text-red-600 dark:text-red-400' },
    { label: 'Open Rate', value: `${openRate}%`, icon: FiBarChart2, color: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <AdminLayout title="Broadcast Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Broadcasts</h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">Create and manage notification broadcasts</p>
          </div>
          <button onClick={() => openForm()} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
            <FiPlus className="w-4 h-4" />
            <span>New Broadcast</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
              <div className="flex items-center space-x-3">
                <div className={`${s.color} p-2 rounded-lg`}><s.icon className={`w-5 h-5 ${s.iconColor}`} /></div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{s.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <FiFilter className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          {['', 'draft', 'scheduled', 'sent', 'cancelled'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={5} cols={7} /></div>
          ) : broadcasts.length === 0 ? (
            <EmptyState
              icon={<FiSend className="w-12 h-12" />}
              title="No broadcasts found"
              description="Create your first broadcast to send notifications to users."
              action={
                <button onClick={() => openForm()} className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Create Broadcast
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Channels</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Audience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Delivery</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {broadcasts.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {b.priority === 'high' && <FiAlertCircle className="w-4 h-4 text-red-500" />}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{b.title}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[200px]">{b.message}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || STATUS_COLORS.draft}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          {b.channels?.inApp && <FiMonitor className="w-4 h-4 text-emerald-500" />}
                          {b.channels?.push && <FiSmartphone className="w-4 h-4 text-blue-500" />}
                          {b.channels?.email && <FiMail className="w-4 h-4 text-orange-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400 capitalize">{b.audience?.type || 'all'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{formatDate(b.sentAt || b.createdAt)}</td>
                      <td className="px-6 py-4">
                        {b.deliveryStats ? (
                          <div className="text-xs text-gray-600 dark:text-slate-400">
                            <span className="text-green-600">{b.deliveryStats.delivered || 0}</span> / <span>{b.deliveryStats.total || 0}</span>
                          </div>
                        ) : <span className="text-xs text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => handleShowDetails(b._id)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded" title="Delivery details">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openForm(b)} className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded" title="Edit">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          {b.status === 'draft' && (
                            <button onClick={() => handleSend(b._id)} disabled={actionLoading === b._id} className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded disabled:opacity-50" title="Send now">
                              {actionLoading === b._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
                            </button>
                          )}
                          {b.status === 'scheduled' && (
                            <button onClick={() => handleCancel(b._id)} disabled={actionLoading === b._id} className="p-1.5 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded disabled:opacity-50" title="Cancel">
                              {actionLoading === b._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiClock className="w-4 h-4" />}
                            </button>
                          )}
                          {['draft', 'cancelled', 'failed'].includes(b.status) && (
                            <button onClick={() => handleDelete(b._id)} disabled={actionLoading === `delete:${b._id}`} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded disabled:opacity-50" title="Delete">
                              {actionLoading === `delete:${b._id}` ? <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" /> : <FiTrash2 className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-slate-400">Page {page}</p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700"><FiChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage((p) => p + 1)} disabled={broadcasts.length < 10} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700"><FiChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* ─── Create/Edit Modal ─── */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl rounded-none sm:m-0 m-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{editingId ? 'Edit Broadcast' : 'New Broadcast'}</h3>
                   <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><FiX className="w-5 h-5" /></button>
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center space-x-2 py-4 px-6">
                  {['Info', 'Audience', 'Channels', 'Schedule', 'Preview'].map((label, i) => (
                    <div key={label} className="flex items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${formStep === i + 1 ? 'bg-emerald-600 text-white' : formStep > i + 1 ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>{i + 1}</div>
                      <span className={`ml-1 text-xs hidden sm:inline ${formStep === i + 1 ? 'text-emerald-600 font-medium' : 'text-gray-400 dark:text-slate-500'}`}>{label}</span>
                      {i < 4 && <div className="w-6 h-px bg-gray-300 dark:bg-slate-600 mx-1" />}
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4">
                  {/* Step 1: Basic Info */}
                  {formStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title *</label>
                        <input type="text" value={form.title} onChange={(e) => updateForm({ title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Broadcast title" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message *</label>
                        <textarea value={form.message} onChange={(e) => updateForm({ message: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Notification message content" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rich Content (HTML)</label>
                        <textarea value={form.richContent} onChange={(e) => updateForm({ richContent: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm" placeholder="<p>HTML content</p>" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Image URL</label>
                          <input type="url" value={form.imageUrl} onChange={(e) => updateForm({ imageUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Priority</label>
                          <select value={form.priority} onChange={(e) => updateForm({ priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none">
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">CTA Text</label>
                          <input type="text" value={form.ctaText} onChange={(e) => updateForm({ ctaText: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="View Details" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">CTA URL</label>
                          <input type="url" value={form.ctaUrl} onChange={(e) => updateForm({ ctaUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://..." />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Audience */}
                  {formStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-slate-400">Select who will receive this broadcast:</p>
                      {[
                        { value: 'all', label: 'All Users', desc: 'Every registered user' },
                        { value: 'active', label: 'Active Users', desc: 'Users active in the last 30 days' },
                        { value: 'inactive', label: 'Inactive Users', desc: 'No activity in 30+ days' },
                        { value: 'new', label: 'New Users', desc: 'Joined in the last 7 days' },
                        { value: 'verified', label: 'Verified Users', desc: 'Email-verified accounts' },
                        { value: 'segment', label: 'Segment', desc: 'Custom segment filters' },
                        { value: 'specific', label: 'Specific Users', desc: 'Select individual users' },
                      ].map((opt) => (
                        <label key={opt.value} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${form.audience.type === opt.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'}`}>
                          <input type="radio" name="audience" value={opt.value} checked={form.audience.type === opt.value} onChange={() => updateAudience({ type: opt.value })} className="mt-1 text-emerald-600 focus:ring-emerald-500" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{opt.label}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Step 3: Channels */}
                  {formStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Delivery Channels</p>
                        <div className="space-y-3">
                          {[
                            { key: 'inApp', label: 'In-App', icon: FiMonitor, desc: 'Show in notification center' },
                            { key: 'push', label: 'Push Notification', icon: FiSmartphone, desc: 'Browser push notification' },
                            { key: 'email', label: 'Email', icon: FiMail, desc: 'Send email to users' },
                          ].map((ch) => (
                            <label key={ch.key} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${form.channels[ch.key] ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700'}`}>
                              <input type="checkbox" checked={form.channels[ch.key]} onChange={(e) => updateChannels({ [ch.key]: e.target.checked })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                              <ch.icon className="w-5 h-5 ml-3 text-gray-600 dark:text-slate-400" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{ch.label}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{ch.desc}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      {form.channels.email && (
                        <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email Subject</label>
                            <input type="text" value={form.emailSubject} onChange={(e) => updateForm({ emailSubject: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Email subject line" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email Body (HTML)</label>
                            <textarea value={form.emailHtmlBody} onChange={(e) => updateForm({ emailHtmlBody: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm" placeholder="<h1>Hello!</h1>" />
                          </div>
                        </div>
                      )}
                      {form.channels.push && (
                        <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Push Title</label>
                            <input type="text" value={form.pushTitle} onChange={(e) => updateForm({ pushTitle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Push notification title" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Push Body</label>
                            <textarea value={form.pushBody} onChange={(e) => updateForm({ pushBody: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Push body text" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Schedule */}
                  {formStep === 4 && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${form.scheduleType === 'now' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700'}`}>
                          <input type="radio" name="schedule" checked={form.scheduleType === 'now'} onChange={() => updateForm({ scheduleType: 'now' })} className="text-emerald-600 focus:ring-emerald-500" />
                          <FiSend className="w-5 h-5 ml-3 text-emerald-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Send Immediately</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Broadcast will be sent right away</p>
                          </div>
                        </label>
                        <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${form.scheduleType === 'later' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700'}`}>
                          <input type="radio" name="schedule" checked={form.scheduleType === 'later'} onChange={() => updateForm({ scheduleType: 'later' })} className="text-emerald-600 focus:ring-emerald-500" />
                          <FiCalendar className="w-5 h-5 ml-3 text-blue-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Schedule for Later</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Pick a date and time</p>
                          </div>
                        </label>
                      </div>
                      {form.scheduleType === 'later' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Scheduled Date & Time</label>
                          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => updateForm({ scheduledAt: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Preview */}
                  {formStep === 5 && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-slate-100">{form.title || 'Untitled Broadcast'}</h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{form.message}</p>
                        {form.imageUrl && <img src={form.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg" />}
                        {form.ctaText && (
                          <div className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">{form.ctaText}</div>
                        )}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                          <span className="text-xs text-gray-500 dark:text-slate-400">Channels:</span>
                          {form.channels.inApp && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">In-App</span>}
                          {form.channels.push && <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Push</span>}
                          {form.channels.email && <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">Email</span>}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-200 dark:border-slate-700">
                          <p>Audience: <span className="capitalize">{form.audience.type}</span></p>
                          <p>Priority: <span className="capitalize">{form.priority}</span></p>
                          <p>Schedule: {form.scheduleType === 'now' ? 'Send immediately' : form.scheduledAt || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                  <button onClick={() => setFormStep((s) => Math.max(1, s - 1))} disabled={formStep === 1} className="flex items-center space-x-1 text-sm text-gray-600 dark:text-slate-400 disabled:opacity-40 hover:text-gray-900 dark:hover:text-slate-100">
                    <FiChevronLeft className="w-4 h-4" /><span>Back</span>
                  </button>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100">Cancel</button>
                    {formStep < 5 ? (
                      <button onClick={() => setFormStep((s) => Math.min(5, s + 1))} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Next</button>
                    ) : (
                      <button onClick={handleSubmit} disabled={!form.title || !form.message || submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2">
                        {submitting && (
                          <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                        )}
                        <span>{editingId ? 'Update' : 'Create'} Broadcast</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Delivery Details Modal ─── */}
        <AnimatePresence>
          {showDetails && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowDetails(null); setDetailsData(null); }}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Delivery Details</h3>
                   <button onClick={() => { setShowDetails(null); setDetailsData(null); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="px-6 py-4">
                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
                  ) : detailsData ? (
                    <div className="space-y-4">
                      {detailsData.stats && (
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { l: 'Total', v: detailsData.stats.total || 0 },
                            { l: 'Delivered', v: detailsData.stats.delivered || 0 },
                            { l: 'Opened', v: detailsData.stats.opened || 0 },
                            { l: 'Failed', v: detailsData.stats.failed || 0 },
                          ].map((s) => (
                            <div key={s.l} className="text-center p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{s.v}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">{s.l}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {detailsData.deliveries && detailsData.deliveries.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Per-Recipient Status</p>
                          {detailsData.deliveries.map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{d.email || d.userId || 'Unknown'}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{d.channel}</p>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : d.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : d.status === 'opened' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                {d.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {(!detailsData.deliveries || detailsData.deliveries.length === 0) && !detailsData.stats && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No delivery data available yet</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No delivery data available</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default BroadcastManagement;
