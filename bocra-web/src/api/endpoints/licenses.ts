import client from '../client'

export const licensesApi = {
  getTypes: () => client.get('/licenses/types'),
  createApplication: (data: Record<string, unknown>) => client.post('/licenses/applications', data),
  listApplications: (params?: Record<string, unknown>) => client.get('/licenses/applications', { params }),
  getApplication: (id: string) => client.get(`/licenses/applications/${id}`),
  updateApplicationStatus: (id: string, data: { status: string; notes?: string }) =>
    client.patch(`/licenses/applications/${id}/status`, data),
  trackApplication: (ref: string, email: string) =>
    client.get('/licenses/track', { params: { ref, email } }),
  listLicensees: (params?: Record<string, unknown>) => client.get('/licenses/licensees', { params }),
  createLicensee: (data: Record<string, unknown>) => client.post('/licenses/licensees', data),
  updateLicensee: (id: string, data: Record<string, unknown>) =>
    client.patch(`/licenses/licensees/${id}`, data),
  myApplications: () => client.get('/licenses/applications', { params: { my: true } }),
}
