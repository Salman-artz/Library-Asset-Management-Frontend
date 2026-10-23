import api from './api'

export const collectionService = {
  getCollections: (params) => api.get('/collections', { params }),
  getCollection: (id) => api.get(`/collections/${id}`),
  createCollection: (formData) => api.post('/collections', formData),
  updateCollection: (id, formData) => api.post(`/collections/${id}`, formData),
  deleteCollection: (id) => api.delete(`/collections/${id}`),
}

export default collectionService
