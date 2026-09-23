import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend, FiPlus, FiTrash2, FiClock, FiCheckCircle, FiXCircle,
  FiEye, FiChevronLeft, FiChevronRight, FiCalendar,
  FiMail, FiSmartphone, FiMonitor, FiX, FiEdit2,
  FiAlertCircle, FiLoader, FiSearch, FiInbox, FiMousePointer,
  FiUserCheck, FiTrendingUp, FiRefreshCw,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import {
  fetchBroadcasts, fetchBroadcastOverview, createBroadcast, updateBroadcast,
  deleteBroadcast, sendBroadcast, scheduleBroadcast, cancelBroadcast,
  fetchBroadcastStats, previewBroadcast,
} from '../../features/admin/adminThunks';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  sending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  sent: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  partially_sent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const CHANNEL_ICONS = { inApp: FiMonitor, push: FiSmartphone, email: FiMail };
const FILTER_STATUSES = ['', 'draft', 'scheduled', 'sending', 'partially_sent', 'sent', 'failed', 'cancelled'];
const PRIORITY_COLORS = {
  low: 'text-gray-500 dark:text-slate-400',
  normal: 'text-blue-600 dark:text-blue-400',
  high: 'text-amber-600 dark:text-amber-400',
  urgent: 'text-red-600 dark:text-red-400',
};

const emptyForm = {
  title: '', message: '', richContent: '', imageUrl: '',
  ctaText: '', ctaUrl: '', priority: 'normal', notificationType: 'announcement',
  audience: { type: 'all', filters: {} }, audienceFiltersList: [],
  channels: { inApp: true, push: false, email: false },
  emailSubject: '', emailHtml: '',
  pushTitle: '', pushBody: '',
  scheduleType: 'now', scheduledAt: '',
};

