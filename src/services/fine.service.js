import api from './api'

export const fineService = {
  getFines: (params) => api.get('/fines', { params }),
  getMyFines: (params) => api.get('/fines/mine', { params }),
  getFine: (id) => api.get(`/fines/${id}`),
  payFine: (id) => api.post(`/fines/${id}/pay`),
}

export default fineService
