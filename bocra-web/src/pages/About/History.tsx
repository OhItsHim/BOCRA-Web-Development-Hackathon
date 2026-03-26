import React from 'react'
import PageHero from '../../components/common/PageHero'

export default function History() {
  const timeline = [
    { year: '2004', event: 'Communications Regulatory Authority Act enacted, establishing BOCRA as independent regulator.' },
    { year: '2008', event: 'Mobile number portability introduced, increasing competition in the mobile sector.' },
    { year: '2012', event: 'Botswana Post separated from BTC; postal services regulation transferred to BOCRA.' },
    { year: '2015', event: 'Digital broadcasting migration commenced. Universal Service Fund established.' },
    { year: '2018', event: 'BOCRA issued first Internet Service Provider licences under new framework.' },
    { year: '2020', event: 'New spectrum management framework implemented. 4G LTE coverage reaches 90% of population.' },
    { year: '2023', event: 'BOCRA launches online licensing portal. Consumer complaints portal goes live.' },
    { year: '2024', event: '5G spectrum consultation launched. Internet penetration reaches 70% milestone.' },
  ]
  return (
    <div>
      <PageHero title="History" subtitle="BOCRA's journey in regulating Botswana's communications sector." />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        {timeline.map((item, i) => (
          <div key={item.year} style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ flexShrink: 0, textAlign: 'right', width: '60px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: 700 }}>{item.year}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
                {i < timeline.length - 1 && <div style={{ width: '1px', flex: 1, backgroundColor: 'var(--border-default)', marginTop: '4px' }} />}
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', flex: 1, marginBottom: '8px' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>{item.event}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
