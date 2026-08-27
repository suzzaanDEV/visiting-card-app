import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContactMessages, fetchCRMStats, replyToContact, archiveContact, deleteContact } from '../../features/admin/adminThunks';
import { FiMail, FiCornerUpLeft, FiArchive, FiTrash2, FiSearch, FiFilter, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';

const STATUS_COLORS = {
  unread: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  read: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  replied: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
};

const PRIORITY_COLORS = {
  low: 'text-slate-500', normal: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-500 font-bold'
};

export default function CRMPage() {
  const dispatch = useDispatch();
  const { contactMessages = [], contactTotalPages = 1 } = useSelector(s => s.admin);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', search: '', page: 1 });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dispatch(fetchContactMessages(filters));
    dispatch(fetchCRMStats()).unwrap().then(setStats).catch(() => {});
  }, [dispatch, filters]);

  const handleReply = async () => {
    if (!replyText.trim()) return toast.error('Reply message required');
    try {
      await dispatch(replyToContact({ id: selected._id, replyMessage: replyText })).unwrap();
      toast.success('Reply sent');
      setReplyText('');
      dispatch(fetchContactMessages(filters));
    } catch (err) { toast.error(err); }
  };

  const handleFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  return (
    <AdminLayout title="CRM">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CRM - Contact Messages</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage incoming contact form submissions</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-slate-900 dark:text-white' },
            { label: 'Unread', value: stats.unread, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Replied', value: stats.replied, color: 'text-green-600 dark:text-green-400' },
            { label: 'Archived', value: stats.archived, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Spam', value: stats.spam, color: 'text-red-600 dark:text-red-400' }
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={filters.search} onChange={e => handleFilter('search', e.target.value)} placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
        </div>
        <select value={filters.status} onChange={e => handleFilter('status', e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
          <option value="">All Status</option>
          <option value="unread">Unread</option><option value="read">Read</option>
          <option value="replied">Replied</option><option value="archived">Archived</option>
        </select>
        <select value={filters.category} onChange={e => handleFilter('category', e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
          <option value="">All Categories</option>
          <option value="general">General</option><option value="support">Support</option>
          <option value="feedback">Feedback</option><option value="bug">Bug Report</option>
          <option value="partnership">Partnership</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selected ? 'hidden lg:block' : ''} lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden`}>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
            {(Array.isArray(contactMessages) ? contactMessages : []).map(msg => (
              <button key={msg._id} onClick={() => setSelected(msg)}
                className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${selected?._id === msg._id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-white text-sm">{msg.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[msg.status]}`}>{msg.status}</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">{msg.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{msg.subject}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
            {(!contactMessages || contactMessages.length === 0) && (
              <div className="p-8 text-center text-slate-500"><FiMail className="w-8 h-8 mx-auto mb-2 opacity-50" />No messages</div>
            )}
          </div>
          {contactTotalPages > 1 && (
            <div className="p-3 flex justify-center gap-2 border-t border-slate-200 dark:border-slate-700">
              {Array.from({ length: Math.min(contactTotalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => handleFilter('page', p)}
                  className={`px-3 py-1 text-sm rounded ${filters.page === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>

        <div className={`${selected ? '' : 'hidden lg:block'} lg:col-span-2`}>
          {selected ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selected.subject}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">From: {selected.name} ({selected.email}) &middot; {new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="lg:hidden text-slate-400 hover:text-slate-600">Back</button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                <span className={`text-xs ${PRIORITY_COLORS[selected.priority]}`}>{selected.priority}</span>
                <span className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{selected.category}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selected.message}</p>
              </div>
              {selected.replyMessage && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4 border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Reply sent</p>
                  <p className="text-sm text-green-600 dark:text-green-300 whitespace-pre-wrap">{selected.replyMessage}</p>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Type your reply..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleReply} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm">
                  <FiCornerUpLeft className="w-4 h-4" /> Send Reply
                </button>
                <button onClick={async () => {
                  try { await dispatch(archiveContact(selected._id)).unwrap(); toast.success('Archived'); setSelected(null); dispatch(fetchContactMessages(filters)); }
                  catch { toast.error('Failed to archive'); }
                }} className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition text-sm">
                  <FiArchive className="w-4 h-4" /> Archive
                </button>
                <button onClick={async () => {
                  if (!confirm('Delete this message?')) return;
                  try { await dispatch(deleteContact(selected._id)).unwrap(); toast.success('Deleted'); setSelected(null); dispatch(fetchContactMessages(filters)); }
                  catch { toast.error('Failed to delete'); }
                }} className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition text-sm">
                  <FiTrash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <FiMail className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-50" />
              <p className="text-slate-500 dark:text-slate-400">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}
