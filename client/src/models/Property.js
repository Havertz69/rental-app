import db from '../lib/database.js';

class Property {
  static async create(propertyData) {
    const [property] = await db('properties').insert(propertyData).returning('*');
    return property;
  }

  static async findByOwner(ownerId) {
    return await db('properties').where({ owner_id: ownerId }).select('*');
  }

  static async findById(id) {
    const [property] = await db('properties').where({ id }).first();
    return property;
  }

  static async update(id, propertyData) {
    const [property] = await db('properties').where({ id }).update(propertyData).returning('*');
    return property;
  }

  static async delete(id) {
    return await db('properties').where({ id }).del();
  }

  static async getAll() {
    return await db('properties').select('*');
  }

  static async getStats(ownerId) {
    const stats = await db('properties')
      .where({ owner_id: ownerId })
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as occupied', ['occupied']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as available', ['available']),
        db.raw('SUM(monthly_rent) as potential_revenue')
      )
      .first();
    
    return stats;
  }

  static async getTopPerformers(ownerId, limit = 5) {
    return await db('properties')
      .leftJoin('payments', 'properties.id', '=', 'payments.property_id')
      .where({ 'properties.owner_id': ownerId, 'payments.status': 'paid' })
      .select(
        'properties.*',
        db.raw('SUM(payments.amount) as total_revenue'),
        db.raw('COUNT(payments.id) as payment_count')
      )
      .groupBy('properties.id')
      .orderBy('total_revenue', 'desc')
      .limit(limit);
  }
}

export default Property;
