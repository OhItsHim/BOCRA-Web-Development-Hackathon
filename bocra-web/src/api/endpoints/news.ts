import client from '../client'

export const newsApi = {
  list: (params?: Record<string, unknown>) => client.get('/news', { params }),
  get: (slug: string) => client.get(`/news/${slug}`),
  create: (data: Record<string, unknown>) => client.post('/news', data),
  update: (slug: string, data: Record<string, unknown>) => client.patch(`/news/${slug}`, data),
  delete: (slug: string) => client.delete(`/news/${slug}`),
}
