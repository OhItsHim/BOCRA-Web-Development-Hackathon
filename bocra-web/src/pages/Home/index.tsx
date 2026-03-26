import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { newsApi } from '../../api/endpoints/news'
import { publicationsApi } from '../../api/endpoints/publications'
import { adminApi } from '../../api/endpoints/admin'
import SectorBadge from '../../components/common/SectorBadge'
import { formatDate } from '../../utils/formatters'

// ─── Alert Strip ──────────────────────────────────────────────────────────────
function AlertStrip() {
  const { data } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: () => adminApi.getAlerts().then(r => r.data.data),
    staleTime: 60000,
  })

  const alerts = data || [
    { id: '1', title: '5G Spectrum Consultation Open', type: 'INFO', sector: 'TELECOM' },
    { id: '2', title: 'New Broadcasting Guidelines Effective Jan 2025', type: 'INFO', sector: 'BROADCASTING' },
    { id: '3', title: 'PostExpress BW Licence Suspended', type: 'ALERT', sector: 'POSTAL' },
    { id: '4', title: 'Scheduled Maintenance: Portal offline Fri 22:00–02:00', type: 'WARNING', sector: 'TELECOM' },
  ]

  const sectorColor: Record<string, string> = {
    TELECOM: '#90caf9', BROADCASTING: '#ffe082', INTERNET: '#a5d6a7', POSTAL: '#ef9a9a',
  }

  const [paused, setPaused] = useState(false)

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        backgroundColor: '#0d0d0d',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
      }}
      aria-label="Alert ticker"
      role="marquee"
    >
      <div
        style={{
          display: 'flex',
          gap: '48px',
          whiteSpace: 'nowrap',
          animation: paused ? 'none' : 'ticker 30s linear infinite',
          paddingLeft: '100%',
        }}
      >
        {[...alerts, ...alerts].map((alert, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
              backgroundColor: sectorColor[alert.sector || ''] || '#4FC3F7',
            }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{alert.title}</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function ConnectivityWeb() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
      {/* Nodes */}
      {[
        [600,300],[200,150],[1000,150],[200,450],[1000,450],
        [400,100],[800,100],[100,300],[1100,300],[400,500],[800,500],
        [600,80],[600,520],[350,300],[850,300],
      ].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#4FC3F7" opacity="0.8" />
      ))}
      {/* Lines */}
      {[
        [600,300,200,150],[600,300,1000,150],[600,300,200,450],[600,300,1000,450],
        [200,150,400,100],[200,150,100,300],[1000,150,800,100],[1000,150,1100,300],
        [200,450,400,500],[200,450,100,300],[1000,450,800,500],[1000,450,1100,300],
        [600,300,600,80],[600,300,600,520],[600,300,350,300],[600,300,850,300],
      ].map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4FC3F7" strokeWidth="0.5" />
      ))}
    </svg>
  )
}

