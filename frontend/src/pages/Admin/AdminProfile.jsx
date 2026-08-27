import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiShield, FiLock, FiSave, FiActivity, FiEye, FiEyeOff } from 'react-icons/fi';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../services/apiService';

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  const getToken = () => localStorage.getItem('adminToken');

  useEffect(() => {
    fetchProfile();
    fetchAuditLogs();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setAdmin(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setTwoFactorEnabled(data.twoFactorEnabled || false);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/audit?limit=20`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setAuditLogs(Array.isArray(data) ? data : data.logs || []);
    } catch { /* ignore */ }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, email })
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Profile updated');
      fetchProfile();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error('Both passwords required');
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile/2fa/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTwoFactorEnabled(data.twoFactorEnabled);
      toast.success(`2FA ${data.twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'password', label: 'Password', icon: FiLock },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'activity', label: 'Activity', icon: FiActivity },
  ];

  return (
    <AdminLayout title="Admin Profile">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Admin Info Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
              <FiUser className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{admin?.name || 'Admin'}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">{admin?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full capitalize">
                {admin?.role?.replace('_', ' ') || 'Admin'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
        >
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Edit Profile</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Change Password</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    type={showCurrentPw ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrentPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <input
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    type={showNewPw ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <FiLock className="w-4 h-4" />
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Security Settings</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {twoFactorEnabled ? 'Extra layer of security is enabled' : 'Add an extra layer of security to your account'}
                  </p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    twoFactorEnabled
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                  }`}
                >
                  {twoFactorEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Note: Two-factor authentication is currently a placeholder. Full TOTP integration coming soon.
              </p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Recent Activity</h3>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">No activity logs found</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.slice(0, 20).map((log, i) => (
                    <div key={log._id || i} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <FiActivity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-slate-100">{log.action || log.description || 'Activity'}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          {log.entityType ? `${log.entityType}` : ''} {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
