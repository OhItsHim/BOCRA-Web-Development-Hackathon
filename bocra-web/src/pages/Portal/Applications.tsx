import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { licensesApi } from '../../api/endpoints/licenses'
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
      backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
      border: '1px solid var(--border-subtle)', padding: '0.5rem',
      marginBottom: '2rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap',
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

const LICENSE_TYPE_LABELS: Record<string, string> = {
  TELECOM_CLASS: 'Telecom Class Licence',
  TELECOM_INDIVIDUAL: 'Telecom Individual Licence',
  TELECOM_NETWORK: 'Telecom Network Licence',
  BROADCAST_FTA_TV: 'Free-to-Air Television',
  BROADCAST_PAY_TV: 'Pay TV',
  BROADCAST_COMMUNITY_RADIO: 'Community Radio',
  BROADCAST_COMMERCIAL_RADIO: 'Commercial Radio',
  BROADCAST_ONLINE: 'Online Broadcasting',
  POSTAL_COURIER: 'Postal Courier',
  POSTAL_EXPRESS: 'Postal Express',
  INTERNET_ISP: 'Internet Service Provider',
  INTERNET_VSAT: 'VSAT Internet',
  SPECTRUM_FREQUENCY: 'Spectrum/Frequency',
}

export default function PortalApplications() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => licensesApi.myApplications().then((r) => r.data),
  })

  const apps = data?.applications || data || []

  if (isLoading) return <LoadingSpinner />

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <a href="#main-content" style={{ position: 'absolute', top: '-40px', left: 0, background: 'var(--color-accent)', color: '#000', padding: '8px', zIndex: 100 }}>
        Skip to content
      </a>
      <main id="main-content" style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <PortalNav active="Applications" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            My Applications
          </h1>
          <Link to="/licensing/apply" style={{
            padding: '0.6rem 1.25rem', borderRadius: '8px', backgroundColor: 'var(--color-telecoms)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
          }}>
            + New Application
          </Link>
        </div>

        {apps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center', padding: '4rem',
              backgroundColor: 'var(--bg-surface)', borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>No applications yet.</p>
            <Link to="/licensing/apply" style={{
              padding: '0.6rem 1.5rem', borderRadius: '8px', backgroundColor: 'var(--color-telecoms)',
              color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
            }}>
              Apply for a Licence
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {apps.map((app: any, i: number) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)', padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <StatusBadge status={app.status} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>REF: LIC-{app.id?.slice(0, 8)?.toUpperCase()}</span>
                    </div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{app.business_name}</h2>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {LICENSE_TYPE_LABELS[app.license_type] || app.license_type?.replace(/_/g, ' ')}
                    </p>
                    {app.notes && (
                      <div style={{
                        marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '6px',
                        backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                      }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <strong>Reviewer note:</strong> {app.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Submitted {new Date(app.submitted_at || app.created_at).toLocaleDateString('en-BW')}
                    </p>
                    {app.reviewed_at && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Reviewed {new Date(app.reviewed_at).toLocaleDateString('en-BW')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: '1rem' }}>
                  {['PENDING', 'UNDER_REVIEW', 'APPROVED'].map((s, idx) => {
                    const statuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']
                    const currentIdx = statuses.indexOf(app.status)
                    const done = idx <= currentIdx && app.status !== 'REJECTED'
                    return (
                      <React.Fragment key={s}>
                        <span style={{ fontSize: '0.7rem', color: done ? 'var(--color-internet)' : 'var(--text-muted)', fontWeight: 500 }}>
                          {done ? '✓ ' : '○ '}{s.replace(/_/g, ' ')}
                        </span>
                        {idx < 2 && <span style={{ color: 'var(--border-default)', margin: '0 0.5rem' }}>→</span>}
                      </React.Fragment>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
