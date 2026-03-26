import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHero from '../../components/common/PageHero'

const licenseTypes = [
  { id: 'TELECOM_CLASS', name: 'Class Licence', sector: 'TELECOM', desc: 'For standardised telecom services without individual conditions.' },
  { id: 'TELECOM_INDIVIDUAL', name: 'Individual Licence', sector: 'TELECOM', desc: 'For mobile network operators and large telecom providers.' },
  { id: 'TELECOM_NETWORK', name: 'Network Licence', sector: 'TELECOM', desc: 'For network infrastructure and service providers.' },
  { id: 'BROADCAST_FTA_TV', name: 'Free-to-Air TV', sector: 'BROADCASTING', desc: 'For terrestrial free-to-air television broadcasters.' },
  { id: 'BROADCAST_PAY_TV', name: 'Pay Television', sector: 'BROADCASTING', desc: 'For subscription-based television services.' },
  { id: 'BROADCAST_COMMUNITY_RADIO', name: 'Community Radio', sector: 'BROADCASTING', desc: 'For non-profit community radio stations.' },
  { id: 'BROADCAST_COMMERCIAL_RADIO', name: 'Commercial Radio', sector: 'BROADCASTING', desc: 'For commercial radio broadcasters.' },
  { id: 'BROADCAST_ONLINE', name: 'Online Broadcasting', sector: 'BROADCASTING', desc: 'For internet-based broadcasting services.' },
  { id: 'POSTAL_COURIER', name: 'Courier Service', sector: 'POSTAL', desc: 'For general courier and parcel delivery operators.' },
  { id: 'POSTAL_EXPRESS', name: 'Express Delivery', sector: 'POSTAL', desc: 'For express and time-critical delivery services.' },
  { id: 'INTERNET_ISP', name: 'Internet Service Provider', sector: 'INTERNET', desc: 'For companies providing internet access services.' },
  { id: 'INTERNET_VSAT', name: 'VSAT Service', sector: 'INTERNET', desc: 'For satellite-based internet service providers.' },
  { id: 'SPECTRUM_FREQUENCY', name: 'Spectrum Assignment', sector: 'TELECOM', desc: 'For frequency assignments and spectrum usage rights.' },
]

const sectorColors: Record<string, string> = {
  TELECOM: '#1565C0', BROADCASTING: '#F9A825', INTERNET: '#2E7D32', POSTAL: '#B71C1C',
}

export default function Licensing() {
  const [filter, setFilter] = useState('ALL')
  const sectors = ['ALL', 'TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL']
  const filtered = filter === 'ALL' ? licenseTypes : licenseTypes.filter(l => l.sector === filter)

  return (
    <div>
      <PageHero title="Licensing" subtitle="Apply for telecommunications, broadcasting, postal, and internet licences in Botswana." />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Link to="/licensing/apply" style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#1565C0', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>Apply Now</Link>
          <Link to="/licensing/track" style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>Track Application</Link>
          <Link to="/licensing/licensees" style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>View Licensees</Link>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {sectors.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid',
              borderColor: filter === s ? (sectorColors[s] || 'var(--color-accent)') : 'var(--border-default)',
              backgroundColor: filter === s ? `${sectorColors[s] || '#4FC3F7'}20` : 'transparent',
              color: filter === s ? (sectorColors[s] || 'var(--color-accent)') : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
            }}>
              {s === 'ALL' ? 'All Sectors' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map((lt, i) => (
            <motion.div key={lt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to="/licensing/apply" style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderTop: `3px solid ${sectorColors[lt.sector]}`, borderRadius: '10px', padding: '20px',
                  cursor: 'pointer', transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: sectorColors[lt.sector], backgroundColor: `${sectorColors[lt.sector]}15`, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{lt.sector}</span>
                  <h3 style={{ margin: '10px 0 6px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>{lt.name}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>{lt.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
