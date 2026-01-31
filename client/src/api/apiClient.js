// PostgreSQL API Client for Rent Easy
import db from '../lib/database.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Payment from '../models/Payment.js';

// Test database connection on import
db.testConnection();

export const api = {
  auth: {
    me: async () => {
      // For now, return a mock user
      // In production, this would use JWT or session auth
      return {
        id: 'mock-user-id',
        email: 'demo@renteasy.co.ke',
        full_name: 'Demo User',
        role: 'landlord'
      };
    },
    login: async (credentials) => {
      // Implement actual login logic here
      const user = await User.findByEmail(credentials.email);
      if (user && user.password_hash === credentials.password) {
        return user;
      }
      throw new Error('Invalid credentials');
    }
  },

  entities: {
    Property: {
      filter: async (filters) => {
        if (filters.owner_id) {
          return await Property.findByOwner(filters.owner_id);
        }
        return await Property.getAll();
      },
      create: async (data) => {
        return await Property.create(data);
      },
      update: async (id, data) => {
        return await Property.update(id, data);
      },
      delete: async (id) => {
        return await Property.delete(id);
      },
      getStats: async (ownerId) => {
        return await Property.getStats(ownerId);
      },
      getTopPerformers: async (ownerId, limit = 5) => {
        return await Property.getTopPerformers(ownerId, limit);
      }
    },

    Tenant: {
      filter: async (filters) => {
        if (filters.owner_id) {
          return await db('tenants')
            .where({ owner_id: filters.owner_id, ...filters })
            .select('*');
        }
        return await db('tenants').select('*');
      },
      create: async (data) => {
        const [tenant] = await db('tenants').insert(data).returning('*');
        return tenant;
      },
      update: async (id, data) => {
        const [tenant] = await db('tenants').where({ id }).update(data).returning('*');
        return tenant;
      },
      delete: async (id) => {
        return await db('tenants').where({ id }).del();
      }
    },

    Payment: {
      filter: async (filters) => {
        if (filters.owner_id) {
          return await Payment.findByOwner(filters.owner_id);
        }
        return await db('payments').select('*');
      },
      create: async (data) => {
        return await Payment.create(data);
      },
      update: async (id, data) => {
        return await Payment.update(id, data);
      },
      delete: async (id) => {
        return await Payment.delete(id);
      },
      getRevenueStats: async (ownerId, startDate, endDate) => {
        return await Payment.getRevenueStats(ownerId, startDate, endDate);
      },
      getMonthlyRevenue: async (ownerId, months = 12) => {
        return await Payment.getMonthlyRevenue(ownerId, months);
      },
      getPaymentMethodsBreakdown: async (ownerId) => {
        return await Payment.getPaymentMethodsBreakdown(ownerId);
      },
      getUpcomingPayments: async (ownerId, limit = 10) => {
        return await Payment.getUpcomingPayments(ownerId, limit);
      }
    },

    MaintenanceRequest: {
      filter: async (filters) => {
        if (filters.owner_id) {
          return await db('maintenance_requests')
            .where({ owner_id: filters.owner_id, ...filters })
            .select('*');
        }
        return await db('maintenance_requests').select('*');
      },
      create: async (data) => {
        const [request] = await db('maintenance_requests').insert(data).returning('*');
        return request;
      },
      update: async (id, data) => {
        const [request] = await db('maintenance_requests').where({ id }).update(data).returning('*');
        return request;
      },
      delete: async (id) => {
        return await db('maintenance_requests').where({ id }).del();
      }
    }
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        // For now, return a mock file URL
        // In production, implement actual file upload
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
