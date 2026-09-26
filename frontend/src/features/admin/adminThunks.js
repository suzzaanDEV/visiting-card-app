import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminFetch } from '../../services/adminApi';


// Fetch admin dashboard data
export const fetchAdminDashboard = createAsyncThunk(
  'admin/fetchAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminFetch('/admin/dashboard', {
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin dashboard');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch users with pagination and search
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await adminFetch(
        `/admin/users?page=${page}&limit=${limit}&search=${search}`, {
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch cards with pagination and search
export const fetchAdminCards = createAsyncThunk(
  'admin/fetchAdminCards',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await adminFetch(
        `/admin/cards?page=${page}&limit=${limit}&search=${search}`, {
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch analytics data
export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async ({ period = '7d' }, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/analytics?period=${period}`, {
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch real-time data
export const fetchRealTimeData = createAsyncThunk(
  'admin/fetchRealTimeData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminFetch('/admin/realtime', {
      });

      if (!response.ok) {
        throw new Error('Failed to fetch real-time data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// User management functions
export const banUser = createAsyncThunk(
  'admin/banUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/users/${userId}/ban`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      const data = await response.json();
      return { userId, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const data = await response.json();
      return { userId, user: data.user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      return { userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Card management functions
export const featureCard = createAsyncThunk(
  'admin/featureCard',
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/cards/${cardId}/feature`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to feature card');
      }

      const data = await response.json();
      return { cardId, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCard = createAsyncThunk(
  'admin/deleteCard',
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/cards/${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      return { cardId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCardAnalytics = createAsyncThunk(
  'admin/getCardAnalytics',
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/cards/${cardId}/analytics`, {
      });

      if (!response.ok) {
        throw new Error('Failed to fetch card analytics');
      }

      const data = await response.json();
      return { cardId, analytics: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Template Management Functions
export const fetchTemplates = createAsyncThunk(
  'admin/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminFetch('/admin/templates', {
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTemplate = createAsyncThunk(
  'admin/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await adminFetch('/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'admin/updateTemplate',
  async ({ id, ...templateData }, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'admin/deleteTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }

      return { templateId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Access request management
export const fetchAccessRequests = createAsyncThunk(
  'admin/fetchAccessRequests',
  async ({ page = 1, limit = 10, status = '' }, { rejectWithValue }) => {
    try {
      const response = await adminFetch(
        `/admin/access-requests?page=${page}&limit=${limit}&status=${status}`, {
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch access requests');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveAccessRequest = createAsyncThunk(
  'admin/approveAccessRequest',
  async ({ requestId, adminNotes = '' }, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/access-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve access request');
      }

      const data = await response.json();
      return { requestId, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectAccessRequest = createAsyncThunk(
  'admin/rejectAccessRequest',
  async ({ requestId, adminNotes = '', reason = '' }, { rejectWithValue }) => {
    try {
      const response = await adminFetch(`/admin/access-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNotes, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject access request');
      }

      const data = await response.json();
      return { requestId, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Policy Management
export const fetchPolicies = createAsyncThunk('admin/fetchPolicies', async (_, { rejectWithValue }) => {
  try {
    const res = await adminFetch('/policies/admin/all', { headers: {} });
    if (!res.ok) throw new Error('Failed to fetch policies');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

export const createPolicy = createAsyncThunk('admin/createPolicy', async (policyData, { rejectWithValue }) => {
  try {
    const res = await adminFetch('/policies/admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(policyData)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return rejectWithValue(body.error || 'Failed to create policy');
    }
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

export const updatePolicy = createAsyncThunk('admin/updatePolicy', async ({ slug, ...data }, { rejectWithValue }) => {
  try {
    const res = await adminFetch(`/policies/admin/${slug}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update policy');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

export const deletePolicy = createAsyncThunk('admin/deletePolicy', async (slug, { rejectWithValue }) => {
  try {
    const res = await adminFetch(`/policies/admin/${slug}`, { method: 'DELETE', headers: {} });
    if (!res.ok) throw new Error('Failed to delete policy');
    return { slug };
  } catch (error) { return rejectWithValue(error.message); }
});

export const publishPolicy = createAsyncThunk('admin/publishPolicy', async (slug, { rejectWithValue }) => {
  try {
    const res = await adminFetch(`/policies/admin/${slug}/publish`, { method: 'POST', headers: {} });
    if (!res.ok) throw new Error('Failed to publish policy');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

// CRM - Contact Messages
export const fetchContactMessages = createAsyncThunk('admin/fetchContactMessages', async (params = {}, { rejectWithValue }) => {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await adminFetch(`/crm?${qs}`, { headers: {} });
    if (!res.ok) throw new Error('Failed to fetch contacts');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

export const fetchCRMStats = createAsyncThunk('admin/fetchCRMStats', async (_, { rejectWithValue }) => {
  try {
    const res = await adminFetch('/crm/stats', { headers: {} });
    if (!res.ok) throw new Error('Failed to fetch CRM stats');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

export const replyToContact = createAsyncThunk('admin/replyToContact', async ({ id, replyMessage }, { rejectWithValue }) => {
  try {
    const res = await adminFetch(`/crm/${id}/reply`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ replyMessage })
    });
    if (!res.ok) throw new Error('Failed to reply');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

export const archiveContact = createAsyncThunk('admin/archiveContact', async (id, { rejectWithValue }) => {
  try {
    const res = await adminFetch(`/crm/${id}/archive`, {
      method: 'POST', headers: {}
    });
    if (!res.ok) throw new Error('Failed to archive');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

export const deleteContact = createAsyncThunk('admin/deleteContact', async (id, { rejectWithValue }) => {
  try {
    const res = await adminFetch(`/crm/${id}`, {
      method: 'DELETE', headers: {}
    });
    if (!res.ok) throw new Error('Failed to delete');
    return { id };
  } catch (error) { return rejectWithValue(error.message); }
});

// Audit Logs
export const fetchAuditLogs = createAsyncThunk('admin/fetchAuditLogs', async (params = {}, { rejectWithValue }) => {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await adminFetch(`/audit?${qs}`, { headers: {} });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

export const fetchAuditStats = createAsyncThunk('admin/fetchAuditStats', async (_, { rejectWithValue }) => {
  try {
    const res = await adminFetch('/audit/stats', { headers: {} });
    if (!res.ok) throw new Error('Failed to fetch audit stats');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

export const fetchAuditActions = createAsyncThunk('admin/fetchAuditActions', async (_, { rejectWithValue }) => {
  try {
    const res = await adminFetch('/audit/actions', { headers: {} });
    if (!res.ok) throw new Error('Failed to fetch audit actions');
    const data = await res.json();
    return data.actions || [];
  } catch (error) { return rejectWithValue(error.message); }
});

// Categories
export const fetchCategoriesAdmin = createAsyncThunk('admin/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await adminFetch('/categories/admin/all', { headers: {} });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (error) { return rejectWithValue(error.message); }
});

// ─── Broadcasts ───────────────────────────────────────────────────────────────
export const fetchBroadcasts = createAsyncThunk(
  'admin/fetchBroadcasts',
  async ({ page = 1, limit = 20, status = '', q = '', sort = 'newest' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit, sort });
      if (status) params.append('status', status);
      if (q) params.append('q', q);
      const res = await adminFetch(`/admin/broadcasts?${params}`, {
      });
      if (!res.ok) throw new Error('Failed to fetch broadcasts');
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const createBroadcast = createAsyncThunk(
  'admin/createBroadcast',
  async (data, { rejectWithValue }) => {
    try {
      const res = await adminFetch('/admin/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to create broadcast'); }
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const updateBroadcast = createAsyncThunk(
  'admin/updateBroadcast',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await adminFetch(`/admin/broadcasts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to update broadcast'); }
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const deleteBroadcast = createAsyncThunk(
  'admin/deleteBroadcast',
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminFetch(`/admin/broadcasts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete broadcast');
      return { id };
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const sendBroadcast = createAsyncThunk(
  'admin/sendBroadcast',
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminFetch(`/admin/broadcasts/${id}/send`, {
        method: 'POST',
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to send broadcast'); }
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const scheduleBroadcast = createAsyncThunk(
  'admin/scheduleBroadcast',
  async ({ id, scheduledAt }, { rejectWithValue }) => {
    try {
      const res = await adminFetch(`/admin/broadcasts/${id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to schedule broadcast'); }
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const cancelBroadcast = createAsyncThunk(
  'admin/cancelBroadcast',
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminFetch(`/admin/broadcasts/${id}/cancel`, {
        method: 'POST',
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to cancel broadcast'); }
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const fetchBroadcastStats = createAsyncThunk(
  'admin/fetchBroadcastStats',
  async ({ id, status = '', page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      const res = await adminFetch(`/admin/broadcasts/${id}/delivery?${params}`, {
      });
      if (!res.ok) throw new Error('Failed to fetch broadcast delivery stats');
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const fetchBroadcastOverview = createAsyncThunk(
  'admin/fetchBroadcastOverview',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminFetch('/admin/broadcasts/stats', {
      });
      if (!res.ok) throw new Error('Failed to fetch broadcast overview');
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const previewBroadcast = createAsyncThunk(
  'admin/previewBroadcast',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await adminFetch('/admin/broadcasts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to render preview'); }
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

// ─── Notification Templates ───────────────────────────────────────────────────
export const fetchNotificationTemplates = createAsyncThunk(
  'admin/fetchNotificationTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminFetch('/admin/notification-templates', {
      });
      if (!res.ok) throw new Error('Failed to fetch notification templates');
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const createNotificationTemplate = createAsyncThunk(
  'admin/createNotificationTemplate',
  async (data, { rejectWithValue }) => {
    try {
      const res = await adminFetch('/admin/notification-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to create template'); }
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const updateNotificationTemplate = createAsyncThunk(
  'admin/updateNotificationTemplate',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await adminFetch(`/admin/notification-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to update template'); }
      return await res.json();
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const deleteNotificationTemplate = createAsyncThunk(
  'admin/deleteNotificationTemplate',
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminFetch(`/admin/notification-templates/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete notification template');
      return { id };
    } catch (error) { return rejectWithValue(error.message); }
  }
);

export const fetchNotificationTemplateVariables = createAsyncThunk(
  'admin/fetchNotificationTemplateVariables',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminFetch('/admin/notification-templates/variables', {});
      if (!res.ok) throw new Error('Failed to fetch available variables');
      const data = await res.json();
      return data.variables || [];
    } catch (error) { return rejectWithValue(error.message); }
  }
);