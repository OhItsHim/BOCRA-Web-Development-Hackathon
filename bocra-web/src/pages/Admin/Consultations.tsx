import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { consultationsApi } from '../../api/endpoints/consultations'
import { AdminSidebar } from './Dashboard'
import StatusBadge from '../../components/common/StatusBadge'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { motion } from 'framer-motion'

export default function AdminConsultations() {
  const { addToast } = useToast()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', sector: 'TELECOM', document_url: '',
    start_date: '', end_date: '', status: 'OPEN',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-consultations'],
    queryFn: () => consultationsApi.list().then(r => r.data),
  })

  const raw = data?.consultations || data?.items || data?.data || data
  const items = Array.isArray(raw) ? raw : []

  const createMutation = useMutation({
    mutationFn: (d: typeof form) => consultationsApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-consultations'] })
      setShowCreate(false)
      setForm({ title: '', description: '', sector: 'TELECOM', document_url: '', start_date: '', end_date: '', status: 'OPEN' })
      addToast('Consultation created.', 'success')
    },
    onError: () => addToast('Failed to create consultation.', 'error'),
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
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Consultations</h1>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-internet)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>+ New Consultation</button>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No consultations yet.</p>
            ) : items.map((c: any) => (
              <div key={c.id} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <StatusBadge status={c.status} />
                    {c.sector && <SectorBadge sector={c.sector} />}
                  </div>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{c.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(c.start_date).toLocaleDateString('en-BW')} → {new Date(c.end_date).toLocaleDateString('en-BW')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }} role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '2rem', maxWidth: 580, width: '100%' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>New Consultation</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="c-title" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Title</label>
                  <input id="c-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="c-desc" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Description</label>
                  <textarea id="c-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label htmlFor="c-start" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Start Date</label>
                    <input id="c-start" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="c-end" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>End Date</label>
                    <input id="c-end" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="c-sector" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sector</label>
                    <select id="c-sector" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={inputStyle}>
                      {['TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="c-docurl" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Document URL (optional)</label>
                    <input id="c-docurl" value={form.document_url} onChange={e => setForm(f => ({ ...f, document_url: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-internet)', color: '#fff', fontWeight: 700, cursor: createMutation.isPending ? 'not-allowed' : 'pointer' }}>
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
