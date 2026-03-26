import client from '../client'

export const publicationsApi = {
  list: (params?: Record<string, unknown>) => client.get('/publications', { params }),
  get: (id: string) => client.get(`/publications/${id}`),
  create: (data: Record<string, unknown>) => client.post('/publications', data),
  update: (id: string, data: Record<string, unknown>) => client.patch(`/publications/${id}`, data),
  delete: (id: string) => client.delete(`/publications/${id}`),
}
