import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { licensesApi } from '../../api/endpoints/licenses'
import { complaintsApi } from '../../api/endpoints/complaints'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
}

function PortalNav({ active }: { active: string }) {
  const links = [
    { to: '/portal', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
    { to: '/portal/applications', label: 'Applications', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z' },
    { to: '/portal/complaints', label: 'Complaints', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
    { to: '/portal/profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
  ]
  return (
    <nav aria-label="Portal navigation" style={{
      backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
      border: '1px solid var(--border-subtle)', padding: '0.5rem',
      marginBottom: '2rem',
      display: 'flex', gap: '0.25rem', flexWrap: 'wrap',
    }}>
      {links.map(({ to, label, icon }) => (
        <Link key={to} to={to} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1rem', borderRadius: '8px',
          textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
          backgroundColor: active === label ? 'rgba(79,195,247,0.12)' : 'transparent',
          color: active === label ? 'var(--color-accent)' : 'var(--text-secondary)',
          transition: 'all 0.15s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d={icon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {label}
        </Link>
      ))}
    </nav>
  )
}

export default function PortalDashboard() {
  const { user } = useAuth()

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => licensesApi.myApplications().then((r) => r.data),
  })

  const { data: compData, isLoading: compLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: () => complaintsApi.list({ my: true }).then((r) => r.data),
  })

  const apps = appsData?.applications || appsData || []
  const complaints = compData?.complaints || compData || []

  if (appsLoading || compLoading) return <LoadingSpinner />

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const stats = [
    { label: 'Applications', value: apps.length, color: '#1565C0', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z' },
    { label: 'Complaints', value: complaints.length, color: '#F9A825', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
    { label: 'Pending', value: apps.filter((a: any) => a.status === 'PENDING').length + complaints.filter((c: any) => c.status === 'OPEN').length, color: '#4FC3F7', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2' },
    { label: 'Resolved', value: complaints.filter((c: any) => c.status === 'RESOLVED').length, color: '#2E7D32', icon: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3' },
  ]

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <a href="#main-content" style={{ position: 'absolute', top: '-40px', left: 0, background: 'var(--color-accent)', color: '#000', padding: '8px', zIndex: 100 }}>
        Skip to content
      </a>
      <main id="main-content" style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <PortalNav active="Dashboard" />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Welcome */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(21,101,192,0.15), rgba(79,195,247,0.08))',
            borderRadius: '16px', border: '1px solid rgba(79,195,247,0.15)',
            padding: '2rem', marginBottom: '2rem',
          }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {greeting()}, {user?.first_name || 'User'} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Welcome to your BOCRA portal. Manage your applications and complaints below.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {stats.map(({ label, value, color, icon }, i) => (
              <motion.div key={label} custom={i} variants={fadeUp} initial="hidden" animate="show"
                style={{
                  backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)', padding: '1.25rem',
                  borderTop: `3px solid ${color}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>{label}</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d={icon} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <Link to="/licensing/apply" style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem',
              borderRadius: '12px', border: '1px solid rgba(21,101,192,0.3)',
              backgroundColor: 'rgba(21,101,192,0.08)', textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(21,101,192,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#90caf9" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>New Application</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Apply for a licence</p>
              </div>
            </Link>
            <Link to="/consumer/complaint" style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem',
              borderRadius: '12px', border: '1px solid rgba(249,168,37,0.3)',
              backgroundColor: 'rgba(249,168,37,0.08)', textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(249,168,37,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#ffe082" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>File Complaint</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Report an issue</p>
              </div>
            </Link>
          </div>

          {/* Recent Applications */}
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Applications</h2>
              <Link to="/portal/applications" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>View all →</Link>
            </div>
            {apps.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>No applications yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {apps.slice(0, 3).map((app: any) => (
                  <div key={app.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)',
                    flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{app.business_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.license_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Complaints */}
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Complaints</h2>
              <Link to="/portal/complaints" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>View all →</Link>
            </div>
            {complaints.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>No complaints filed.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {complaints.slice(0, 3).map((c: any) => (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)',
                    flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>{c.ticket_number}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.category?.replace(/_/g, ' ')} — {c.sector}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
