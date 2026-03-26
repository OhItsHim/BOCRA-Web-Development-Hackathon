import client from '../client'

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
  organization?: string
}

export interface LoginData {
  email: string
  password: string
}

export const authApi = {
  register: (data: RegisterData) => client.post('/auth/register', data),
  login: (data: LoginData) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  refresh: () => client.post('/auth/refresh'),
  me: () => client.get('/auth/me'),
}
