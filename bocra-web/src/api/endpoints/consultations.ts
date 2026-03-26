import client from '../client'

export const consultationsApi = {
  list: () => client.get('/consultations'),
  get: (id: string) => client.get(`/consultations/${id}`),
  submit: (id: string, data: Record<string, unknown>) =>
    client.post(`/consultations/${id}/submit`, data),
  create: (data: Record<string, unknown>) => client.post('/consultations', data),
  update: (id: string, data: Record<string, unknown>) => client.patch(`/consultations/${id}`, data),
}
