import db from '../lib/database.js';

class User {
  static async create(userData) {
    const [user] = await db('users').insert(userData).returning('*');
    return user;
  }

  static async findByEmail(email) {
    const [user] = await db('users').where({ email }).first();
    return user;
  }

  static async findById(id) {
    const [user] = await db('users').where({ id }).first();
    return user;
  }

  static async update(id, userData) {
    const [user] = await db('users').where({ id }).update(userData).returning('*');
    return user;
  }

  static async delete(id) {
    return await db('users').where({ id }).del();
  }

  static async getAll() {
    return await db('users').select('*');
  }
}

export default User;
