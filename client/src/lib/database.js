// Browser-safe stub for database access (temporary)
// NOTE: Real DB access must happen on the backend. This stub prevents Node-only
// libraries like `knex`/`pg` from being bundled into the browser app.

class MockQuery {
  constructor(table) { this.table = table; }
  where() { return this; }
  select() { return Promise.resolve([]); }
  insert() { return Promise.resolve([]); }
  returning() { return this; }
  update() { return Promise.resolve([]); }
  del() { return Promise.resolve(1); }
  first() { return Promise.resolve(null); }
  leftJoin() { return this; }
  groupBy() { return this; }
  orderBy() { return this; }
  limit() { return this; }
  raw() { return Promise.resolve(null); }
}

function db(table) { return new MockQuery(table); }

export const testConnection = async () => {
  console.info('⚠️ testConnection called in browser stub (no real DB)');
  return true;
};

db.testConnection = testConnection;

export default db;

