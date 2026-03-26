import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { publicationsApi } from '../../api/endpoints/publications'
import { AdminSidebar } from './Dashboard'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { motion } from 'framer-motion'

const PUB_TYPES = ['ANNUAL_REPORT', 'PRESS_RELEASE', 'GUIDELINE', 'TARIFF', 'REGULATORY_NOTICE', 'CONSULTATION']

export default function AdminPublications() {
  const { addToast } = useToast()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'PRESS_RELEASE', sector: 'TELECOM', description: '', file_url: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-publications'],
    queryFn: () => publicationsApi.list().then(r => r.data),
  })

  const pubs = data?.publications || data || []

  const createMutation = useMutation({
    mutationFn: (d: typeof form) => publicationsApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-publications'] })
      setShowCreate(false)
      setForm({ title: '', type: 'PRESS_RELEASE', sector: 'TELECOM', description: '', file_url: '' })
      addToast('Publication created.', 'success')
    },
    onError: () => addToast('Failed to create publication.', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => publicationsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-publications'] }); addToast('Publication deleted.', 'success') },
  })

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.875rem', borderRadius: '8px',
    border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Publications</h1>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-telecoms)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>+ New Publication</button>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Publications table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}>
                  {['Title', 'Type', 'Sector', 'Downloads', 'Published', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pubs.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No publications yet.</td></tr>
                ) : pubs.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', maxWidth: 280 }}>{p.title}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.type?.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>{p.sector && <SectorBadge sector={p.sector} />}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{(p.downloads || 0).toLocaleString()}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.published_at ? new Date(p.published_at).toLocaleDateString('en-BW') : 'Unpublished'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button onClick={() => { if (confirm('Delete this publication?')) deleteMutation.mutate(p.id) }}
                        style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(183,28,28,0.1)', color: '#ef9a9a', border: '1px solid rgba(183,28,28,0.2)', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showCreate && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '2rem', maxWidth: 520, width: '100%' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>New Publication</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="p-title" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Title</label>
                  <input id="p-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label htmlFor="p-type" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Type</label>
                    <select id="p-type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                      {PUB_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="p-sector" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sector</label>
                    <select id="p-sector" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={inputStyle}>
                      {['TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="p-url" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>File URL (optional)</label>
                  <input id="p-url" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="p-desc" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Description (optional)</label>
                  <textarea id="p-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-telecoms)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
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
