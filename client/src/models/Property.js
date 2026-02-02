import { api } from '../api/apiClient.js';

class Property {
  static async filter(filters) {
    return api.entities.Property.filter(filters);
  }

  static async create(data) {
    return api.entities.Property.create(data);
  }

  static async findByOwner(ownerId) {
    return api.entities.Property.filter({ owner_id: ownerId });
  }

  static async findById(id) {
    const list = await api.entities.Property.filter({ id });
    return list && list.length ? list[0] : null;
  }

  static async update(id, data) {
    return api.entities.Property.update(id, data);
  }

  static async delete(id) {
    return api.entities.Property.delete(id);
  }

  static async getAll() {
    return api.entities.Property.filter({});
  }

  static async getStats(ownerId) {
    return api.entities.Property.getStats(ownerId);
  }

  static async getTopPerformers(ownerId, limit = 5) {
    return api.entities.Property.getTopPerformers(ownerId, limit);
  }
}

export default Property; 
