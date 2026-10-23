import api from './api'

export const borrowingService = {
  getBorrowings: (params) => api.get('/borrowings', { params }),
  getBorrowing: (id) => api.get(`/borrowings/${id}`),
  borrow: (collectionId, userId = null) => api.post('/borrowings', { collection_id: collectionId, user_id: userId }),
  returnItem: (id) => api.post(`/borrowings/${id}/return`),
}

export default borrowingService
