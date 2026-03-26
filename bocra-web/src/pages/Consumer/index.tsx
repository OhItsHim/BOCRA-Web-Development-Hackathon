import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHero from '../../components/common/PageHero'

export default function Consumer() {
  const services = [
    { to: '/consumer/complaint', title: 'File a Complaint', desc: 'Report billing, coverage, quality, or spam issues with licensed operators.', icon: '📣', color: '#B71C1C' },
    { to: '/consumer/track', title: 'Track Your Complaint', desc: 'Check the status of a submitted complaint using your ticket number.', icon: '🔍', color: '#1565C0' },
    { to: '/consumer/rights', title: 'Consumer Rights', desc: 'Understand your rights as a communications consumer in Botswana.', icon: '🛡️', color: '#2E7D32' },
    { to: '/consumer/tariffs', title: 'Tariff Information', desc: 'Compare published tariffs from licensed operators.', icon: '💰', color: '#F9A825' },
    { to: '/consumer/alerts', title: 'Consumer Alerts', desc: 'Latest warnings, notices, and service updates from BOCRA.', icon: '🔔', color: '#4FC3F7' },
  ]
  return (
    <div>
      <PageHero title="Consumer Protection" subtitle="BOCRA protects communications consumers in Botswana. File complaints, check your rights, and stay informed." />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {services.map((s, i) => (
            <motion.div key={s.to} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link to={s.to} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderTop: `3px solid ${s.color}`, borderRadius: '10px', padding: '24px', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{s.icon}</div>
                  <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 600 }}>{s.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
