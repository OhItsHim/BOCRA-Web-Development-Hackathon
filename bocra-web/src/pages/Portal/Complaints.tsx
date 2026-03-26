import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { complaintsApi } from '../../api/endpoints/complaints'
import StatusBadge from '../../components/common/StatusBadge'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function PortalNav({ active }: { active: string }) {
  const links = [
    { to: '/portal', label: 'Dashboard' },
    { to: '/portal/applications', label: 'Applications' },
    { to: '/portal/complaints', label: 'Complaints' },
    { to: '/portal/profile', label: 'Profile' },
  ]
  return (
    <nav aria-label="Portal navigation" style={{
      backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)',
      padding: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap',
    }}>
      {links.map(({ to, label }) => (
        <Link key={to} to={to} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
          backgroundColor: active === label ? 'rgba(79,195,247,0.12)' : 'transparent',
          color: active === label ? 'var(--color-accent)' : 'var(--text-secondary)', transition: 'all 0.15s',
        }}>{label}</Link>
      ))}
    </nav>
  )
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#2E7D32', MEDIUM: '#F9A825', HIGH: '#FF7043', URGENT: '#B71C1C',
}

export default function PortalComplaints() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: () => complaintsApi.list({ my: true }).then((r) => r.data),
  })

  const complaints = data?.complaints || data || []

  if (isLoading) return <LoadingSpinner />

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <a href="#main-content" style={{ position: 'absolute', top: '-40px', left: 0, background: 'var(--color-accent)', color: '#000', padding: '8px', zIndex: 100 }}>
        Skip to content
      </a>
      <main id="main-content" style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <PortalNav active="Complaints" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            My Complaints
          </h1>
          <Link to="/consumer/complaint" style={{
            padding: '0.6rem 1.25rem', borderRadius: '8px', backgroundColor: '#F9A825',
            color: '#000', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
          }}>
            + File Complaint
          </Link>
        </div>

        {complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center', padding: '4rem',
              backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>No complaints filed yet.</p>
            <Link to="/consumer/complaint" style={{
              padding: '0.6rem 1.5rem', borderRadius: '8px', backgroundColor: '#F9A825',
              color: '#000', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
            }}>File a Complaint</Link>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {complaints.map((c: any, i: number) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)', padding: '1.5rem',
                  borderLeft: `3px solid ${PRIORITY_COLORS[c.priority] || 'var(--border-default)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                        {c.ticket_number}
                      </span>
                      <StatusBadge status={c.status} />
                      {c.priority && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                          backgroundColor: `${PRIORITY_COLORS[c.priority]}20`,
                          color: PRIORITY_COLORS[c.priority],
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {c.priority}
                        </span>
                      )}
                      {c.sector && <SectorBadge sector={c.sector} />}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{c.category?.replace(/_/g, ' ')}</strong>
                      {' — '}{c.description?.slice(0, 120)}{c.description?.length > 120 ? '...' : ''}
                    </p>

                    {c.resolution && (
                      <div style={{
                        marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
                        backgroundColor: 'rgba(46,125,50,0.08)', border: '1px solid rgba(46,125,50,0.2)',
                      }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a5d6a7', marginBottom: '0.25rem' }}>Resolution</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.resolution}</p>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.submitted_at || c.created_at).toLocaleDateString('en-BW')}
                    </p>
                    {c.resolved_at && (
                      <p style={{ fontSize: '0.75rem', color: '#a5d6a7', marginTop: '0.25rem' }}>
                        Resolved {new Date(c.resolved_at).toLocaleDateString('en-BW')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
