import { useState, useEffect } from 'react'
import { authApi } from '../api/endpoints/auth'

export interface User {
  id: string
  email: string
  role: string
  first_name: string
  last_name: string
  phone?: string
  organization?: string
  is_verified: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('bocra-access-token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi.me()
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('bocra-access-token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    localStorage.setItem('bocra-access-token', res.data.access_token)
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await authApi.logout()
    localStorage.removeItem('bocra-access-token')
    setUser(null)
  }

  const register = async (data: Parameters<typeof authApi.register>[0]) => {
    const res = await authApi.register(data)
    localStorage.setItem('bocra-access-token', res.data.access_token)
    setUser(res.data.user)
    return res.data
  }

  return { user, loading, login, logout, register, isAdmin: user?.role === 'ADMIN', isStaff: user?.role === 'ADMIN' || user?.role === 'STAFF' }
}
