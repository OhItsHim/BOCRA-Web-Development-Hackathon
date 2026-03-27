import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { licensesApi } from '../../api/endpoints/licenses'
import { AdminSidebar } from './Dashboard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'

const STATUS_OPTIONS = ['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED']
const LICENSE_TYPE_LABELS: Record<string, string> = {
  TELECOM_CLASS: 'Telecom Class', TELECOM_INDIVIDUAL: 'Telecom Individual', TELECOM_NETWORK: 'Telecom Network',
  BROADCAST_FTA_TV: 'FTA TV', BROADCAST_PAY_TV: 'Pay TV', BROADCAST_COMMUNITY_RADIO: 'Community Radio',
  BROADCAST_COMMERCIAL_RADIO: 'Commercial Radio', BROADCAST_ONLINE: 'Online Broadcasting',
  POSTAL_COURIER: 'Postal Courier', POSTAL_EXPRESS: 'Postal Express',
  INTERNET_ISP: 'ISP', INTERNET_VSAT: 'VSAT', SPECTRUM_FREQUENCY: 'Spectrum',
}

export default function AdminApplications() {
  const { addToast } = useToast()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<any | null>(null)
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', filter],
    queryFn: () => licensesApi.listApplications(filter !== 'ALL' ? { status: filter } : {}).then(r => r.data),
  })

  const raw = data?.applications || data?.items || data?.data || data
  const apps = Array.isArray(raw) ? raw : []

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      licensesApi.updateApplicationStatus(id, { status, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] })
      setSelected(null)
      addToast('Application status updated.', 'success')
    },
    onError: () => addToast('Failed to update status.', 'error'),
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Licence Applications
        </h1>

        {/* Status filter */}
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
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>
            {apps.length} result{apps.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Licence applications table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}>
                  {['Business', 'Type', 'Contact', 'Status', 'Submitted', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No applications found.</td></tr>
                ) : apps.map((app: any) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{app.business_name}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{app.registration_number}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {LICENSE_TYPE_LABELS[app.license_type] || app.license_type?.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.contact_email}</td>
                    <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={app.status} /></td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(app.submitted_at || app.created_at).toLocaleDateString('en-BW')}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button onClick={() => { setSelected(app); setNotes(app.notes || '') }} style={{
                        padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: 'rgba(79,195,247,0.1)', color: 'var(--color-accent)',
                        border: '1px solid rgba(79,195,247,0.2)', cursor: 'pointer',
                      }}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Review modal */}
        {selected && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
          }} role="dialog" aria-modal="true" aria-label="Review application">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                backgroundColor: 'var(--bg-surface)', borderRadius: '16px',
                border: '1px solid var(--border-default)', padding: '2rem',
                maxWidth: 520, width: '100%',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Review: {selected.business_name}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                {[
                  ['Type', LICENSE_TYPE_LABELS[selected.license_type] || selected.license_type],
                  ['Status', selected.status],
                  ['Email', selected.contact_email],
                  ['Phone', selected.contact_phone || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ backgroundColor: 'var(--bg-elevated)', padding: '0.625rem', borderRadius: '6px' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{k}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="review-notes" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Notes (optional)
                </label>
                <textarea id="review-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['APPROVED', 'REJECTED', 'UNDER_REVIEW', 'SUSPENDED'].map(s => (
                  <button key={s} onClick={() => mutation.mutate({ id: selected.id, status: s })}
                    disabled={mutation.isPending}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                      border: 'none', cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                      backgroundColor: s === 'APPROVED' ? '#2E7D32' : s === 'REJECTED' ? '#B71C1C' : s === 'SUSPENDED' ? '#FF7043' : '#1565C0',
                      color: '#fff', opacity: mutation.isPending ? 0.7 : 1,
                    }}>
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
                <button onClick={() => setSelected(null)} style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                  backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', marginLeft: 'auto',
                }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
