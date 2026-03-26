import React from 'react'
import PageHero from '../../components/common/PageHero'
import { Link } from 'react-router-dom'

export default function Legislation() {
  const acts = [
    { name: 'Communications Regulatory Authority Act (CAP 71:02)', desc: 'The principal legislation establishing BOCRA and its mandate.' },
    { name: 'Telecommunications Act', desc: 'Governs the provision and regulation of telecommunications services.' },
    { name: 'Broadcasting Act', desc: 'Provides for the establishment and regulation of broadcasting services.' },
    { name: 'Postal Services Act', desc: 'Regulates the provision of postal and courier services.' },
    { name: 'Electronic Communications and Transactions Act', desc: 'Legal framework for electronic communications and e-commerce.' },
    { name: 'Radio Communications Regulations', desc: 'Technical regulations for radio communications equipment and spectrum use.' },
  ]
  return (
    <div>
      <PageHero title="Legislation" subtitle="Key laws and regulations governing communications in Botswana." />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
          BOCRA derives its mandate from the Communications Regulatory Authority Act and administers several sector-specific laws. Full text of all legislation is available from the Botswana Government's official gazette.
        </p>
        {acts.map(act => (
          <div key={act.name} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', marginBottom: '12px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, fontSize: '1.5rem' }}>📋</div>
            <div>
              <h3 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>{act.name}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.825rem' }}>{act.desc}</p>
            </div>
          </div>
        ))}
        <div style={{ marginTop: '32px', padding: '20px', backgroundColor: 'var(--color-telecoms-bg)', borderRadius: '10px', border: '1px solid rgba(21,101,192,0.3)' }}>
          <p style={{ margin: '0 0 8px', color: 'var(--color-telecoms-light)', fontWeight: 600 }}>Need a specific regulation?</p>
          <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Full text of regulations and statutory instruments are available in our Publications library.</p>
          <Link to="/publications" style={{ color: 'var(--color-accent)', fontSize: '0.875rem', fontWeight: 500 }}>Browse Publications →</Link>
        </div>
      </div>
    </div>
  )
}