function OrbitDiagram() {
  const sectors = [
    { label: 'Telecoms', color: '#1565C0', angle: 0 },
    { label: 'Broadcast', color: '#F9A825', angle: 90 },
    { label: 'Internet', color: '#2E7D32', angle: 180 },
    { label: 'Postal', color: '#B71C1C', angle: 270 },
  ]
  const R = 90
  return (
    <div style={{ position: 'relative', width: '240px', height: '240px', margin: '0 auto' }}>
      {/* Orbit ring */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 240 240">
        <circle cx="120" cy="120" r={R} fill="none" stroke="rgba(79,195,247,0.15)" strokeWidth="1" strokeDasharray="4 6" />
      </svg>
      {/* Center */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '64px', height: '64px', borderRadius: '50%',
        backgroundColor: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.75rem', color: '#4FC3F7',
      }}>
        BOCRA
      </div>
      {/* Sector nodes */}
      {sectors.map(s => {
        const rad = (s.angle - 90) * Math.PI / 180
        const x = 120 + R * Math.cos(rad)
        const y = 120 + R * Math.sin(rad)
        return (
          <motion.div
            key={s.label}
            style={{
              position: 'absolute',
              left: `${x}px`, top: `${y}px`,
              transform: 'translate(-50%,-50%)',
              width: '44px', height: '44px', borderRadius: '50%',
              backgroundColor: `${s.color}20`,
              border: `2px solid ${s.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.55rem', fontWeight: 700, color: s.color,
              textAlign: 'center', lineHeight: 1.2,
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: sectors.indexOf(s) * 0.75 }}
          >
            {s.label}
          </motion.div>
        )
      })}
    </div>
  )
}

function Hero() {
  return (
    <section
      style={{
        position: 'relative', minHeight: '90vh',
        backgroundColor: '#111', overflow: 'hidden',
        display: 'flex', alignItems: 'center',
      }}
      aria-label="Hero section"
    >
      <ConnectivityWeb />
      <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '48px', alignItems: 'center', width: '100%' }}>
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
          >
            <div style={{ width: '32px', height: '2px', backgroundColor: '#4FC3F7' }} />
            <span style={{ fontSize: '0.75rem', color: '#4FC3F7', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Botswana Communications Regulatory Authority
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              fontWeight: 800, color: '#fff', margin: '0 0 16px', lineHeight: 1.05,
            }}
          >
            Regulating Botswana's<br />
            <span style={{ color: '#4FC3F7' }}>Digital Future</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 0 32px', lineHeight: 1.6 }}
          >
            Licensing, regulating, and developing the telecommunications, broadcasting, postal, and internet sectors for the benefit of all Batswana.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          >
            {[
              { to: '/consumer/complaint', label: 'File a Complaint', bg: '#B71C1C', color: '#fff' },
              { to: '/licensing/apply', label: 'Apply for Licence', bg: '#1565C0', color: '#fff' },
              { to: '/consultations', label: 'Consultations', bg: 'transparent', color: '#4FC3F7', border: '1px solid #4FC3F7' },
              { to: '/publications', label: 'Publications', bg: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' },
            ].map(btn => (
              <Link
                key={btn.to}
                to={btn.to}
                style={{
                  padding: '12px 20px', borderRadius: '8px',
                  backgroundColor: btn.bg, color: btn.color,
                  textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
                  border: btn.border || 'none', transition: 'opacity 0.2s',
                }}
              >
                {btn.label}
              </Link>
            ))}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'none' }}
          className="lg:block"
        >
          <OrbitDiagram />
        </motion.div>
      </div>
    </section>
  )
}

// ─── Stats Strip ──────────────────────────────────────────────────────────────
function CountUp({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

function StatsStrip() {
  const stats = [
    { label: 'Licensed Operators', value: 120, suffix: '+', color: '#1565C0' },
    { label: 'Complaints Resolved', value: 4800, suffix: '+', color: '#B71C1C' },
    { label: 'Spectrum Assignments', value: 340, suffix: '', color: '#4FC3F7' },
    { label: 'Type Approvals Issued', value: 2100, suffix: '+', color: '#2E7D32' },
    { label: 'Internet Penetration', value: 70, suffix: '%', color: '#F9A825' },
  ]
  return (
    <section
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '0' }}
      aria-label="Key statistics"
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            style={{
              padding: '28px 24px',
              borderRight: i < 4 ? '1px solid var(--border-subtle)' : 'none',
              borderTop: `3px solid ${s.color}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: s.color }}>
              <CountUp target={s.value} />{s.suffix}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
              {s.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.color, animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-hint)' }}>Live</span>
            </div>
          </motion.div>
        ))}
      </div>
      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }`}</style>
    </section>
  )
}

// ─── Service Panel ─────────────────────────────────────────────────────────────
function ServicePanel() {
  const services = [
    { title: 'Licence Applications', desc: 'Apply for telecom, broadcast, postal or internet licences', icon: '📄', color: '#1565C0', to: '/licensing/apply' },
    { title: 'Complaint Resolution', desc: 'Report service issues and billing disputes', icon: '📣', color: '#B71C1C', to: '/consumer/complaint' },
    { title: 'Spectrum Management', desc: 'Frequency assignments and spectrum monitoring', icon: '📡', color: '#4FC3F7', to: '/licensing' },
    { title: 'Type Approval', desc: 'Equipment certification for the Botswana market', icon: '✅', color: '#2E7D32', to: '/licensing' },
    { title: 'Consumer Protection', desc: 'Know your rights as a communications consumer', icon: '🛡️', color: '#F9A825', to: '/consumer/rights' },
    { title: 'Public Consultations', desc: 'Participate in policy and regulatory reviews', icon: '💬', color: '#1565C0', to: '/consultations' },
    { title: 'Licensee Directory', desc: 'Search licensed operators across all sectors', icon: '🔍', color: '#4FC3F7', to: '/licensing/licensees' },
    { title: 'Publications & Reports', desc: 'Access annual reports, guidelines and research', icon: '📚', color: '#F9A825', to: '/publications' },
  ]
  return (
    <section aria-label="BOCRA services" style={{ padding: '64px 24px', backgroundColor: 'var(--bg-base)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Regulatory Services
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            All BOCRA services, accessible online 24/7.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={s.to}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderTop: `3px solid ${s.color}`,
                    borderRadius: '10px',
                    padding: '20px',
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = s.color
                    el.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border-subtle)'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{s.icon}</div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Sector Cards ─────────────────────────────────────────────────────────────
function SectorCards() {
  const sectors = [
    {
      name: 'Telecommunications',
      color: '#1565C0',
      lightColor: '#90caf9',
      bg: 'rgba(21,101,192,0.12)',
      icon: '📱',
      stats: '3 Mobile Networks · 120+ Operators',
      tags: ['Voice Services', '4G/5G', 'Broadband', 'Spectrum'],
      notice: '5G spectrum consultation currently open',
      to: '/licensing',
    },
    {
      name: 'Broadcasting',
      color: '#F9A825',
      lightColor: '#ffe082',
      bg: 'rgba(249,168,37,0.12)',
      icon: '📺',
      stats: '1 Public Broadcaster · 15+ Licensed Stations',
      tags: ['TV', 'Radio', 'Community', 'Online'],
      notice: 'Digital migration 80% complete in Gaborone',
      to: '/licensing',
    },
    {
      name: 'Internet Services',
      color: '#2E7D32',
      lightColor: '#a5d6a7',
      bg: 'rgba(46,125,50,0.12)',
      icon: '🌐',
      stats: '70% Penetration · 20+ Licensed ISPs',
      tags: ['ISP', 'VSAT', 'Broadband', 'Enterprise'],
      notice: 'New cybersecurity guidelines effective Q1 2025',
      to: '/licensing',
    },
    {
      name: 'Postal Services',
      color: '#B71C1C',
      lightColor: '#ef9a9a',
      bg: 'rgba(183,28,28,0.12)',
      icon: '📮',
      stats: 'National Coverage · 8+ Licensed Operators',
      tags: ['Courier', 'Express', 'Parcels', 'Logistics'],
      notice: 'PostExpress BW licence currently suspended',
      to: '/licensing',
    },
  ]
  return (
    <section aria-label="Regulated sectors" style={{ padding: '64px 24px', backgroundColor: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Regulated Sectors
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            BOCRA oversees four communications sectors across Botswana.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {sectors.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={s.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                >
                  <div style={{ backgroundColor: s.bg, padding: '20px', borderBottom: `2px solid ${s.color}` }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
                    <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: s.lightColor }}>{s.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{s.stats}</p>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {s.tags.map(tag => (
                        <span key={tag} style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem',
                          backgroundColor: s.bg, color: s.lightColor, fontWeight: 600,
                        }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{
                      fontSize: '0.75rem', color: s.lightColor,
                      backgroundColor: s.bg, padding: '6px 10px', borderRadius: '6px',
                      borderLeft: `2px solid ${s.color}`,
                    }}>
                      ℹ️ {s.notice}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Consultation Banner ───────────────────────────────────────────────────────
function ConsultationBanner() {
  const { data } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => import('../../api/endpoints/consultations').then(m => m.consultationsApi.list().then(r => r.data.data)),
    staleTime: 60000,
  })

  const openConsultations = (data || []).filter((c: { status: string }) => c.status === 'OPEN')
  const consultation = openConsultations[0] || {
    title: '5G Spectrum Allocation Framework — Public Consultation',
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    id: 'demo',
  }

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    const update = () => {
      const diff = new Date(consultation.end_date).getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [consultation.end_date])

  const total = 30
  const remaining = timeLeft.days
  const progress = Math.max(0, Math.min(100, ((total - remaining) / total) * 100))

  return (
    <section
      aria-label="Open consultation"
      style={{
        background: 'linear-gradient(135deg, #0d1b2e 0%, #1a1a2e 100%)',
        borderTop: '1px solid rgba(21,101,192,0.3)',
        borderBottom: '1px solid rgba(21,101,192,0.3)',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4FC3F7', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.7rem', color: '#4FC3F7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Open Consultation</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
              {consultation.title}
            </h2>
            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#1565C0', borderRadius: '2px', transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: '0 0 20px' }}>
              Consultation period {Math.round(progress)}% elapsed
            </p>
            <Link
              to={`/consultations/${consultation.id}`}
              style={{
                display: 'inline-block', padding: '10px 20px', borderRadius: '8px',
                backgroundColor: '#1565C0', color: '#fff', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.875rem',
              }}
            >
              Submit Your Comments →
            </Link>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.mins, label: 'Mins' },
                { value: timeLeft.secs, label: 'Secs' },
              ].map(t => (
                <div key={t.label} style={{
                  backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '12px 8px', minWidth: '60px',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: '#4FC3F7' }}>
                    {String(t.value).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: '4px' }}>{t.label}</div>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginTop: '8px' }}>Until submission deadline</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Intelligence Feed ─────────────────────────────────────────────────────────
function IntelligenceFeed() {
  const [filter, setFilter] = useState<'all' | 'news' | 'publications'>('all')

  const { data: newsData } = useQuery({
    queryKey: ['news-feed'],
    queryFn: () => newsApi.list({ per_page: 6 }).then(r => r.data.data),
  })

  const { data: pubsData } = useQuery({
    queryKey: ['pubs-feed'],
    queryFn: () => publicationsApi.list({ per_page: 6 }).then(r => r.data.data),
  })

  const allItems = [
    ...(newsData || []).map((n: Record<string, unknown>) => ({ ...n, _type: 'news' })),
    ...(pubsData || []).map((p: Record<string, unknown>) => ({ ...p, _type: 'publication' })),
  ].slice(0, 8)

  const filtered = filter === 'all' ? allItems
    : allItems.filter(item => item._type === (filter === 'news' ? 'news' : 'publication'))

  return (
    <section aria-label="Latest news and publications" style={{ padding: '64px 24px', backgroundColor: 'var(--bg-base)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Intelligence Feed
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
              Latest regulatory news and publications from BOCRA.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'news', 'publications'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                  borderColor: filter === f ? 'var(--color-accent)' : 'var(--border-default)',
                  backgroundColor: filter === f ? 'rgba(79,195,247,0.15)' : 'transparent',
                  color: filter === f ? 'var(--color-accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}
          >
            {(filtered.length ? filtered : Array.from({ length: 4 }, (_, i) => ({
              _type: i % 2 === 0 ? 'news' : 'publication',
              id: String(i),
              title: ['BOCRA Launches 5G Consultation', 'Annual Report 2023', 'Consumer Complaint Falls 15%', 'Broadcasting Guidelines v3.0'][i] || 'Article',
              excerpt: 'BOCRA regulatory update for the communications sector in Botswana.',
              description: 'Official BOCRA publication',
              slug: 'demo-' + i,
              sector: ['TELECOM', 'TELECOM', 'TELECOM', 'BROADCASTING'][i],
              published_at: new Date().toISOString(),
              type: 'REPORT',
            }))).map((item, i) => (
              <motion.div
                key={item.id as string || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={item._type === 'news' ? `/news/${item.slug}` : `/publications/${item.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px', padding: '20px',
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'pointer', height: '100%',
                  }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'var(--border-strong)'
                      el.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'var(--border-subtle)'
                      el.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <SectorBadge sector={item.sector as string} />
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                        color: item._type === 'news' ? '#4FC3F7' : '#F9A825',
                        padding: '2px 6px', borderRadius: '3px',
                        backgroundColor: item._type === 'news' ? 'rgba(79,195,247,0.1)' : 'rgba(249,168,37,0.1)',
                      }}>
                        {item._type === 'news' ? 'News' : (item.type as string) || 'Publication'}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {item.title as string}
                    </h3>
                    <p style={{ margin: '0 0 12px', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {(item.excerpt || item.description) as string || ''}
                    </p>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.published_at as string)}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link
            to="/news"
            style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: '8px',
              border: '1px solid var(--border-default)', color: 'var(--text-secondary)',
              textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            View All News & Publications →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Audience Navigator ────────────────────────────────────────────────────────