const BroadcastManagement = () => {
  const dispatch = useDispatch();
  const { data: broadcasts, total, loading } = useSelector((s) => s.admin.broadcasts);
  const overview = useSelector((s) => s.admin.broadcastOverview);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsStatus, setDetailsStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const PAGE_SIZE = 10;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    dispatch(fetchBroadcasts({ page, limit: PAGE_SIZE, status: statusFilter, q: debouncedSearch, sort }));
    dispatch(fetchBroadcastOverview());
  }, [dispatch, page, statusFilter, debouncedSearch, sort]);

  // Live-refresh while any broadcast is sending.
  const anySending = useMemo(() => broadcasts.some((b) => b.status === 'sending'), [broadcasts]);
  useEffect(() => {
    if (!anySending) return undefined;
    const t = setInterval(() => {
      dispatch(fetchBroadcasts({ page, limit: PAGE_SIZE, status: statusFilter, q: debouncedSearch, sort }));
      dispatch(fetchBroadcastOverview());
    }, 5000);
    return () => clearInterval(t);
  }, [anySending, dispatch, page, statusFilter, debouncedSearch, sort]);

  // ─── Derived overview stats (global, not page-local) ────────────────────
  const totals = overview?.totals || {};
  const statusCounts = overview?.statusCounts || {};
  const totalBroadcasts = totals.broadcasts || 0;
  const deliveredCount = totals.delivered || 0;
  const failedCount = totals.failed || 0;
  const openedCount = totals.opened || 0;
  const clickedCount = totals.clicked || 0;
  const unsubscribes = totals.unsubscribes || 0;
  const openRate = deliveredCount > 0 ? ((openedCount / deliveredCount) * 100).toFixed(1) : '0.0';
  const clickRate = deliveredCount > 0 ? ((clickedCount / deliveredCount) * 100).toFixed(1) : '0.0';

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
        notificationType: broadcast.notificationType || 'announcement',
        audience: typeof broadcast.audience === 'object' ? broadcast.audience : { type: broadcast.audience || 'all', filters: {} },
        audienceFiltersList: (broadcast.specificUserIds || []).map(String),
        channels: broadcast.channels || { inApp: true, push: false, email: false },
        emailSubject: broadcast.emailSubject || '',
        emailHtml: broadcast.emailHtml || '',
        pushTitle: broadcast.pushTitle || '',
        pushBody: broadcast.pushBody || '',
        scheduleType: broadcast.scheduledAt ? 'later' : 'now',
        scheduledAt: broadcast.scheduledAt ? new Date(broadcast.scheduledAt).toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setPreviewHtml(null);
    setFormStep(1);
    setShowForm(true);
  };

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }));
  const updateAudience = (patch) => setForm((f) => ({ ...f, audience: { ...f.audience, ...patch } }));
  const updateChannels = (patch) => setForm((f) => ({ ...f, channels: { ...f.channels, ...patch } }));

  const validateStep = () => {
    if (formStep === 1 && !form.title.trim()) { toast.error('Title is required'); return false; }
    if (formStep === 1 && !form.message.trim()) { toast.error('Message is required'); return false; }
    if (formStep === 1) {
      if (form.ctaUrl && !/^https?:\/\//i.test(form.ctaUrl)) { toast.error('CTA URL must be a valid http(s) URL'); return false; }
      if (form.imageUrl && !/^https?:\/\//i.test(form.imageUrl)) { toast.error('Image URL must be a valid http(s) URL'); return false; }
    }
    if (formStep === 4 && form.scheduleType === 'later' && !form.scheduledAt) { toast.error('Pick a date and time to schedule'); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep()) setFormStep((s) => Math.min(5, s + 1)); };

  const handleSubmit = async () => {
    if (!validateStep() || formStep < 5) return;
    setSubmitting(true);
    try {
      const payload = {
        title: form.title, message: form.message, richContent: form.richContent,
        imageUrl: form.imageUrl || undefined, ctaText: form.ctaText || undefined,
        ctaUrl: form.ctaUrl || undefined, priority: form.priority,
        notificationType: form.notificationType,
        audience: form.audience, channels: form.channels,
        emailSubject: form.emailSubject, emailHtml: form.emailHtml,
        pushTitle: form.pushTitle, pushBody: form.pushBody,
      };
      if (form.audience.type === 'specific') payload.specificUserIds = form.audienceFiltersList;

      let id = editingId;
      if (editingId) {
        await dispatch(updateBroadcast({ id: editingId, ...payload })).unwrap();
        toast.success('Broadcast updated');
      } else {
        const created = await dispatch(createBroadcast(payload)).unwrap();
        id = created.broadcast?._id || created._id;
        toast.success('Broadcast created');
      }

      if (form.scheduleType === 'later' && form.scheduledAt) {
        await dispatch(scheduleBroadcast({ id, scheduledAt: new Date(form.scheduledAt).toISOString() })).unwrap();
        toast.success('Broadcast scheduled');
      } else if (form.scheduleType === 'now' && !editingId) {
        const sent = await dispatch(sendBroadcast(id)).unwrap();
        toast.success(sent.message || `Queued for ${sent.recipients || 0} recipient${sent.recipients === 1 ? '' : 's'}`);
      }

      setShowForm(false);
      dispatch(fetchBroadcasts({ page, limit: PAGE_SIZE, status: statusFilter, q: debouncedSearch, sort }));
      dispatch(fetchBroadcastOverview());
    } catch (e) {
      toast.error(e?.message || e || 'Failed to save broadcast');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSend = async (id) => {
    setActionLoading(id);
    try {
      const result = await dispatch(sendBroadcast(id)).unwrap();
      toast.success(result.message || `Queued for ${result.recipients || 0} recipients`);
      dispatch(fetchBroadcasts({ page, limit: PAGE_SIZE, status: statusFilter, q: debouncedSearch, sort }));
      dispatch(fetchBroadcastOverview());
    } catch (e) { toast.error(e?.message || e || 'Failed to send'); }
    setActionLoading(null);
  };

  const handleCancel = async (id) => {
    setActionLoading(id);
    try {
      await dispatch(cancelBroadcast(id)).unwrap();
      toast.success('Broadcast cancelled');
      dispatch(fetchBroadcasts({ page, limit: PAGE_SIZE, status: statusFilter, q: debouncedSearch, sort }));
      dispatch(fetchBroadcastOverview());
    } catch (e) { toast.error(e?.message || e || 'Failed to cancel'); }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this broadcast?')) return;
    setActionLoading(`delete:${id}`);
    try {
      await dispatch(deleteBroadcast(id)).unwrap();
      toast.success('Broadcast deleted');
      dispatch(fetchBroadcasts({ page, limit: PAGE_SIZE, status: statusFilter, q: debouncedSearch, sort }));
      dispatch(fetchBroadcastOverview());
    } catch (e) { toast.error(e?.message || e || 'Failed to delete'); }
    setActionLoading(null);
  };

  const handleShowDetails = async (id) => {
    setShowDetails(id);
    setDetailsData(null);
    setDetailsLoading(true);
    setDetailsStatus('');
    try {
      const result = await dispatch(fetchBroadcastStats({ id, page: 1, limit: 100 })).unwrap();
      setDetailsData(result);
    } catch { setDetailsData(null); }
    setDetailsLoading(false);
  };

  const handleGeneratePreview = async () => {
    setPreviewLoading(true);
    setPreviewHtml(null);
    try {
      const res = await dispatch(previewBroadcast({
        title: form.title, message: form.message,
        imageUrl: form.imageUrl, ctaText: form.ctaText, ctaUrl: form.ctaUrl,
      })).unwrap();
      setPreviewHtml(res.html);
    } catch (e) { toast.error(e?.message || e || 'Failed to render preview'); }
    setPreviewLoading(false);
  };

  const formatDate = (d, withTime = false) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
    });
  };

  const audienceLabel = (b) => {
    if (b.audience === 'specific') return `${b.specificUserIds?.length || 0} users`;
    return typeof b.audience === 'string' ? b.audience : b.audience?.type || 'all';
  };

  const statCards = [
    { label: 'Total Broadcasts', value: totalBroadcasts, icon: FiSend, color: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Delivered', value: deliveredCount, icon: FiCheckCircle, color: 'bg-green-100 dark:bg-green-900/40', iconColor: 'text-green-600 dark:text-green-400' },
    { label: 'Opened', value: openedCount, icon: FiInbox, color: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Clicked', value: clickedCount, icon: FiMousePointer, color: 'bg-indigo-100 dark:bg-indigo-900/40', iconColor: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Failed', value: failedCount, icon: FiXCircle, color: 'bg-red-100 dark:bg-red-900/40', iconColor: 'text-red-600 dark:text-red-400' },
    { label: 'Unsubscribes', value: unsubscribes, icon: FiUserCheck, color: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-600 dark:text-purple-400' },
  ];

  const progressFor = (b) => {
    const { sent = 0, total = 0, failed = 0, delivered = 0 } = b.deliveryStats || {};
    const pct = total > 0 ? Math.round((delivered / total) * 100) : 0;
    return { pct, sent, total, failed };
  };

  const rowDelivery = (b) => {
    const { pct, sent, total, failed } = progressFor(b);
    if (!b.deliveryStats) return <span className="text-xs text-gray-400">-</span>;
    if (b.status === 'sending') {
      return (
        <div className="w-32">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
            <span>{pct}%</span>
            <span className="flex items-center"><FiLoader className="w-3 h-3 animate-spin mr-1" />{sent}/{total}</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          {failed > 0 && <p className="text-[10px] text-red-500 mt-0.5">{failed} failed</p>}
        </div>
      );
    }
    return (
      <div className="text-xs space-y-0.5">
        <p className="text-green-600 dark:text-green-400">{b.deliveryStats.delivered} delivered / {b.deliveryStats.total}</p>
        <p className="text-gray-500 dark:text-slate-400">
          {b.deliveryStats.opened} opened · {b.deliveryStats.clicked} clicked
          {(b.deliveryStats.failed > 0 || (b.lastError && b.status === 'failed')) && <span className="text-red-500"> · {b.deliveryStats.failed} failed</span>}
        </p>
      </div>
    );
  };

  const detailSummaries = [
    { l: 'Total', v: detailsData?.summary?.total || 0, c: 'text-gray-900 dark:text-slate-100' },
    { l: 'Sent', v: detailsData?.summary?.sent || 0, c: 'text-green-600 dark:text-green-400' },
    { l: 'Failed', v: detailsData?.summary?.failed || 0, c: 'text-red-600 dark:text-red-400' },
    { l: 'Skipped', v: detailsData?.summary?.skipped || 0, c: 'text-gray-500 dark:text-slate-400' },
    { l: 'Opened', v: detailsData?.summary?.opened || 0, c: 'text-blue-600 dark:text-blue-400' },
    { l: 'Clicked', v: detailsData?.summary?.clicked || 0, c: 'text-indigo-600 dark:text-indigo-400' },
    { l: 'Unsubscribed', v: detailsData?.summary?.unsubscribed || 0, c: 'text-purple-600 dark:text-purple-400' },
  ];

  const filteredRows = useMemo(() => {
    if (!detailsData?.recipients) return [];
    const rows = detailsData.recipients.slice();
    if (detailsStatus) return rows.filter((r) => r.status === detailsStatus);
    return rows;
  }, [detailsData, detailsStatus]);

  const detailRowColor = (status) => (STATUS_COLORS[status] || STATUS_COLORS.draft);

  return (
    <AdminLayout title="Broadcast Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Broadcasts</h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">Create, schedule, send and track notification broadcasts</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center text-xs text-gray-500 dark:text-slate-400"><FiTrendingUp className="w-4 h-4 mr-1" />{openRate}% open · {clickRate}% ctr</span>
            <button onClick={() => openForm()} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
              <FiPlus className="w-4 h-4" />
              <span>New Broadcast</span>
            </button>
          </div>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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

        {/* Filters + search + sort */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <FiSearch className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search broadcasts..."
              className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none w-48"
            />
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_STATUSES.map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                {s ? s.replace('_', ' ') : 'All'}
                {s && statusCounts[s] !== undefined ? ` (${statusCounts[s]})` : ''}
              </button>
            ))}
          </div>
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
                  {broadcasts.map((b) => {
                    const PrioIcon = b.priority === 'high' || b.priority === 'urgent' ? FiAlertCircle : FiTrendingUp;
                    return (
                      <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <PrioIcon className={`w-4 h-4 ${PRIORITY_COLORS[b.priority] || PRIORITY_COLORS.normal}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{b.title}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[220px]">{b.message}</p>
                              {b.lastError && <p className="text-[11px] text-red-500 truncate max-w-[220px]">{b.lastError}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || STATUS_COLORS.draft}`}>
                            {b.status === 'sending' && <FiLoader className="w-3 h-3 animate-spin mr-1" />}
                            {b.status.replace('_', ' ')}
                          </span>
                          {b.scheduledAt && b.status === 'scheduled' && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(b.scheduledAt, true)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            {b.channels?.inApp && <FiMonitor className="w-4 h-4 text-emerald-500" />}
                            {b.channels?.push && <FiSmartphone className="w-4 h-4 text-blue-500" />}
                            {b.channels?.email && <FiMail className="w-4 h-4 text-orange-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400 capitalize">{audienceLabel(b)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{formatDate(b.sentAt || b.createdAt)}</td>
                        <td className="px-6 py-4">{rowDelivery(b)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-1">
                            {!['draft', 'cancelled'].includes(b.status) && (
                              <button onClick={() => handleShowDetails(b._id)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded" title="Delivery details">
                                <FiEye className="w-4 h-4" />
                              </button>
                            )}
                            {['draft', 'scheduled', 'cancelled', 'failed'].includes(b.status) && (
                              <button onClick={() => openForm(b)} className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded" title="Edit">
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                            )}
                            {['draft', 'scheduled', 'failed'].includes(b.status) && (
                              <button onClick={() => handleSend(b._id)} disabled={actionLoading === b._id} className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded disabled:opacity-50" title="Send now">
                                {actionLoading === b._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
                              </button>
                            )}
                            {['scheduled', 'sending', 'partially_sent'].includes(b.status) && (
                              <button onClick={() => handleCancel(b._id)} disabled={actionLoading === b._id} className="p-1.5 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded disabled:opacity-50" title="Cancel / stop">
                                {actionLoading === b._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiClock className="w-4 h-4" />}
                              </button>
                            )}
                            {b.status !== 'sending' && (
                              <button onClick={() => handleDelete(b._id)} disabled={actionLoading === `delete:${b._id}`} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded disabled:opacity-50" title="Delete">
                                {actionLoading === `delete:${b._id}` ? <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" /> : <FiTrash2 className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Page {page}{total ? ` · ${total} total` : ''}
          </p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700"><FiChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * PAGE_SIZE >= total} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700"><FiChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* ─── Create/Edit Modal ─── */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                        <input type="text" value={form.title} maxLength={200} onChange={(e) => updateForm({ title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Broadcast title" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message *</label>
                        <textarea value={form.message} maxLength={5000} onChange={(e) => updateForm({ message: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Notification message content" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type</label>
                          <select value={form.notificationType || 'announcement'} onChange={(e) => updateForm({ notificationType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none">
                            <option value="announcement">Announcement</option>
                            <option value="update">Update</option>
                            <option value="marketing">Marketing</option>
                            <option value="security">Security</option>
                            <option value="card_activity">Card Activity</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Priority</label>
                          <select value={form.priority} onChange={(e) => updateForm({ priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none">
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Image URL</label>
                          <input type="url" value={form.imageUrl} onChange={(e) => updateForm({ imageUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">CTA URL</label>
                          <input type="url" value={form.ctaUrl} onChange={(e) => updateForm({ ctaUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://..." />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">CTA Text</label>
                          <input type="text" value={form.ctaText} onChange={(e) => updateForm({ ctaText: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="View Details" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rich Content (HTML)</label>
                          <input type="text" value={form.richContent} onChange={(e) => updateForm({ richContent: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm" placeholder="Optional HTML snippet" />
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
                        { value: 'specific', label: 'Specific Users', desc: 'Split by user IDs (comma separated)' },
                      ].map((opt) => (
                        <label key={opt.value} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${form.audience.type === opt.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'}`}>
                          <input type="radio" name="audience" value={opt.value} checked={form.audience.type === opt.value} onChange={() => updateAudience({ type: opt.value })} className="mt-1 text-emerald-600 focus:ring-emerald-500" />
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{opt.label}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                      {form.audience.type === 'segment' && (
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-slate-700 pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Profession</label>
                            <input type="text" value={form.audience.filters?.profession || ''} onChange={(e) => updateAudience({ filters: { ...form.audience.filters, profession: e.target.value || undefined } })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Engineer" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">City</label>
                            <input type="text" value={form.audience.filters?.city || ''} onChange={(e) => updateAudience({ filters: { ...form.audience.filters, city: e.target.value || undefined } })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Kathmandu" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Has Cards</label>
                            <select value={form.audience.filters?.hasCards ?? ''} onChange={(e) => updateAudience({ filters: { ...form.audience.filters, hasCards: e.target.value === '' ? undefined : e.target.value === 'true' } })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none">
                              <option value="">Any</option>
                              <option value="true">Has cards</option>
                              <option value="false">No cards</option>
                            </select>
                          </div>
                        </div>
                      )}
                      {form.audience.type === 'specific' && (
                        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">User IDs (comma separated)</label>
                          <textarea
                            value={(form.audienceFiltersList || form.audience.specificUserIds || []).join(', ')}
                            onChange={(e) => updateForm({ audienceFiltersList: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                            placeholder="507f1f77bcf86cd799439011, ..."
                          />
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Only active, verified accounts with matching IDs will be included.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Channels */}
                  {formStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Delivery Channels</p>
                        <div className="space-y-3">
                          {[
                            { key: 'inApp', label: 'In-App', icon: FiMonitor, desc: 'Show in the notification center' },
                            { key: 'push', label: 'Push Notification', icon: FiSmartphone, desc: 'Browser push notification' },
                            { key: 'email', label: 'Email', icon: FiMail, desc: 'Email with open/click tracking & unsubscribe' },
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
                        {!form.channels.inApp && !form.channels.push && !form.channels.email && (
                          <p className="text-xs text-red-500 mt-2">At least one channel is required.</p>
                        )}
                      </div>
                      {form.channels.email && (
                        <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email Subject</label>
                            <input type="text" value={form.emailSubject} onChange={(e) => updateForm({ emailSubject: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Subject used as email subject" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email Body (HTML, optional)</label>
                            <textarea value={form.emailHtml} onChange={(e) => updateForm({ emailHtml: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm" placeholder="Leave empty to auto-generate from the message + CTA" />
                          </div>
                        </div>
                      )}
                      {form.channels.push && (
                        <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Push Title</label>
                            <input type="text" value={form.pushTitle} onChange={(e) => updateForm({ pushTitle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Defaults to broadcast title" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Push Body</label>
                            <textarea value={form.pushBody} onChange={(e) => updateForm({ pushBody: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Defaults to broadcast message" />
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
                            <p className="text-xs text-gray-500 dark:text-slate-400">Broadcast is queued and delivered in the background</p>
                          </div>
                        </label>
                        <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${form.scheduleType === 'later' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700'}`}>
                          <input type="radio" name="schedule" checked={form.scheduleType === 'later'} onChange={() => updateForm({ scheduleType: 'later' })} className="text-emerald-600 focus:ring-emerald-500" />
                          <FiCalendar className="w-5 h-5 ml-3 text-blue-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Schedule for Later</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Picked date/time must be in the future</p>
                          </div>
                        </label>
                      </div>
                      {form.scheduleType === 'later' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Scheduled Date & Time</label>
                          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => updateForm({ scheduledAt: e.target.value })} min={new Date(Date.now()).toISOString().slice(0, 16)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Preview */}
                  {formStep === 5 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-slate-100">Preview</h4>
                        <button onClick={handleGeneratePreview} disabled={previewLoading} className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium disabled:opacity-50">
                          {previewLoading ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiRefreshCw className="w-3.5 h-3.5" />}
                          <span>Render email preview</span>
                        </button>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100">{form.title || 'Untitled Broadcast'}</h4>
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
                        <div className="text-xs text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-200 dark:border-slate-700 space-y-0.5">
                          <p>Audience: <span className="capitalize">{form.audience.type}</span></p>
                          <p>Priority: <span className="capitalize">{form.priority}</span></p>
                          <p>Schedule: {form.scheduleType === 'now' ? 'Send immediately' : form.scheduledAt || 'Not set'}</p>
                          {form.channels.email && !form.emailHtml && (
                            <p className="text-emerald-600 dark:text-emerald-400 mt-1">Email body auto-generated (message + CTA). Includes open/click tracking and unsubscribe link.</p>
                          )}
                        </div>
                      </div>

                      {form.channels.email && (
                        <div className="rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                          {previewHtml ? (
                            <iframe title="Email preview" srcDoc={previewHtml} sandbox="" className="w-full h-80 bg-white" />
                          ) : (
                            <div className="bg-gray-50 dark:bg-slate-900 p-6 text-center text-sm text-gray-500 dark:text-slate-400">
                              {previewLoading ? 'Rendering…' : 'Click "Render email preview" to preview the email layout (per-recipient tracking IDs are added at send time).'}
                            </div>
                          )}
                        </div>
                      )}
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
                      <button onClick={handleNext} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Next</button>
                    ) : (
                      <button onClick={handleSubmit} disabled={submitting || (!form.channels.inApp && !form.channels.push && !form.channels.email)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2">
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
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Delivery Details</h3>
                  <button onClick={() => { setShowDetails(null); setDetailsData(null); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="px-6 py-4">
                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
                  ) : detailsData ? (
                    <div className="space-y-5">
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                        {detailSummaries.map((s) => (
                          <div key={s.l} className="text-center p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                            <p className={`text-lg font-bold ${s.c}`}>{s.v}</p>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {['', 'sent', 'failed', 'skipped'].map((s) => (
                          <button key={s} onClick={() => setDetailsStatus(s)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${detailsStatus === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700'}`}>
                            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                          </button>
                        ))}
                      </div>

                      {filteredRows.length > 0 ? (
                        <div className="space-y-2">
                          {filteredRows.map((r, i) => {
                            const Icon = CHANNEL_ICONS[r.channel === 'in_app' ? 'inApp' : r.channel] || FiMonitor;
                            return (
                              <div key={`${r.trackingId || r.channel}-${i}`} className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{r.email || r.username || String(r.userId || 'Unknown')}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2">
                                      <span className="capitalize">{r.channel}</span>
                                      {r.sentAt && <span>{formatDate(r.sentAt, true)}</span>}
                                      {r.opened && <span className="flex items-center text-blue-600"><FiEye className="w-3 h-3 mr-0.5" />opened {r.openedAt ? formatDate(r.openedAt, true) : ''}</span>}
                                      {r.clicked && <span className="flex items-center text-indigo-600"><FiMousePointer className="w-3 h-3 mr-0.5" />clicked</span>}
                                    </p>
                                    {r.error && <p className="text-[11px] text-red-500 truncate">{r.error}</p>}
                                  </div>
                                </div>
                                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${detailRowColor(r.status)}`}>
                                  {r.unsubscribed && <span className="mr-1">↳</span>}
                                  {r.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No delivery rows for this filter</p>
                      )}
                      {detailsData.hasMore && <p className="text-xs text-gray-400 text-center">Showing a sample of rows — global counters above are complete.</p>}
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