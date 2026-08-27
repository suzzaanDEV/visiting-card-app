import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoriesAdmin } from '../../features/admin/adminThunks';
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';

export default function CategoryManagement() {
  const dispatch = useDispatch();
  const { categories = [] } = useSelector(s => s.admin);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', color: '#6366f1', sortOrder: 0, isFeatured: false });

  useEffect(() => { dispatch(fetchCategoriesAdmin()); }, [dispatch]);

  const getToken = () => localStorage.getItem('adminToken');

  const handleSave = async () => {
    if (!form.name || !form.slug) return toast.error('Name and slug required');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/categories/admin/${editing._id}` : '/api/categories/admin';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(editing ? 'Updated' : 'Created');
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', slug: '', description: '', icon: '', color: '#6366f1', sortOrder: 0, isFeatured: false });
      dispatch(fetchCategoriesAdmin());
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete category?')) return;
    try {
      await fetch(`/api/categories/admin/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
      toast.success('Deleted');
      dispatch(fetchCategoriesAdmin());
    } catch { toast.error('Failed'); }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '', color: cat.color || '#6366f1', sortOrder: cat.sortOrder || 0, isFeatured: cat.isFeatured || false });
    setShowForm(true);
  };

  return (
    <AdminLayout title="Category Management">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Category Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Organize cards into categories</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', icon: '', color: '#6366f1', sortOrder: 0, isFeatured: false }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <FiPlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editing ? 'Edit Category' : 'New Category'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
            </div>
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
              </div>
              <label className="flex items-center gap-2 pb-2">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Featured</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">{editing ? 'Update' : 'Create'}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Array.isArray(categories) ? categories : []).map(cat => (
          <div key={cat._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                  <FiTag className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{cat.slug}</p>
                </div>
              </div>
              {cat.isFeatured && <span className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">Featured</span>}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{cat.description || 'No description'}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">{cat.cardCount || 0} cards</span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><FiEdit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AdminLayout>
  );
}
