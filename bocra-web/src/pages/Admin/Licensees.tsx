import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { licensesApi } from '../../api/endpoints/licenses'
import { AdminSidebar } from './Dashboard'
import StatusBadge from '../../components/common/StatusBadge'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { motion } from 'framer-motion'

const SECTORS = ['ALL', 'TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL']

export default function AdminLicensees() {
  const { addToast } = useToast()
  const qc = useQueryClient()
  const [sector, setSector] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    company_name: '', license_number: '', license_type: 'INTERNET_ISP',
    sector: 'INTERNET', status: 'ACTIVE', contact_email: '', website: '', description: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-licensees', sector],
    queryFn: () => licensesApi.listLicensees(sector !== 'ALL' ? { sector } : {}).then(r => r.data),
  })

  const licensees = (data?.licensees || data || []).filter((l: any) =>
    search === '' || l.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.license_number?.toLowerCase().includes(search.toLowerCase())
  )

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => licensesApi.createLicensee(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-licensees'] })
      setShowCreate(false)
      addToast('Licensee created successfully.', 'success')
    },
    onError: () => addToast('Failed to create licensee.', 'error'),
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
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Licensees
          </h1>
          <button onClick={() => setShowCreate(true)} style={{
            padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
            backgroundColor: 'var(--color-internet)', color: '#fff',
            fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
          }}>+ Add Licensee</button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input type="search" placeholder="Search licensees..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, maxWidth: 320 }} aria-label="Search licensees" />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {SECTORS.map(s => (
              <button key={s} onClick={() => setSector(s)} style={{
                padding: '0.4rem 0.875rem', borderRadius: '20px', border: '1px solid',
                borderColor: sector === s ? 'var(--color-accent)' : 'var(--border-default)',
                backgroundColor: sector === s ? 'rgba(79,195,247,0.12)' : 'var(--bg-surface)',
                color: sector === s ? 'var(--color-accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
              }}>{s === 'ALL' ? 'All Sectors' : s}</button>
            ))}
          </div>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Licensees table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}>
                  {['Company', 'Licence No.', 'Sector', 'Status', 'Expiry', 'Contact'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {licensees.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No licensees found.</td></tr>
                ) : licensees.map((l: any) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{l.company_name}</p>
                      {l.website && <a href={l.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'var(--color-accent)' }}>{l.website}</a>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{l.license_number}</td>
                    <td style={{ padding: '0.875rem 1rem' }}><SectorBadge sector={l.sector} /></td>
                    <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={l.status} /></td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.78rem', color: l.license_end_date && new Date(l.license_end_date) < new Date() ? '#ef5350' : 'var(--text-muted)' }}>
                      {l.license_end_date ? new Date(l.license_end_date).toLocaleDateString('en-BW') : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{l.contact_email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showCreate && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }} role="dialog" aria-modal="true" aria-label="Create licensee">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '2rem', maxWidth: 560, width: '100%' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Add Licensee</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
                {[['company_name', 'Company Name'], ['license_number', 'Licence Number'], ['contact_email', 'Contact Email'], ['website', 'Website (optional)']].map(([k, l]) => (
                  <div key={k}>
                    <label htmlFor={k} style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{l}</label>
                    <input id={k} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label htmlFor="sector-select" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sector</label>
                  <select id="sector-select" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={{ ...inputStyle }}>
                    {['TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="status-select" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</label>
                  <select id="status-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...inputStyle }}>
                    {['ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="description" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Description (optional)</label>
                <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-internet)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: createMutation.isPending ? 'not-allowed' : 'pointer', opacity: createMutation.isPending ? 0.7 : 1 }}>
                  {createMutation.isPending ? 'Creating...' : 'Create Licensee'}
                </button>
                <button onClick={() => setShowCreate(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
