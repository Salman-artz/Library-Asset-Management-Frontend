import api from './api'

export const reportService = {
  getPopularCollections: (limit = 10) =>
    api.get('/reports/popular-collections', { params: { limit } }),
  getActiveMembers: (limit = 10) =>
    api.get('/reports/active-members', { params: { limit } }),
  exportCirculation: (params) =>
    api.get('/reports/export', { params }),
  downloadExportBlob: (params) =>
    api.get('/reports/export', { params, responseType: 'blob' }),
}

export default reportService
