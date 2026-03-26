import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHero from '../../components/common/PageHero'

export default function About() {
  const sections = [
    { to: '/about/mandate', title: 'Our Mandate', desc: 'BOCRA\'s regulatory mandate, powers, and functions under the Communications Regulatory Authority Act.', icon: '⚖️' },
    { to: '/about/structure', title: 'Organisational Structure', desc: 'Board composition, executive leadership, and divisional structure of BOCRA.', icon: '🏛️' },
    { to: '/about/history', title: 'History', desc: 'The establishment and evolution of communications regulation in Botswana.', icon: '📜' },
    { to: '/about/leadership', title: 'Leadership', desc: 'Meet the Board members and Executive Management team.', icon: '👥' },
    { to: '/about/legislation', title: 'Legislation', desc: 'Key legislation and regulations governing communications in Botswana.', icon: '📋' },
  ]
  return (
    <div>
      <PageHero
        title="About BOCRA"
        subtitle="The Botswana Communications Regulatory Authority is the independent regulator for the telecommunications, broadcasting, postal, and internet sectors."
      />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '32px', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Who We Are</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: '0 0 16px' }}>
            BOCRA was established under the Communications Regulatory Authority Act (CAP 71:02) and is responsible for regulating communications services in Botswana. We operate as an independent regulator, ensuring fair competition, consumer protection, and the development of a world-class communications sector.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
            Our mandate spans four key sectors: telecommunications, broadcasting, postal services, and internet services. We license operators, protect consumers, manage the radio frequency spectrum, and type-approve electronic communications equipment.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {sections.map((s, i) => (
            <motion.div key={s.to} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link to={s.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '10px', padding: '24px', cursor: 'pointer',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{s.icon}</div>
                  <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>{s.title}</h3>
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
