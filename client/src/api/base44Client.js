export const base44 = {
  auth: {
    me: async () => ({ email: 'dev@example.com', full_name: 'Dev User' })
  },
  entities: {
    Property: {
      filter: async () => []
    },
    Tenant: {
      filter: async () => []
    },
    Payment: {
      filter: async () => [],
      update: async () => {},
    },
    MaintenanceRequest: {
      filter: async () => []
    }
  }
};