function AudienceNavigator() {
  const [active, setActive] = useState(0)
  const audiences = [
    {
      label: 'Individual Consumer', icon: '👤',
      cards: [
        { title: 'File a Complaint', desc: 'Report billing, coverage, or quality issues', to: '/consumer/complaint', color: '#B71C1C' },
        { title: 'Know Your Rights', desc: 'Consumer protection guide', to: '/consumer/rights', color: '#1565C0' },
        { title: 'Track Complaint', desc: 'Check status with ticket number', to: '/consumer/track', color: '#4FC3F7' },
      ],
    },
    {
      label: 'Business Operator', icon: '🏢',
      cards: [
        { title: 'Apply for Licence', desc: 'Start your licence application', to: '/licensing/apply', color: '#1565C0' },
        { title: 'View Licence Types', desc: 'Find the right licence for your service', to: '/licensing', color: '#2E7D32' },
        { title: 'Track Application', desc: 'Check your application status', to: '/licensing/track', color: '#4FC3F7' },
      ],
    },
    {
      label: 'Media & Broadcaster', icon: '📡',
      cards: [
        { title: 'Broadcasting Licences', desc: 'TV, radio, community, and online', to: '/licensing', color: '#F9A825' },
        { title: 'Content Guidelines', desc: 'Regulatory content standards', to: '/publications', color: '#1565C0' },
        { title: 'Report a Broadcaster', desc: 'Content and coverage complaints', to: '/consumer/complaint', color: '#B71C1C' },
      ],
    },
    {
      label: 'Internet Provider', icon: '🌐',
      cards: [
        { title: 'ISP Licensing', desc: 'Apply for internet service provider licence', to: '/licensing/apply', color: '#2E7D32' },
        { title: 'Cybersecurity Guidelines', desc: 'Mandatory security standards', to: '/publications', color: '#4FC3F7' },
        { title: 'Licensed ISPs', desc: 'View the ISP directory', to: '/licensing/licensees', color: '#1565C0' },
      ],
    },
    {
      label: 'Researcher / Academic', icon: '🎓',
      cards: [
        { title: 'ICT Statistics', desc: 'Market data and indicators', to: '/publications', color: '#4FC3F7' },
        { title: 'Annual Reports', desc: 'BOCRA yearly performance reports', to: '/publications', color: '#1565C0' },
        { title: 'Consultations', desc: 'Regulatory consultation papers', to: '/consultations', color: '#F9A825' },
      ],
    },
    {
      label: 'Government / Policy', icon: '🏛️',
      cards: [
        { title: 'Legislation', desc: 'Communications Act and regulations', to: '/about/legislation', color: '#1565C0' },
        { title: 'Policy Documents', desc: 'Regulatory policy framework', to: '/publications', color: '#4FC3F7' },
        { title: 'Participate in Consultations', desc: 'Submit institutional comments', to: '/consultations', color: '#2E7D32' },
      ],
    },
  ]

  return (
    <section aria-label="Services by audience" style={{ padding: '64px 24px', backgroundColor: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 24px' }}>
          I'm looking for...
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {audiences.map((a, i) => (
            <button
              key={a.label}
              onClick={() => setActive(i)}
              style={{
                padding: '8px 16px', borderRadius: '24px',
                border: '1px solid',
                borderColor: active === i ? 'var(--color-accent)' : 'var(--border-default)',
                backgroundColor: active === i ? 'rgba(79,195,247,0.15)' : 'transparent',
                color: active === i ? 'var(--color-accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <span>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}
          >
            {audiences[active].cards.map(card => (
              <Link key={card.title} to={card.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '20px', borderRadius: '10px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderTop: `3px solid ${card.color}`,
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                >
                  <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 600, color: card.color }}>{card.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{card.desc}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

// ─── Trust Band ────────────────────────────────────────────────────────────────
function TrustBand() {
  const metrics = [
    { label: 'Complaint Resolution Rate', value: '94%', sub: 'within 30 days', color: '#2E7D32' },
    { label: 'Open Data Commitment', value: '100%', sub: 'publications free to download', color: '#1565C0' },
    { label: 'Public Consultations', value: '12+', sub: 'conducted in 2024', color: '#F9A825' },
    { label: 'Years of Regulation', value: '20+', sub: 'since establishment', color: '#4FC3F7' },
  ]
  return (
    <section aria-label="Transparency metrics" style={{ padding: '48px 24px', backgroundColor: '#0d0d0d' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 24px', textAlign: 'center' }}>
          Accountability & Transparency
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '24px', borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: `1px solid ${m.color}30`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: m.color, marginBottom: '4px' }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{m.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Home ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div>
      <AlertStrip />
      <Hero />
      <StatsStrip />
      <ServicePanel />
      <SectorCards />
      <ConsultationBanner />
      <IntelligenceFeed />
      <AudienceNavigator />
      <TrustBand />
    </div>
  )
}
