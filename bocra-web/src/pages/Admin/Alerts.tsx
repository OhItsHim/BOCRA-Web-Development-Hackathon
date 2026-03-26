import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../api/endpoints/admin'
import { AdminSidebar } from './Dashboard'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { motion } from 'framer-motion'

const ALERT_TYPE_COLORS: Record<string, string> = { INFO: '#4FC3F7', WARNING: '#F9A825', ERROR: '#B71C1C', SUCCESS: '#2E7D32' }

export default function AdminAlerts() {
  const { addToast } = useToast()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', type: 'INFO', sector: '', expires_at: '', is_active: true })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => adminApi.getAlerts().then(r => r.data),
  })

  const alerts = data?.alerts || data || []

  const createMutation = useMutation({
    mutationFn: (d: typeof form) => adminApi.createAlert(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-alerts'] })
      setShowCreate(false)
      setForm({ title: '', message: '', type: 'INFO', sector: '', expires_at: '', is_active: true })
      addToast('Alert created.', 'success')
    },
    onError: () => addToast('Failed to create alert.', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAlert(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-alerts'] }); addToast('Alert deactivated.', 'success') },
  })

  const inputStyle = { width: '100%', padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>System Alerts</h1>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#F9A825', color: '#000', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>+ New Alert</button>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No active alerts.</p>
            ) : alerts.map((a: any) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)', padding: '1.25rem',
                  borderLeft: `4px solid ${ALERT_TYPE_COLORS[a.type] || 'var(--color-accent)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
                }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: `${ALERT_TYPE_COLORS[a.type] || 'var(--color-accent)'}20`, color: ALERT_TYPE_COLORS[a.type] || 'var(--color-accent)' }}>
                      {a.type}
                    </span>
                    {a.sector && <SectorBadge sector={a.sector} />}
                    {!a.is_active && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>INACTIVE</span>}
                  </div>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{a.title}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.message}</p>
                  {a.expires_at && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Expires: {new Date(a.expires_at).toLocaleDateString('en-BW')}
                    </p>
                  )}
                </div>
                <button onClick={() => { if (confirm('Delete this alert?')) deleteMutation.mutate(a.id) }}
                  style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(183,28,28,0.1)', color: '#ef9a9a', border: '1px solid rgba(183,28,28,0.2)', cursor: 'pointer', flexShrink: 0 }}>
                  Delete
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {showCreate && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '2rem', maxWidth: 520, width: '100%' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>New Alert</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="a-title" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Title</label>
                  <input id="a-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="a-msg" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Message</label>
                  <textarea id="a-msg" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label htmlFor="a-type" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Type</label>
                    <select id="a-type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                      {['INFO', 'WARNING', 'ERROR', 'SUCCESS'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="a-sector" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sector (optional)</label>
                    <select id="a-sector" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={inputStyle}>
                      <option value="">All Sectors</option>
                      {['TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="a-expires" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Expires At (optional)</label>
                  <input id="a-expires" type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#F9A825', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                  {createMutation.isPending ? 'Creating...' : 'Create Alert'}
                </button>
                <button onClick={() => setShowCreate(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
