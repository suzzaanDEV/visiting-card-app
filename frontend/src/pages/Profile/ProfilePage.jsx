import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaUser, FaShieldAlt, FaBell, FaCog,
  FaSignOutAlt, FaTrash, FaDownload, FaCamera, FaKey, FaMoon, FaSun
} from 'react-icons/fa';
import { FiUser, FiMail, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import { isPushSupported, requestPermission, subscribeToPush, unsubscribeFromPush, isSubscribed } from '../../utils/pushNotifications';
import { useTheme } from '../../context/ThemeContext';

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    bio: '',
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [stats, setStats] = useState({
    totalCards: 0,
    totalSaved: 0,
    memberSince: ''
  });
  const [notifPrefs, setNotifPrefs] = useState({
    pushEnabled: true,
    cardLoved: true,
    cardShared: true,
    cardViewed: true,
    accessRequests: true,
    accessUpdates: true,
    systemAlerts: true,
    weeklyDigest: false
  });
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    defaultCardVisibility: 'public',
    showEmail: true,
    showPhone: true,
    showAddress: true,
    profileVisible: true
  });
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
    fetchNotifPrefs();
    fetchPrivacySettings();
    setPushSupported(isPushSupported());
    isSubscribed().then(setPushEnabled);
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user || user);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/auth/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPrivacySettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/privacy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.privacySettings) setPrivacySettings(data.privacySettings);
      }
    } catch { /* ignore */ }
  };

  const savePrivacySettings = async (updates) => {
    const updated = { ...privacySettings, ...updates };
    setPrivacySettings(updated);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success('Privacy settings saved');
      } else {
        toast.error('Failed to save privacy settings');
        setPrivacySettings(privacySettings);
      }
    } catch {
      toast.error('Failed to save privacy settings');
      setPrivacySettings(privacySettings);
    }
  };

  const fetchNotifPrefs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifPrefs(data.preferences || notifPrefs);
      }
    } catch { /* ignore */ }
  }, []);

  const toggleNotifPref = useCallback(async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [key]: updated[key] })
      });
      if (res.ok) {
        toast.success('Preference saved');
      } else {
        toast.error('Failed to save preference');
        setNotifPrefs(notifPrefs);
      }
    } catch {
      toast.error('Failed to save preference');
      setNotifPrefs(notifPrefs);
    }
  }, [notifPrefs]);

  const handleTogglePush = async () => {
    if (pushEnabled) {
      await unsubscribeFromPush();
      setPushEnabled(false);
      toggleNotifPref('pushEnabled');
      toast.success('Push notifications disabled');
    } else {
      const perm = await requestPermission();
      if (perm === 'granted') {
        const result = await subscribeToPush();
        if (result.success) {
          setPushEnabled(true);
          toggleNotifPref('pushEnabled');
          toast.success('Push notifications enabled');
        }
      } else {
        toast.error('Notifications blocked by browser');
      }
    }
  };

  const validateProfileFields = () => {
    const errors = {};
    if (!user.name || !user.name.trim()) {
      errors.name = 'Name is required';
    } else if (user.name.length > 100) {
      errors.name = 'Name must be at most 100 characters';
    }
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = 'Invalid email format';
    }
    if (user.phone && user.phone.trim()) {
      const phoneClean = user.phone.replace(/[\s\-(). ]/g, '');
      if (!/^\+?\d{7,15}$/.test(phoneClean)) {
        errors.phone = 'Invalid phone number';
      }
    }
    if (user.bio && user.bio.length > 500) {
      errors.bio = 'Bio must be at most 500 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfileFields()) return;
    try {
      setSaving(true);
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(user)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user || user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setFieldErrors({});
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        setUser(prev => ({ ...prev, avatar: base64 }));
        toast.success('Avatar updated — click Save to apply');
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to process avatar');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setChangingPassword(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        toast.success('Password updated successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to change password');
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FaUser },
    { id: 'security', name: 'Security', icon: FaShieldAlt },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'settings', name: 'Settings', icon: FaCog }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background dark:bg-slate-950 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-brand-textMuted text-sm font-semibold">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-brand-surface dark:bg-slate-900 border-b border-brand-border/40 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-text dark:text-white tracking-tight">Account Profile</h1>
            <p className="text-brand-textMuted text-sm mt-1">Manage your public information, access credentials, and notifications</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card elevation="sm" className="p-6 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="relative inline-block select-none mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-brand-surface dark:border-slate-800 shadow-md overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-primaryHover transition-colors shadow-md">
                      <FaCamera className="text-xs" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <h2 className="text-xl font-bold text-brand-text dark:text-white truncate">{user.name || 'Cardly User'}</h2>
                  <p className="text-xs text-brand-textMuted truncate mt-0.5">{user.email}</p>
                </div>

                {/* Stats Container */}
                <div className="space-y-3 mb-6 p-4 bg-brand-background dark:bg-slate-850 rounded-xl border border-brand-border/30 dark:border-slate-800/40 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-brand-textMuted">Cards Created</span>
                    <span className="font-bold text-brand-text dark:text-white">{stats.totalCards || 0}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-brand-border/30 dark:border-slate-800/40 pt-2">
                    <span className="font-semibold text-brand-textMuted">Saved Cards</span>
                    <span className="font-bold text-brand-text dark:text-white">{stats.totalSaved || 0}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-brand-border/30 dark:border-slate-800/40 pt-2">
                    <span className="font-semibold text-brand-textMuted">Member Since</span>
                    <span className="font-bold text-brand-text dark:text-white">
                      {stats.memberSince ? new Date(stats.memberSince).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : 'text-brand-textMuted hover:bg-brand-background dark:hover:bg-slate-800 hover:text-brand-text'
                      }`}
                    >
                      <tab.icon className="text-base" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Pane */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card elevation="sm" className="p-8 bg-brand-surface dark:bg-slate-900 border border-brand-border/40 dark:border-slate-800/80">
                {/* Tab content conditional rendering */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between border-b border-brand-border/40 dark:border-slate-800/60 pb-4 mb-6">
                      <h2 className="text-xl font-bold text-brand-text dark:text-white">Profile Information</h2>
                      <Button
                        onClick={() => {
                          if (isEditing) handleSave();
                          else setIsEditing(true);
                        }}
                        variant={isEditing ? 'primary' : 'outline'}
                      >
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Input
                            label="Full Name"
                            type="text"
                            icon={FiUser}
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Your Full Name"
                          />
                          {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                        </div>

                        <div>
                          <Input
                            label="Email Address"
                            type="email"
                            icon={FiMail}
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            disabled={!isEditing}
                            placeholder="yourname@example.com"
                          />
                          {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                        </div>

                        <div>
                          <Input
                            label="Phone Number"
                            type="tel"
                            icon={FiPhone}
                            value={user.phone}
                            onChange={(e) => setUser({ ...user, phone: e.target.value })}
                            disabled={!isEditing}
                            placeholder="+977-9800000000"
                          />
                          {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                        </div>

                        <Input
                          label="Location"
                          type="text"
                          icon={FiMapPin}
                          value={user.location}
                          onChange={(e) => setUser({ ...user, location: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Kathmandu, Nepal"
                        />

                        <Input
                          label="Website"
                          type="url"
                          icon={FiGlobe}
                          value={user.website}
                          onChange={(e) => setUser({ ...user, website: e.target.value })}
                          disabled={!isEditing}
                          placeholder="https://company.com.np"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-brand-text dark:text-brand-text/90 tracking-wide uppercase">
                          Bio Description
                          {user.bio && <span className="font-normal text-brand-textMuted ml-2">({user.bio.length}/500)</span>}
                        </label>
                        <textarea
                          value={user.bio}
                          onChange={(e) => setUser({ ...user, bio: e.target.value })}
                          disabled={!isEditing}
                          maxLength={500}
                          rows={4}
                          className="w-full px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-brand-text border border-brand-border dark:border-slate-700 rounded-xl transition-all duration-200 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:bg-brand-background dark:disabled:bg-slate-850/60 disabled:text-brand-textMuted text-sm"
                          placeholder="Tell colleagues, recruiters, or clients about yourself..."
                        />
                        {fieldErrors.bio && <p className="text-red-500 text-xs">{fieldErrors.bio}</p>}
                      </div>

                      {isEditing && (
                        <div className="flex gap-3 pt-2">
                          <Button onClick={handleSave} variant="primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Configuration'}
                          </Button>
                          <Button onClick={() => { setIsEditing(false); setFieldErrors({}); }} variant="ghost">
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-xl font-bold text-brand-text dark:text-white border-b border-brand-border/40 dark:border-slate-800/60 pb-4 mb-6">Security Settings</h2>
                    <div className="space-y-6">
                      <div className="border border-brand-border/40 dark:border-slate-800/80 rounded-2xl p-6 bg-brand-background/40 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-brand-text dark:text-white">Change Credentials</h3>
                          <p className="text-xs text-brand-textMuted mt-1">Rotate your password periodically to guarantee data safety.</p>
                        </div>
                        <Button variant="outline" className="flex-shrink-0" onClick={() => setShowPasswordModal(true)}>
                          <FaKey className="mr-2 text-xs" />
                          Update Password
                        </Button>
                      </div>

                      <div className="border border-brand-border/40 dark:border-slate-800/80 rounded-2xl p-6 bg-brand-background/40 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-brand-text dark:text-white">Two-Factor Authentication (2FA)</h3>
                          <p className="text-xs text-brand-textMuted mt-1">Ensure multi-factor verification is enforced on email requests.</p>
                        </div>
                        <Button variant="secondary" className="flex-shrink-0" onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch('/api/auth/profile/2fa/toggle', {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setTwoFactorEnabled(data.twoFactorEnabled);
                              toast.success(data.twoFactorEnabled ? '2FA enabled' : '2FA disabled');
                            } else { toast.error('Failed to toggle 2FA'); }
                          } catch { toast.error('Failed to toggle 2FA'); }
                        }}>
                          <FaShieldAlt className="mr-2 text-xs" />
                          {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA Validation'}
                        </Button>
                      </div>

                      <div className="border border-brand-danger/20 dark:border-red-900/25 rounded-2xl p-6 bg-brand-danger/5 dark:bg-red-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-brand-danger">Permanently Terminate Account</h3>
                          <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-1">Once requested, all visiting cards, statistics, and metadata are destroyed.</p>
                        </div>
                        <Button variant="danger" className="flex-shrink-0" onClick={async () => {
                          if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch('/api/auth/account', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                            if (res.ok) {
                              localStorage.removeItem('token');
                              toast.success('Account deleted');
                              window.location.href = '/';
                            } else { toast.error('Failed to delete account'); }
                          } catch { toast.error('Failed to delete account'); }
                        }}>
                          <FaTrash className="mr-2 text-xs" />
                          Delete Cardly Account
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-xl font-bold text-brand-text dark:text-white border-b border-brand-border/40 dark:border-slate-800/60 pb-4 mb-6">Notification Preferences</h2>
                    
                    {/* Push notification toggle */}
                    {pushSupported && (
                      <div className="flex items-center justify-between p-4 border border-brand-border/40 dark:border-slate-800/60 rounded-xl mb-4 bg-brand-background/30 dark:bg-slate-800/30">
                        <div>
                          <h3 className="text-sm font-bold text-brand-text dark:text-white">Push Notifications</h3>
                          <p className="text-xs text-brand-textMuted mt-0.5">Receive push notifications in your browser</p>
                        </div>
                        <button onClick={handleTogglePush} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushEnabled ? 'bg-brand-primary' : 'bg-brand-border dark:bg-slate-700'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    )}

                    <div className="space-y-4">
                      {[
                        { key: 'cardLoved', label: 'Card Loved Alerts', desc: 'Get notified when someone loves your card.' },
                        { key: 'cardShared', label: 'Card Shared Alerts', desc: 'Get notified when someone shares your card.' },
                        { key: 'cardViewed', label: 'Card Viewed Alerts', desc: 'Get notified when someone views your card.' },
                        { key: 'accessRequests', label: 'Access Request Alerts', desc: 'Get real-time alerts when users request access to private cards.' },
                        { key: 'accessUpdates', label: 'Access Updates', desc: 'Get notified when your access requests are approved or rejected.' },
                        { key: 'systemAlerts', label: 'System Announcements', desc: 'Maintenance updates, new features, and news.' },
                        { key: 'weeklyDigest', label: 'Weekly Summary Analytics', desc: 'Receive a weekly digest of views and shares.' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-brand-border/40 dark:border-slate-800/60 rounded-xl hover:bg-brand-background/30 dark:hover:bg-slate-800/30 transition-all select-none">
                          <div className="min-w-0 pr-4">
                            <h3 className="text-sm font-bold text-brand-text dark:text-white">{item.label}</h3>
                            <p className="text-xs text-brand-textMuted mt-0.5">{item.desc}</p>
                          </div>
                          <button onClick={() => toggleNotifPref(item.key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifPrefs[item.key] ? 'bg-brand-primary' : 'bg-brand-border dark:bg-slate-700'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifPrefs[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-xl font-bold text-brand-text dark:text-white border-b border-brand-border/40 dark:border-slate-800/60 pb-4 mb-6">Account Settings</h2>
                    <div className="space-y-6">
                      <div className="border border-brand-border/40 dark:border-slate-800/80 rounded-2xl p-6 bg-brand-background/40 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-brand-text dark:text-white">Export Directory Data</h3>
                          <p className="text-xs text-brand-textMuted mt-1">Download contact directories, card statistics, and profile assets in JSON format.</p>
                        </div>
                        <Button variant="outline" className="flex-shrink-0" onClick={() => {
                          const exportData = { ...user };
                          delete exportData.avatar;
                          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `cardly-profile-${Date.now()}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success('Profile exported!');
                        }}>
                          <FaDownload className="mr-2 text-xs" />
                          Download JSON
                        </Button>
                      </div>

                      <div className="border border-brand-border/40 dark:border-slate-800/80 rounded-2xl p-6 bg-brand-background/40 dark:bg-slate-900/40">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-bold text-brand-text dark:text-white">Privacy Constraints</h3>
                            <p className="text-xs text-brand-textMuted mt-1">Configure profile visibility limitations in searches or lists.</p>
                          </div>
                          <FaShieldAlt className="text-brand-primary text-lg flex-shrink-0" />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 border border-brand-border/30 dark:border-slate-800/40 rounded-xl select-none">
                            <div>
                              <h4 className="text-sm font-semibold text-brand-text dark:text-white">Profile Visible</h4>
                              <p className="text-xs text-brand-textMuted mt-0.5">Allow others to find your profile</p>
                            </div>
                            <button onClick={() => savePrivacySettings({ profileVisible: !privacySettings.profileVisible })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacySettings.profileVisible ? 'bg-brand-primary' : 'bg-brand-border dark:bg-slate-700'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacySettings.profileVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-brand-border/30 dark:border-slate-800/40 rounded-xl select-none">
                            <div>
                              <h4 className="text-sm font-semibold text-brand-text dark:text-white">Show Email</h4>
                              <p className="text-xs text-brand-textMuted mt-0.5">Display email on your public cards</p>
                            </div>
                            <button onClick={() => savePrivacySettings({ showEmail: !privacySettings.showEmail })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacySettings.showEmail ? 'bg-brand-primary' : 'bg-brand-border dark:bg-slate-700'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacySettings.showEmail ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-brand-border/30 dark:border-slate-800/40 rounded-xl select-none">
                            <div>
                              <h4 className="text-sm font-semibold text-brand-text dark:text-white">Show Phone</h4>
                              <p className="text-xs text-brand-textMuted mt-0.5">Display phone number on your public cards</p>
                            </div>
                            <button onClick={() => savePrivacySettings({ showPhone: !privacySettings.showPhone })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacySettings.showPhone ? 'bg-brand-primary' : 'bg-brand-border dark:bg-slate-700'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacySettings.showPhone ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-brand-border/30 dark:border-slate-800/40 rounded-xl select-none">
                            <div>
                              <h4 className="text-sm font-semibold text-brand-text dark:text-white">Show Address</h4>
                              <p className="text-xs text-brand-textMuted mt-0.5">Display location on your public cards</p>
                            </div>
                            <button onClick={() => savePrivacySettings({ showAddress: !privacySettings.showAddress })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacySettings.showAddress ? 'bg-brand-primary' : 'bg-brand-border dark:bg-slate-700'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacySettings.showAddress ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-brand-text dark:text-brand-text/90 tracking-wide uppercase mb-1 block">Default Card Visibility</label>
                            <select
                              value={privacySettings.defaultCardVisibility}
                              onChange={(e) => savePrivacySettings({ defaultCardVisibility: e.target.value })}
                              className="w-full px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-brand-text border border-brand-border dark:border-slate-700 rounded-xl transition-all duration-200 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm"
                            >
                              <option value="public">Public</option>
                              <option value="private">Private</option>
                              <option value="contacts">Contacts Only</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border border-brand-border/40 dark:border-slate-800/80 rounded-2xl p-6 bg-brand-background/40 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-brand-text dark:text-white">Appearance Theme</h3>
                          <p className="text-xs text-brand-textMuted mt-1">Switch between light and dark mode for your interface.</p>
                        </div>
                        <Button variant="secondary" className="flex-shrink-0" onClick={toggleTheme}>
                          {theme === 'dark' ? <FaSun className="mr-2 text-xs" /> : <FaMoon className="mr-2 text-xs" />}
                          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </Button>
                      </div>

                      <div className="border border-brand-border/40 dark:border-slate-800/80 rounded-2xl p-6 bg-brand-background/40 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-brand-text dark:text-white">Logout Session</h3>
                          <p className="text-xs text-brand-textMuted mt-1">Clear browser keys and terminate active session handles.</p>
                        </div>
                        <Button variant="ghost" className="bg-brand-background dark:bg-slate-800 flex-shrink-0" onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          window.location.href = '/login';
                        }}>
                          <FaSignOutAlt className="mr-2 text-xs" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-surface dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-brand-border/40 dark:border-slate-800/80 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4">Change Password</h3>
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="primary" onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </Button>
                <Button variant="ghost" onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;