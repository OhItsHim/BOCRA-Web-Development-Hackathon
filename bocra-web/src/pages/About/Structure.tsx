import React from 'react'
import PageHero from '../../components/common/PageHero'

export default function Structure() {
  return (
    <div>
      <PageHero title="Organisational Structure" subtitle="BOCRA's board, executive, and divisional structure." />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 16px' }}>Board of Directors</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>The Board of BOCRA is appointed by the Minister responsible for Communications. It provides strategic oversight, approves key regulatory decisions, and is accountable to Parliament.</p>
        </div>
        {['Licensing & Compliance', 'Consumer Affairs', 'Spectrum Management', 'Legal & Regulatory Affairs', 'Finance & Administration', 'Information Technology'].map(div => (
          <div key={div} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px 20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{div} Division</span>
          </div>
        ))}
      </div>
    </div>
  )
}
