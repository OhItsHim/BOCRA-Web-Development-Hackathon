import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../api/endpoints/admin'
import { licensesApi } from '../../api/endpoints/licenses'
import { complaintsApi } from '../../api/endpoints/complaints'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import BocraLogo from '../../components/common/BocraLogo'

// ──────────────── Sidebar ────────────────
const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', exact: true },
  { to: '/admin/applications', label: 'Applications', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z' },
  { to: '/admin/complaints', label: 'Complaints', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { to: '/admin/licensees', label: 'Licensees', icon: 'M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4' },
  { to: '/admin/consultations', label: 'Consultations', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { to: '/admin/publications', label: 'Publications', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4a2 2 0 012-2h14a2 2 0 012 2v13.5' },
  { to: '/admin/news', label: 'News', icon: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM3 9h18' },
  { to: '/admin/users', label: 'Users', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/admin/alerts', label: 'Alerts', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
]

export function AdminSidebar() {
  const location = useLocation()
  return (
    <aside aria-label="Admin navigation" style={{
      width: 200, flexShrink: 0, backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)', minHeight: '100vh',
      padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
    }}>
      <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <BocraLogo size="medium" />
        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Administration
        </p>
      </div>
      {NAV_ITEMS.map(({ to, label, icon, exact }) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
        return (
          <Link key={to} to={to} style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.55rem 0.75rem', borderRadius: '8px', textDecoration: 'none',
            fontSize: '0.825rem', fontWeight: 500,
            backgroundColor: isActive ? 'rgba(79,195,247,0.12)' : 'transparent',
            color: isActive ? 'var(--color-accent)' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d={icon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {label}
          </Link>
        )
      })}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.55rem 0.75rem',
          borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem',
          color: 'var(--text-muted)', transition: 'all 0.15s',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Site
        </Link>
      </div>
    </aside>
  )
}

// ──────────────── Animated Count-Up ────────────────
function CountUp({ target, duration = 1000 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return <>{val.toLocaleString()}</>
}

// ──────────────── Mini Bar Sparkline ────────────────
function MiniBars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 28 }}>
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.04, duration: 0.4 }}
          style={{ width: 4, borderRadius: 2, backgroundColor: color, opacity: 0.7 }}
        />
      ))}
    </div>
  )
}

// ──────────────── Dashboard ────────────────
export default function AdminDashboard() {
  const { data: overview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.statsOverview().then(r => r.data),
  })
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['admin-applications', 'recent'],
    queryFn: () => licensesApi.listApplications({ limit: 5 }).then(r => r.data),
  })
  const { data: compData, isLoading: compLoading } = useQuery({
    queryKey: ['admin-complaints', 'urgent'],
    queryFn: () => complaintsApi.list({ priority: 'URGENT,HIGH', limit: 5 }).then(r => r.data),
  })

  const rawApps = appsData?.applications || appsData?.items || appsData?.data || appsData
  const apps = Array.isArray(rawApps) ? rawApps : []
  const rawComps = compData?.complaints || compData?.items || compData?.data || compData
  const urgentComplaints = Array.isArray(rawComps) ? rawComps : []

  const kpis = [
    {
      label: 'Applications MTD', value: overview?.applications_mtd ?? 0,
      delta: overview?.applications_delta ?? 0, color: '#1565C0',
      bars: overview?.applications_trend ?? [4, 7, 5, 9, 12, 8, 11],
    },
    {
      label: 'Open Complaints', value: overview?.open_complaints ?? 0,
      delta: overview?.complaints_delta ?? 0, color: '#F9A825',
      bars: overview?.complaints_trend ?? [12, 8, 15, 10, 7, 9, 6],
    },
    {
      label: 'Active Licensees', value: overview?.active_licensees ?? 0,
      delta: 0, color: '#2E7D32',
      bars: overview?.licensees_trend ?? [20, 20, 21, 21, 22, 22, 22],
    },
    {
      label: 'Page Views (7d)', value: overview?.pageviews_7d ?? 0,
      delta: overview?.pageviews_delta ?? 0, color: '#4FC3F7',
      bars: overview?.pageviews_trend ?? [200, 340, 280, 410, 390, 520, 480],
    },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            {new Date().toLocaleDateString('en-BW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {kpis.map(({ label, value, delta, color, bars }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)', padding: '1.25rem',
                  borderTop: `3px solid ${color}`,
                }}
              >
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    <CountUp target={value} />
                  </p>
                  <MiniBars values={bars} color={color} />
                </div>
                {delta !== 0 && (
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: delta > 0 ? '#a5d6a7' : '#ef9a9a' }}>
                    {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}% vs last month
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Split panels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Recent Applications */}
            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Applications</h2>
                <Link to="/admin/applications" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>View all →</Link>
              </div>
              {appsLoading ? <LoadingSpinner /> : apps.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>No applications yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {apps.slice(0, 5).map((app: any) => (
                    <div key={app.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.625rem 0.875rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)',
                    }}>
                      <div>
                        <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{app.business_name}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{app.license_type?.replace(/_/g, ' ')}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urgent Complaints */}
            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Urgent Complaints</h2>
                <Link to="/admin/complaints" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>View all →</Link>
              </div>
              {compLoading ? <LoadingSpinner /> : urgentComplaints.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>No urgent complaints.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {urgentComplaints.slice(0, 5).map((c: any) => (
                    <div key={c.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.625rem 0.875rem', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)',
                      borderLeft: `3px solid ${c.priority === 'URGENT' ? '#B71C1C' : '#FF7043'}`,
                    }}>
                      <div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.ticket_number}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.category?.replace(/_/g, ' ')}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
