// Minimal user helpers — prefer `api.auth.me()` for current user info

export default class User {
  static async findByEmail(email) {
    try {
      const res = await fetch(`/api/users/?email=${encodeURIComponent(email)}`);
      if (!res.ok) return null;
      const list = await res.json();
      return list && list.length ? list[0] : null;
    } catch (e) {
      return null;
    }
  }

  static async findById(id) {
    try {
      const res = await fetch(`/api/users/${id}/`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  static async create() { throw new Error('User creation should go through backend endpoints'); }
  static async update() { throw new Error('User update should go through backend endpoints'); }
  static async delete() { throw new Error('User deletion should go through backend endpoints'); }
  static async getAll() { throw new Error('Use backend endpoints'); }
} 
