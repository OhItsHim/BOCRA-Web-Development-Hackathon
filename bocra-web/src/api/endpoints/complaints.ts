import client from '../client'

export const complaintsApi = {
  create: (data: Record<string, unknown>) => client.post('/complaints', data),
  list: (params?: Record<string, unknown>) => client.get('/complaints', { params }),
  get: (id: string) => client.get(`/complaints/${id}`),
  track: (ticket: string, email: string) => client.get('/complaints/track', { params: { ticket, email } }),
  updateStatus: (id: string, data: { status: string; resolution?: string }) =>
    client.patch(`/complaints/${id}/status`, data),
  assign: (id: string, assigned_to: string) =>
    client.patch(`/complaints/${id}/assign`, { assigned_to }),
}
