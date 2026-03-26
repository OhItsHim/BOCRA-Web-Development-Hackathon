import client from '../client'

export const adminApi = {
  statsOverview: () => client.get('/admin/stats/overview'),
  statsComplaints: () => client.get('/admin/stats/complaints'),
  statsApplications: () => client.get('/admin/stats/applications'),
  statsPageviews: () => client.get('/admin/stats/pageviews'),
  getAlerts: () => client.get('/alerts/active'),
  createAlert: (data: Record<string, unknown>) => client.post('/alerts', data),
  updateAlert: (id: string, data: Record<string, unknown>) => client.patch(`/alerts/${id}`, data),
  deleteAlert: (id: string) => client.delete(`/alerts/${id}`),
}
