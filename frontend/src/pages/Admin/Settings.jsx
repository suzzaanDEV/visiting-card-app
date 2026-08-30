import React, { useState, useEffect } from 'react';
import { 
  FiSettings, FiSave, FiRefreshCw, FiShield, FiDatabase, FiServer,
  FiGlobe, FiMail, FiBell, FiLock, FiUnlock, FiEye, FiEyeOff,
  FiDownload, FiUpload, FiTrash2, FiCheck, FiX
} from 'react-icons/fi';
import { FaCog, FaShieldAlt, FaDatabase, FaServer, FaGlobe } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [settings, setSettings] = useState({
    system: {
      siteName: 'Cardly',
      siteDescription: 'Digital Visiting Card Platform',
      maintenanceMode: false,
      debugMode: false,
      registrationEnabled: true,
      maxFileSize: 5,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      enableTwoFactor: false,
      passwordMinLength: 8
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@cardly.com',
      smtpPassword: '',
      fromEmail: 'noreply@cardly.com',
      fromName: 'Cardly Admin'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      adminNotifications: true,
      userNotifications: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      backupLocation: 'local'
    }
  });

  const [activeTab, setActiveTab] = useState('system');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          system: { ...prev.system, ...(data.system || {}) },
          security: { ...prev.security, ...(data.security || {}) },
          email: { ...prev.email, ...(data.email || {}) },
          notifications: { ...prev.notifications, ...(data.notifications || {}) },
          backup: { ...prev.backup, ...(data.backup || {}) }
        }));
      } else {
        console.error('Failed to fetch settings:', response.status);
        // Use default settings if API fails
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    setRefreshing(true);
    await fetchSettings();
    setRefreshing(false);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
        fetchSettings();
      } else {
        try {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to save settings');
        } catch {
          toast.error('Failed to save settings');
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Backup created successfully');
        fetchSettings();
      } else {
        try {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to create backup');
        } catch {
          toast.error('Failed to create backup');
        }
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const tabs = [
    { id: 'system', label: 'System', icon: FaCog },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'backup', label: 'Backup', icon: FiDatabase }
  ];

  const SettingItem = ({ label, children, description }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>
      {children}
      {description && (
        <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">System Settings</h1>
          <p className="text-gray-600 dark:text-slate-400">Configure system preferences and security settings</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={refreshSettings}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent inline-block" />
            ) : <FiRefreshCw className="h-5 w-5" />}
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && (
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent mr-2" />
            )}
            {!saving && <FiSave className="mr-2" />}
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">System Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SettingItem label="Site Name" description="The name of your application">
                    <input
                      type="text"
                      value={settings.system.siteName}
                      onChange={(e) => setSettings({
                        ...settings,
                        system: { ...settings.system, siteName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                  
                  <SettingItem label="Site Description" description="Brief description of your platform">
                    <input
                      type="text"
                      value={settings.system.siteDescription}
                      onChange={(e) => setSettings({
                        ...settings,
                        system: { ...settings.system, siteDescription: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                  
                  <SettingItem label="Max File Size (MB)" description="Maximum file size for uploads">
                    <input
                      type="number"
                      value={settings.system.maxFileSize}
                      onChange={(e) => setSettings({
                        ...settings,
                        system: { ...settings.system, maxFileSize: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                </div>
                
                <div className="space-y-4">
                  <SettingItem label="Maintenance Mode" description="Enable maintenance mode to restrict access">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.system.maintenanceMode}
                        onChange={(e) => setSettings({
                          ...settings,
                          system: { ...settings.system, maintenanceMode: e.target.checked }
                        })}
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Enable maintenance mode</span>
                    </div>
                  </SettingItem>
                  
                  <SettingItem label="Debug Mode" description="Enable debug mode for development">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.system.debugMode}
                        onChange={(e) => setSettings({
                          ...settings,
                          system: { ...settings.system, debugMode: e.target.checked }
                        })}
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Enable debug mode</span>
                    </div>
                  </SettingItem>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Security Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SettingItem label="Session Timeout (hours)" description="How long before sessions expire">
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                  
                  <SettingItem label="Max Login Attempts" description="Maximum failed login attempts before lockout">
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                  
                  <SettingItem label="Password Min Length" description="Minimum password length requirement">
                    <input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                </div>
                
                <div className="space-y-4">
                  <SettingItem label="Password Policy" description="Require strong password for all users">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.requireStrongPassword}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, requireStrongPassword: e.target.checked }
                        })}
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Require strong password</span>
                    </div>
                  </SettingItem>
                  
                  <SettingItem label="Two-Factor Authentication" description="Enable 2FA for enhanced security">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.enableTwoFactor}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, enableTwoFactor: e.target.checked }
                        })}
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Enable two-factor authentication</span>
                    </div>
                  </SettingItem>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Email Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SettingItem label="SMTP Host" description="SMTP server hostname">
                    <input
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpHost: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                  
                  <SettingItem label="SMTP Port" description="SMTP server port">
                    <input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPort: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                  
                  <SettingItem label="SMTP Username" description="SMTP authentication username">
                    <input
                      type="text"
                      value={settings.email.smtpUser}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpUser: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                  
                  <SettingItem label="SMTP Password" description="SMTP authentication password">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={settings.email.smtpPassword}
                        onChange={(e) => setSettings({
                          ...settings,
                          email: { ...settings.email, smtpPassword: e.target.value }
                        })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </SettingItem>
                  
                  <SettingItem label="From Email" description="Default sender email address">
                    <input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromEmail: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                  
                  <SettingItem label="From Name" description="Default sender name">
                    <input
                      type="text"
                      value={settings.email.fromName}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <SettingItem label="Email Notifications" description="Send notifications via email">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                        })}
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Enable email notifications</span>
                    </div>
                  </SettingItem>
                  
                  <SettingItem label="Push Notifications" description="Send browser push notifications">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, pushNotifications: e.target.checked }
                        })}
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Enable push notifications</span>
                    </div>
                  </SettingItem>
                  
                  <SettingItem label="Admin Alerts" description="Send alerts to administrators">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.adminNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, adminNotifications: e.target.checked }
                        })}
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Enable admin alerts</span>
                    </div>
                  </SettingItem>
                  
                  <SettingItem label="User Alerts" description="Send alerts to users">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.userNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, userNotifications: e.target.checked }
                        })}
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Enable user alerts</span>
                    </div>
                  </SettingItem>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Backup & Restore</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SettingItem label="Auto Backup" description="Automatically create backups">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.backup.autoBackup}
                        onChange={(e) => setSettings({
                          ...settings,
                          backup: { ...settings.backup, autoBackup: e.target.checked }
                        })}
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Enable automatic backups</span>
                    </div>
                  </SettingItem>
                  
                  <SettingItem label="Backup Frequency" description="How often to create backups">
                    <select
                      value={settings.backup.backupFrequency}
                      onChange={(e) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, backupFrequency: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </SettingItem>
                  
                  <SettingItem label="Retention Days" description="How long to keep backups">
                    <input
                      type="number"
                      value={settings.backup.retentionDays}
                      onChange={(e) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, retentionDays: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </SettingItem>
                  
                  <SettingItem label="Last Backup" description="Date of the last backup">
                    <input
                      type="text"
                      value={settings.backup.lastBackup ? new Date(settings.backup.lastBackup).toLocaleString() : 'Never'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400"
                    />
                  </SettingItem>
                </div>
                
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={handleBackup}
                    disabled={backupLoading}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {backupLoading ? (
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent mr-2" />
                    ) : <FiDownload className="mr-2" />}
                    Create Backup
                  </button>
                  
                  <label className={`flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer ${restoreLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {restoreLoading ? (
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent mr-2" />
                    ) : <FiUpload className="mr-2" />}
                    Restore Backup
                    <input
                      type="file"
                      accept=".json,.zip"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!confirm('Restoring a backup will overwrite current settings and data. Continue?')) return;
                        setRestoreLoading(true);
                        try {
                          const token = localStorage.getItem('adminToken');
                          const formData = new FormData();
                          formData.append('backup', file);
                          const res = await fetch('/api/admin/restore', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData
                          });
                          if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err.error || 'Restore failed');
                          }
                          toast.success('Backup restored successfully');
                          fetchSettings();
                        } catch (err) {
                          toast.error(err.message || 'Failed to restore backup');
                        } finally {
                          setRestoreLoading(false);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings; 