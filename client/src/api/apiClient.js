// API client for Rent Easy — front-end uses backend REST API
// Uses the Django REST endpoints under `/api/`

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function buildUrl(path, params) {
  const baseUrl = API_BASE;
  const fullPath = `/api${path}`;
  const url = baseUrl.endsWith('/') 
    ? `${baseUrl}${fullPath.slice(1)}` 
    : `${baseUrl}${fullPath}`;
  
  console.log('Building URL:', { path, fullPath, baseUrl, finalUrl: url });
  
  if (params) {
    const urlObj = new URL(url);
    Object.keys(params).forEach(k => {
      const v = params[k];
      if (v !== undefined && v !== null) urlObj.searchParams.append(k, v);
    });
    return urlObj.toString();
  }
  return url;
}

async function apiFetch(path, { method = 'GET', body = null, params = null } = {}) {
  const url = buildUrl(path, params);
  const opts = { method, headers: {} };

  // Attach Authorization header if present
  try {
    const raw = localStorage.getItem('authTokens');
    if (raw) {
      const tokens = JSON.parse(raw);
      if (tokens && tokens.access) {
        opts.headers['Authorization'] = `Bearer ${tokens.access}`;
      }
    }
  } catch (e) {
    // ignore
  }

  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  let res = await fetch(url, opts);

  // If unauthorized, attempt to refresh token and retry once
  if (res.status === 401) {
    try {
      const refreshed = await api.auth.refresh();
      if (refreshed && (refreshed.access || refreshed.token)) {
        // attach new token and retry
        try {
          const raw2 = localStorage.getItem('authTokens');
          if (raw2) {
            const tokens2 = JSON.parse(raw2);
            if (tokens2 && tokens2.access) {
              opts.headers['Authorization'] = `Bearer ${tokens2.access}`;
            }
          }
        } catch (e) {}
        res = await fetch(url, opts);
      }
    } catch (e) {
      // ignore refresh errors
    }
  }

  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) {
    const message = (data && (data.detail || data.error)) || res.statusText;
    throw new Error(message);
  }
  return data;
}

function isoToDateStr(d) {
  if (!d) return null;
  return (new Date(d)).toISOString();
}

