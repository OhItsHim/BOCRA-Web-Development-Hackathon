import React from 'react'
import PageHero from '../../components/common/PageHero'

export default function Leadership() {
  const leaders = [
    { name: 'Dr. Tebogo Morake', role: 'Chairperson', board: true },
    { name: 'Ms. Keabetswe Moatlhodi', role: 'Chief Executive Officer', board: false },
    { name: 'Mr. Lesedi Kgosi', role: 'Director, Licensing & Compliance', board: false },
    { name: 'Ms. Neo Setshedi', role: 'Director, Consumer Affairs', board: false },
    { name: 'Dr. Kagiso Monamodi', role: 'Director, Spectrum Management', board: false },
    { name: 'Adv. Boitumelo Phiri', role: 'Director, Legal & Regulatory Affairs', board: false },
  ]
  return (
    <div>
      <PageHero title="Leadership" subtitle="Board of Directors and Executive Management." />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0 0 20px' }}>Executive Management</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {leaders.map(l => (
            <div key={l.name} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--color-telecoms-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-telecoms)', fontSize: '1rem' }}>
                {l.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{l.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginTop: '2px' }}>{l.role}</div>
                {l.board && <div style={{ marginTop: '4px', fontSize: '0.65rem', color: 'var(--color-accent)', fontWeight: 600 }}>Board</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
