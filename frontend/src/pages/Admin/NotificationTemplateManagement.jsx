import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiFileText,
  FiMail, FiSmartphone, FiMonitor, FiCheck, FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import {
  fetchNotificationTemplates, createNotificationTemplate,
  updateNotificationTemplate, deleteNotificationTemplate,
} from '../../features/admin/adminThunks';

const TYPE_CONFIG = {
  email: { icon: FiMail, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  push: { icon: FiSmartphone, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  in_app: { icon: FiMonitor, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
};

const emptyForm = { name: '', type: 'in_app', subject: '', title: '', body: '', variables: '', isActive: true };

const NotificationTemplateManagement = () => {
  const dispatch = useDispatch();
  const templates = useSelector((s) => s.admin.notificationTemplates);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => { dispatch(fetchNotificationTemplates()); }, [dispatch]);

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }));

  const openForm = (t = null) => {
    if (t) {
      setEditingId(t._id);
      setForm({
        name: t.name || '', type: t.type || 'in_app',
        subject: t.subject || '', title: t.title || '',
        body: t.body || '', variables: (t.variables || []).join(', '),
        isActive: t.isActive !== false,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        variables: form.variables ? form.variables.split(',').map((v) => v.trim()).filter(Boolean) : [],
      };
      if (editingId) {
        await dispatch(updateNotificationTemplate({ id: editingId, ...payload })).unwrap();
        toast.success('Template updated');
      } else {
        await dispatch(createNotificationTemplate(payload)).unwrap();
        toast.success('Template created');
      }
      setShowForm(false);
      dispatch(fetchNotificationTemplates());
    } catch (e) { toast.error(e || 'Failed to save template'); }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteNotificationTemplate(id)).unwrap();
      toast.success('Template deleted');
      setShowDeleteConfirm(null);
    } catch (e) { toast.error(e || 'Failed to delete'); }
  };

  const renderPreview = (t) => {
    const vars = (t.variables || []).reduce((acc, v) => { acc[v] = `{{${v}}}`; return acc; }, {});
    let body = t.body || '';
    Object.entries(vars).forEach(([k, v]) => { body = body.replaceAll(v, `[Sample ${k}]`); });
    return body;
  };

  const filtered = templates.filter((t) => {
    if (search && !t.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && t.type !== typeFilter) return false;
    return true;
  });

  return (
    <AdminLayout title="Notification Templates">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Notification Templates</h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">Manage reusable notification templates</p>
          </div>
          <button onClick={() => openForm()} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
            <FiPlus className="w-4 h-4" /><span>New Template</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          {['', 'email', 'push', 'in_app'].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
              {t || 'All Types'}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <FiFileText className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">No templates found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const cfg = TYPE_CONFIG[t.type] || TYPE_CONFIG.in_app;
              const Icon = cfg.icon;
              return (
                <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        <Icon className="w-3 h-3 mr-1" />{t.type?.replace('_', ' ')}
                      </span>
                      {t.isActive !== false ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"><FiCheck className="w-3 h-3 mr-1" />Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Inactive</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => setPreviewTemplate(t)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded" title="Preview"><FiEye className="w-4 h-4" /></button>
                      <button onClick={() => openForm(t)} className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => setShowDeleteConfirm(t._id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">{t.name}</h3>
                  {(t.subject || t.title) && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 truncate">{t.subject || t.title}</p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{t.body}</p>
                  {t.variables && t.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {t.variables.map((v) => (
                        <span key={v} className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">{`{{${v}}}`}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ─── Create/Edit Modal ─── */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{editingId ? 'Edit Template' : 'New Template'}</h3>
                   <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name *</label>
                    <input type="text" value={form.name} onChange={(e) => updateForm({ name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Template name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type *</label>
                    <select value={form.type} onChange={(e) => updateForm({ type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="in_app">In-App</option>
                      <option value="push">Push</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                  {form.type === 'email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject</label>
                      <input type="text" value={form.subject} onChange={(e) => updateForm({ subject: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Email subject" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{form.type === 'email' ? 'Title' : 'Title'}</label>
                    <input type="text" value={form.title} onChange={(e) => updateForm({ title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Notification title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Body *</label>
                    <textarea value={form.body} onChange={(e) => updateForm({ body: e.target.value })} rows={5} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm" placeholder="Template body. Use {{variable}} for dynamic content." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Variables (comma-separated)</label>
                    <input type="text" value={form.variables} onChange={(e) => updateForm({ variables: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="userName, cardName, date" />
                  </div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => updateForm({ isActive: e.target.checked })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Active</span>
                  </label>
                </div>
                <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100">Cancel</button>
                  <button onClick={handleSubmit} disabled={!form.name || !form.body} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Preview Modal ─── */}
        <AnimatePresence>
          {previewTemplate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewTemplate(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Template Preview</h3>
                   <button onClick={() => setPreviewTemplate(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_CONFIG[previewTemplate.type]?.color || ''}`}>
                      {previewTemplate.type?.replace('_', ' ')}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-slate-100">{previewTemplate.name}</h4>
                  </div>
                  {previewTemplate.subject && <div><p className="text-xs text-gray-500 dark:text-slate-400">Subject</p><p className="text-sm text-gray-900 dark:text-slate-100">{previewTemplate.subject}</p></div>}
                  {previewTemplate.title && <div><p className="text-xs text-gray-500 dark:text-slate-400">Title</p><p className="text-sm font-medium text-gray-900 dark:text-slate-100">{previewTemplate.title}</p></div>}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Body (sample variables)</p>
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                      {renderPreview(previewTemplate)}
                    </div>
                  </div>
                  {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Variables</p>
                      <div className="flex flex-wrap gap-1">
                        {previewTemplate.variables.map((v) => (
                          <span key={v} className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono">{`{{${v}}}`}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                  <button onClick={() => setPreviewTemplate(null)} className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600">Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Delete Confirmation Modal ─── */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDeleteConfirm(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Delete Template?</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">This action cannot be undone.</p>
                <div className="flex items-center justify-center space-x-3">
                  <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg">Cancel</button>
                  <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default NotificationTemplateManagement;
