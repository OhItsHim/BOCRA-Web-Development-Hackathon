import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../api/endpoints/admin'
import { AdminSidebar } from './Dashboard'
import StatusBadge from '../../components/common/StatusBadge'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { motion } from 'framer-motion'
import client from '../../api/client'

const ROLE_COLORS: Record<string, string> = { ADMIN: '#B71C1C', STAFF: '#1565C0', LICENSEE: '#2E7D32', PUBLIC: 'var(--text-muted)' }

export default function AdminUsers() {
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => client.get('/admin/users').then(r => r.data),
  })

  const users = (data?.users || data || []).filter((u: any) =>
    (roleFilter === 'ALL' || u.role === roleFilter) &&
    (search === '' || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          User Management
        </h1>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input type="search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', maxWidth: 280, width: '100%' }}
            aria-label="Search users" />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['ALL', 'ADMIN', 'STAFF', 'LICENSEE', 'PUBLIC'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} style={{
                padding: '0.4rem 0.875rem', borderRadius: '20px', border: '1px solid',
                borderColor: roleFilter === r ? 'var(--color-accent)' : 'var(--border-default)',
                backgroundColor: roleFilter === r ? 'rgba(79,195,247,0.12)' : 'var(--bg-surface)',
                color: roleFilter === r ? 'var(--color-accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
              }}>{r === 'ALL' ? 'All Roles' : r}</button>
            ))}
          </div>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Users table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}>
                  {['Name', 'Email', 'Role', 'Organisation', 'Verified', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
                ) : users.map((u: any) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: `${ROLE_COLORS[u.role]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: ROLE_COLORS[u.role], flexShrink: 0 }}>
                          {u.first_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{u.first_name} {u.last_name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: `${ROLE_COLORS[u.role]}20`, color: ROLE_COLORS[u.role] }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.organization || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: u.is_verified ? '#a5d6a7' : 'var(--text-muted)' }}>
                        {u.is_verified ? '✓ Verified' : '○ Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString('en-BW')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
