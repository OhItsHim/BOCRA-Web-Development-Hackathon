import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminSidebar } from './Dashboard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { motion } from 'framer-motion'
import client from '../../api/client'

const ROLE_COLORS: Record<string, string> = { ADMIN: '#B71C1C', STAFF: '#1565C0', LICENSEE: '#2E7D32', PUBLIC: 'var(--text-muted)' }

export default function AdminUsers() {
  const { addToast } = useToast()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', role: 'PUBLIC',
    organization: '', is_verified: false,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => client.get('/admin/users').then(r => r.data),
  })

  const raw = data?.users || data?.items || data?.data || data
  const usersArray = Array.isArray(raw) ? raw : []
  const users = usersArray.filter((u: any) =>
    (roleFilter === 'ALL' || u.role === roleFilter) &&
    (search === '' || `${u.first_name || ''} ${u.last_name || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase()))
  )

  const createMutation = useMutation({
    mutationFn: (d: any) => client.post('/admin/users', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setShowForm(false)
      addToast('User created successfully.', 'success')
    },
    onError: () => addToast('Failed to create user.', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: any }) => client.put(`/admin/users/${id}`, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setShowForm(false)
      addToast('User updated successfully.', 'success')
    },
    onError: () => addToast('Failed to update user.', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      addToast('User deleted.', 'success')
    },
    onError: () => addToast('Failed to delete user.', 'error'),
  })

  const openCreate = () => {
    setSelected(null)
    setForm({ first_name: '', last_name: '', email: '', password: '', role: 'PUBLIC', organization: '', is_verified: false })
    setShowForm(true)
  }

  const openEdit = (u: any) => {
    setSelected(u)
    setForm({
      first_name: u.first_name || '', last_name: u.last_name || '',
      email: u.email || '', password: '', role: u.role || 'PUBLIC',
      organization: u.organization || '', is_verified: !!u.is_verified,
    })
    setShowForm(true)
  }

  const handleSubmit = () => {
    const payload = { ...form }
    if (!payload.password) {
      delete (payload as Partial<typeof payload>).password
    }

    if (selected) {
      updateMutation.mutate({ id: selected.id, d: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const inputStyle = { width: '100%', padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            User Management
          </h1>
          <button onClick={openCreate} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#F9A825', color: '#000', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
            + Add User
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input type="search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', maxWidth: 280, width: '100%' }}
            aria-label="Search users" />
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
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
                  {['Name', 'Email', 'Role', 'Organisation', 'Verified', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
                ) : users.map((u: any) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: `${ROLE_COLORS[u.role] || '#888'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: ROLE_COLORS[u.role] || '#888', flexShrink: 0 }}>
                          {u.first_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{u.first_name} {u.last_name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: `${ROLE_COLORS[u.role] || '#888'}20`, color: ROLE_COLORS[u.role] || '#888' }}>
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
                      {new Date(u.created_at || Date.now()).toLocaleDateString('en-BW')}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEdit(u)} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(79,195,247,0.1)', color: 'var(--color-accent)', border: '1px solid rgba(79,195,247,0.2)', cursor: 'pointer' }}>
                          Edit
                        </button>
                        <button onClick={() => { if (confirm('Delete this user?')) deleteMutation.mutate(u.id) }} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(183,28,28,0.1)', color: '#ef9a9a', border: '1px solid rgba(183,28,28,0.2)', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }} role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '2rem', maxWidth: 560, width: '100%' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>{selected ? 'Edit User' : 'Add User'}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="u-first" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>First Name</label>
                  <input id="u-first" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="u-last" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Last Name</label>
                  <input id="u-last" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="u-email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</label>
                  <input id="u-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="u-pwd" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Password {selected && '(leave blank to keep)'}</label>
                  <input id="u-pwd" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="u-role" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Role</label>
                  <select id="u-role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={inputStyle}>
                    {['ADMIN', 'STAFF', 'LICENSEE', 'PUBLIC'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="u-org" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Organisation (optional)</label>
                  <input id="u-org" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={form.is_verified} onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))} />
                    Verified Account
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#F9A825', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                  {selected ? 'Update User' : 'Create User'}
                </button>
                <button onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
