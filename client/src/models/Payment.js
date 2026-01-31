import db from '../lib/database.js';

class Payment {
  static async create(paymentData) {
    const [payment] = await db('payments').insert(paymentData).returning('*');
    return payment;
  }

  static async findByOwner(ownerId) {
    return await db('payments')
      .where({ owner_id: ownerId })
      .select('*')
      .orderBy('due_date', 'desc');
  }

  static async findById(id) {
    const [payment] = await db('payments').where({ id }).first();
    return payment;
  }

  static async update(id, paymentData) {
    const [payment] = await db('payments').where({ id }).update(paymentData).returning('*');
    return payment;
  }

  static async delete(id) {
    return await db('payments').where({ id }).del();
  }

  static async getRevenueStats(ownerId, startDate, endDate) {
    const stats = await db('payments')
      .where({ owner_id: ownerId })
      .where('due_date', '>=', startDate)
      .where('due_date', '<=', endDate)
      .select(
        db.raw('SUM(CASE WHEN status = ? THEN amount ELSE 0 END) as collected', ['paid']),
        db.raw('SUM(CASE WHEN status = ? THEN amount ELSE 0 END) as pending', ['pending']),
        db.raw('SUM(CASE WHEN status = ? THEN amount ELSE 0 END) as overdue', ['late']),
        db.raw('SUM(amount) as total'),
        db.raw('COUNT(*) as total_payments')
      )
      .first();
    
    return stats;
  }

  static async getMonthlyRevenue(ownerId, months = 12) {
    const monthlyData = await db('payments')
      .where({ owner_id: ownerId })
      .where('status', 'paid')
      .select(
        db.raw("TO_CHAR(due_date, 'Mon') as month"),
        db.raw('SUM(amount) as amount')
      )
      .whereRaw('due_date >= CURRENT_DATE - INTERVAL ? months', [months])
      .groupBy(db.raw("TO_CHAR(due_date, 'Mon')"))
      .orderBy(db.raw("TO_CHAR(due_date, 'YYYY-MM')"))
      .orderBy('month');
    
    return monthlyData;
  }

  static async getPaymentMethodsBreakdown(ownerId) {
    const breakdown = await db('payments')
      .where({ owner_id: ownerId, status: 'paid' })
      .select(
        'payment_method',
        db.raw('SUM(amount) as total'),
        db.raw('COUNT(*) as count')
      )
      .groupBy('payment_method')
      .orderBy('total', 'desc');
    
    return breakdown;
  }

  static async getUpcomingPayments(ownerId, limit = 10) {
    return await db('payments')
      .leftJoin('tenants', 'payments.tenant_id', '=', 'tenants.id')
      .leftJoin('properties', 'payments.property_id', '=', 'properties.id')
      .where({ 'payments.owner_id': ownerId })
      .where('payments.status', '!=', 'paid')
      .select(
        'payments.*',
        db.raw("tenants.first_name || ' ' || tenants.last_name as tenant_name"),
        'properties.name as property_name'
      )
      .orderBy('due_date', 'asc')
      .limit(limit);
  }
}

export default Payment;
