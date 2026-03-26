import React from 'react'
import PageHero from '../../components/common/PageHero'

export default function Tariffs() {
  return (
    <div>
      <PageHero title="Tariff Information" subtitle="Published tariffs from licensed communications operators in Botswana." />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0 0 16px' }}>Tariff Monitoring</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            BOCRA monitors tariffs charged by licensed operators to ensure they are fair, transparent, and non-discriminatory. Operators are required to publish their tariffs and notify BOCRA of any changes.
          </p>
        </div>
        {['Mobile Voice Tariffs', 'Mobile Data Tariffs', 'Fixed Broadband Tariffs', 'International Roaming Rates', 'SMS Tariffs'].map(t => (
          <div key={t} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px 20px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '20px' }}>Available in Publications</span>
          </div>
        ))}
        <div style={{ marginTop: '24px', padding: '16px 20px', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          📚 Full tariff schedules are published in our <a href="/publications" style={{ color: 'var(--color-accent)' }}>Publications library</a>.
        </div>
      </div>
    </div>
  )
}
