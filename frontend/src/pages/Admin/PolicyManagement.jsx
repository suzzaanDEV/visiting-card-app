import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPolicies, createPolicy, updatePolicy, deletePolicy, publishPolicy } from '../../features/admin/adminThunks';
import { FiPlus, FiEdit2, FiTrash2, FiGlobe, FiFileText, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import EmptyState from '../../components/UI/EmptyState';

const POLICY_TYPES = [
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'terms-of-service', title: 'Terms of Service' },
  { slug: 'cookie-policy', title: 'Cookie Policy' },
  { slug: 'acceptable-use', title: 'Acceptable Use Policy' },
  { slug: 'data-processing', title: 'Data Processing Agreement' },
  { slug: 'refund-policy', title: 'Refund Policy' }
];

export default function PolicyManagement() {
  const dispatch = useDispatch();
  const { policies = [] } = useSelector(s => s.admin);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ slug: '', title: '', content: '', summary: '', version: '1.0', isRequired: false });

  useEffect(() => { dispatch(fetchPolicies()); }, [dispatch]);

  const handleCreate = () => {
    setEditing(null);
    setForm({ slug: '', title: '', content: '', summary: '', version: '1.0', isRequired: false });
    setShowEditor(true);
  };

  const handleEdit = (policy) => {
    setEditing(policy);
    setForm({ slug: policy.slug, title: policy.title, content: policy.content, summary: policy.summary || '', version: policy.version, isRequired: policy.isRequired });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.title || !form.content) return toast.error('Slug, title, and content are required');
    try {
      if (editing) {
        await dispatch(updatePolicy({ slug: editing.slug, ...form })).unwrap();
        toast.success('Policy updated');
      } else {
        await dispatch(createPolicy(form)).unwrap();
        toast.success('Policy created');
      }
      setShowEditor(false);
      dispatch(fetchPolicies());
    } catch (err) { toast.error(err); }
  };

  const handlePublish = async (slug) => {
    try {
      await dispatch(publishPolicy(slug)).unwrap();
      toast.success('Policy published');
      dispatch(fetchPolicies());
    } catch (err) { toast.error(err || 'Failed to publish'); }
  };

  const handleDelete = async (slug) => {
    if (!confirm('Delete this policy?')) return;
    try { await dispatch(deletePolicy(slug)).unwrap(); toast.success('Deleted'); } catch (err) { toast.error(err); }
  };

  return (
    <AdminLayout title="Policy Management">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Policy Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage privacy policy, terms of service, and other legal documents</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <FiPlus className="w-4 h-4" /> New Policy
        </button>
      </div>

      {showEditor && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editing ? 'Edit Policy' : 'Create Policy'}</h2>
            <button onClick={() => setShowEditor(false)} className="text-slate-400 hover:text-slate-600"><FiX className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug</label>
              <select value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} disabled={!!editing}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
                <option value="">Select type...</option>
                {POLICY_TYPES.map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Version</label>
              <input value={form.version} onChange={e => setForm({ ...form, version: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Summary</label>
            <input value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content (Markdown)</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={15}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-mono text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isRequired" checked={form.isRequired} onChange={e => setForm({ ...form, isRequired: e.target.checked })} className="rounded" />
            <label htmlFor="isRequired" className="text-sm text-slate-700 dark:text-slate-300">Require user acceptance</label>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              {editing ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setShowEditor(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Array.isArray(policies) ? policies : []).map(policy => (
          <div key={policy._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{policy.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">v{policy.version} &middot; {policy.slug}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${policy.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                {policy.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{policy.summary || policy.content?.substring(0, 150) + '...'}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">{policy.acceptedCount || 0} acceptances</span>
              <div className="flex gap-2">
                {!policy.isPublished && (
                  <button onClick={() => handlePublish(policy.slug)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Publish">
                    <FiGlobe className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleEdit(policy)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Edit">
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(policy.slug)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!policies || policies.length === 0) && (
          <div className="col-span-full">
            <EmptyState
              icon={<FiFileText className="w-12 h-12" />}
              title="No policies created yet"
              description="Click 'New Policy' to create your first policy document."
              action={
                <button onClick={handleCreate} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                  Create Policy
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}
