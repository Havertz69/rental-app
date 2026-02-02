import { api } from '../api/apiClient.js';

class Payment {
  static async create(data) {
    return api.entities.Payment.create(data);
  }

  static async findByOwner(ownerId) {
    return api.entities.Payment.filter({ owner_id: ownerId });
  }

  static async findById(id) {
    const list = await api.entities.Payment.filter({ id });
    return list && list.length ? list[0] : null;
  }

  static async update(id, data) {
    return api.entities.Payment.update(id, data);
  }

  static async delete(id) {
    return api.entities.Payment.delete(id);
  }

  static async getRevenueStats(ownerId, startDate, endDate) {
    return api.entities.Payment.getRevenueStats(ownerId, startDate, endDate);
  }

  static async getMonthlyRevenue(ownerId, months = 12) {
    return api.entities.Payment.getMonthlyRevenue(ownerId, months);
  }

  static async getPaymentMethodsBreakdown(ownerId) {
    return api.entities.Payment.getPaymentMethodsBreakdown(ownerId);
  }

  static async getUpcomingPayments(ownerId, limit = 10) {
    return api.entities.Payment.getUpcomingPayments(ownerId, limit);
  }
}

export default Payment;