export const api = {
  auth: {
    me: async () => {
      try {
        const u = await apiFetch('/auth/me/');
        return { id: u.email || null, email: u.email, full_name: u.full_name || (u.get_full_name ? u.get_full_name : null), role: u.is_staff ? 'admin' : 'tenant' };
      } catch (err) {
        // gracefully fallback to anonymous
        return { id: null, email: null, full_name: null, role: null };
      }
    },
    login: async ({ email, password }) => {
      // Use the JWT token endpoint with email-based authentication
      const data = await apiFetch('/auth/token/', {
        method: 'POST',
        body: {
          username: email,
          email: email,
          password,
        },
      });
      // backend returns access/refresh tokens
      if (data && data.access) {
        localStorage.setItem('authTokens', JSON.stringify({ access: data.access, refresh: data.refresh }));
      }
      return data;
    },

    refresh: async () => {
      try {
        const raw = localStorage.getItem('authTokens');
        if (!raw) return null;
        const tokens = JSON.parse(raw);
        if (!tokens.refresh) return null;
        const data = await apiFetch('/auth/token/refresh/', { method: 'POST', body: { refresh: tokens.refresh } });
        if (data && data.access) {
          localStorage.setItem('authTokens', JSON.stringify({ access: data.access, refresh: data.refresh || tokens.refresh }));
        }
        return data;
      } catch (e) {
        return null;
      }
    },
    logout: () => {
      localStorage.removeItem('authTokens');
    }
  },

  entities: {
    Property: {
      filter: async (filters = {}) => {
        const res = await apiFetch('/properties/', { params: filters });
        return res || [];
      },
      create: async (data) => {
        return await apiFetch('/properties/', { method: 'POST', body: data });
      },
      update: async (id, data) => {
        return await apiFetch(`/properties/${id}/`, { method: 'PUT', body: data });
      },
      delete: async (id) => {
        return await apiFetch(`/properties/${id}/`, { method: 'DELETE' });
      },
      getStats: async (ownerId) => {
        const props = await apiFetch('/properties/', { params: ownerId ? { owner_id: ownerId } : {} });
        const list = props || [];
        const total = list.length;
        const available = list.filter(p => p.available === true).length;
        const occupied = list.filter(p => p.available === false).length;
        const potential_revenue = list.reduce((s, p) => s + (Number(p.price || p.monthly_rent || 0)), 0);
        return { total, occupied, available, potential_revenue };
      },
      getTopPerformers: async (ownerId, limit = 5) => {
        // Aggregate payments per property and sort
        const payments = await apiFetch('/payments/', { params: ownerId ? { owner_id: ownerId } : {} });
        const revenueByProperty = (payments || []).reduce((acc, p) => {
          const id = p.property || p.property_id || p.property_id === 0 ? (p.property || p.property_id) : null;
          if (!id) return acc;
          acc[id] = (acc[id] || 0) + Number(p.amount || 0);
          return acc;
        }, {});
        const props = await apiFetch('/properties/', { params: ownerId ? { owner_id: ownerId } : {} });
        const list = (props || []).map(prop => ({ ...prop, total_revenue: revenueByProperty[prop.id] || 0 })).sort((a,b)=>b.total_revenue - a.total_revenue);
        return list.slice(0, limit);
      }
    },

    Tenant: {
      filter: async (filters = {}) => {
        const res = await apiFetch('/tenants/', { params: filters });
        return res || [];
      },
      create: async (data) => {
        return await apiFetch('/tenants/', { method: 'POST', body: data });
      },
      update: async (id, data) => {
        return await apiFetch(`/tenants/${id}/`, { method: 'PUT', body: data });
      },
      delete: async (id) => {
        return await apiFetch(`/tenants/${id}/`, { method: 'DELETE' });
      }
    },

    Payment: {
      filter: async (filters = {}) => {
        const res = await apiFetch('/payments/', { params: filters });
        return res || [];
      },
      create: async (data) => {
        return await apiFetch('/payments/', { method: 'POST', body: data });
      },
      update: async (id, data) => {
        return await apiFetch(`/payments/${id}/`, { method: 'PUT', body: data });
      },
      delete: async (id) => {
        return await apiFetch(`/payments/${id}/`, { method: 'DELETE' });
      },
      getRevenueStats: async (ownerId, startDate, endDate) => {
        const all = await apiFetch('/payments/', { params: ownerId ? { owner_id: ownerId } : {} });
        const filtered = (all || []).filter(p => {
          const d = p.payment_date || p.due_date || p.created_at;
          if (!d) return false;
          const t = new Date(d);
          if (startDate && t < new Date(startDate)) return false;
          if (endDate && t > new Date(endDate)) return false;
          return true;
        });
        const total = filtered.reduce((s, p) => s + Number(p.amount || 0), 0);
        const count = filtered.length;
        return { total, count };
      },
      getMonthlyRevenue: async (ownerId, months = 12) => {
        const all = await apiFetch('/payments/', { params: ownerId ? { owner_id: ownerId } : {} });
        const now = new Date();
        const monthsArr = Array.from({ length: months }).map((_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
          return { label: d.toISOString().slice(0,7), total: 0 };
        });
        (all || []).forEach(p => {
          const d = p.payment_date || p.due_date || p.created_at;
          if (!d) return;
          const key = (new Date(d)).toISOString().slice(0,7);
          const slot = monthsArr.find(m => m.label === key);
          if (slot) slot.total += Number(p.amount || 0);
        });
        return monthsArr;
      },
      getPaymentMethodsBreakdown: async (ownerId) => {
        const all = await apiFetch('/payments/', { params: ownerId ? { owner_id: ownerId } : {} });
        const breakdown = (all || []).reduce((acc, p) => {
          const k = p.payment_type || 'unknown';
          acc[k] = (acc[k] || 0) + Number(p.amount || 0);
          return acc;
        }, {});
        return breakdown;
      },
      getUpcomingPayments: async (ownerId, limit = 10) => {
        const all = await apiFetch('/payments/', { params: ownerId ? { owner_id: ownerId } : {} });
        const dateField = (p) => p.due_date || p.payment_date;
        const upcoming = (all || []).filter(p => dateField(p) && p.status !== 'paid').sort((a, b) => new Date(dateField(a)) - new Date(dateField(b))).slice(0, limit);
        return upcoming;
      }
    },

    MaintenanceRequest: {
      filter: async (filters = {}) => {
        const res = await apiFetch('/maintenance/', { params: filters });
        return res || [];
      },
      create: async (data) => {
        return await apiFetch('/maintenance/', { method: 'POST', body: data });
      },
      update: async (id, data) => {
        return await apiFetch(`/maintenance/${id}/`, { method: 'PUT', body: data });
      },
      delete: async (id) => {
        return await apiFetch(`/maintenance/${id}/`, { method: 'DELETE' });
      }
    },
    Announcement: {
      list: async () => [],
      filter: async () => [],
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => {}
    },
    Message: {
      filter: async () => [],
      create: async () => ({}),
      update: async () => ({})
    },
    Document: {
      filter: async () => [],
      create: async () => ({}),
      delete: async () => {}
    }
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        // Implement backend upload endpoint later; keep placeholder now
        const mockUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`;
        return { file_url: mockUrl };
      }
    }
  },

  agents: {
    subscribeToConversation: (id, cb) => {
      // Mock subscription - implement real-time features later
      return () => {};
    },
    listConversations: async () => [],
    createConversation: async (payload) => ({ id: 'stub', ...payload }),
    getConversation: async (id) => ({ id, messages: [] }),
    addMessage: async (conv, message) => ({ success: true })
  }
};

// Deprecated compatibility layer (so old imports don't break immediately)
export const base44 = api;
