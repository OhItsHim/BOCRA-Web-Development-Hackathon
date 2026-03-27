import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { complaintsApi } from '../../api/endpoints/complaints'
import { AdminSidebar } from './Dashboard'
import StatusBadge from '../../components/common/StatusBadge'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { motion } from 'framer-motion'

const STATUS_OPTIONS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED']
const PRIORITY_COLORS: Record<string, string> = { LOW: '#2E7D32', MEDIUM: '#F9A825', HIGH: '#FF7043', URGENT: '#B71C1C' }

export default function AdminComplaints() {
  const { addToast } = useToast()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<any | null>(null)
  const [resolution, setResolution] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-complaints', filter],
    queryFn: () => complaintsApi.list(filter !== 'ALL' ? { status: filter } : {}).then(r => r.data),
  })

  const raw = data?.complaints || data?.items || data?.data || data
  const complaints = Array.isArray(raw) ? raw : []

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      complaintsApi.updateStatus(id, { status, resolution }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-complaints'] })
      setSelected(null)
      addToast('Complaint status updated.', 'success')
    },
    onError: () => addToast('Failed to update complaint.', 'error'),
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Complaints Management
        </h1>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid',
              borderColor: filter === s ? 'var(--color-accent)' : 'var(--border-default)',
              backgroundColor: filter === s ? 'rgba(79,195,247,0.12)' : 'var(--bg-surface)',
              color: filter === s ? 'var(--color-accent)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s',
            }}>
              {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Complaints table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}>
                  {['Ticket', 'Category / Sector', 'Priority', 'Status', 'Submitted', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No complaints found.</td></tr>
                ) : complaints.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 700 }}>{c.ticket_number}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.category?.replace(/_/g, ' ')}</p>
                      <div style={{ marginTop: '0.25rem' }}><SectorBadge sector={c.sector} /></div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: `${PRIORITY_COLORS[c.priority] || '#888'}20`,
                        color: PRIORITY_COLORS[c.priority] || '#888',
                      }}>{c.priority}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.submitted_at || c.created_at).toLocaleDateString('en-BW')}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button onClick={() => { setSelected(c); setResolution(c.resolution || '') }} style={{
                        padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: 'rgba(79,195,247,0.1)', color: 'var(--color-accent)',
                        border: '1px solid rgba(79,195,247,0.2)', cursor: 'pointer',
                      }}>Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '2rem', maxWidth: 500, width: '100%' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {selected.ticket_number}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>{selected.description}</p>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="resolution" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Resolution Note</label>
                <textarea id="resolution" value={resolution} onChange={e => setResolution(e.target.value)} rows={3}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'].map(s => (
                  <button key={s} onClick={() => statusMutation.mutate({ id: selected.id, status: s })}
                    disabled={statusMutation.isPending}
                    style={{
                      padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      backgroundColor: s === 'RESOLVED' ? '#2E7D32' : s === 'ESCALATED' ? '#FF7043' : s === 'CLOSED' ? 'var(--bg-elevated)' : '#1565C0',
                      color: s === 'CLOSED' ? 'var(--text-secondary)' : '#fff',
                    }}>{s.replace(/_/g, ' ')}</button>
                ))}
                <button onClick={() => setSelected(null)} style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', marginLeft: 'auto' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
