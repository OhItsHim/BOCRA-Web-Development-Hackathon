import React from 'react'

const sectorConfig: Record<string, { color: string; bg: string; label: string }> = {
  TELECOM: { color: 'var(--color-telecoms)', bg: 'var(--color-telecoms-bg)', label: 'Telecoms' },
  TELECOMMUNICATIONS: { color: 'var(--color-telecoms)', bg: 'var(--color-telecoms-bg)', label: 'Telecoms' },
  BROADCASTING: { color: 'var(--color-broadcast)', bg: 'var(--color-broadcast-bg)', label: 'Broadcasting' },
  INTERNET: { color: 'var(--color-internet)', bg: 'var(--color-internet-bg)', label: 'Internet' },
  POSTAL: { color: 'var(--color-postal)', bg: 'var(--color-postal-bg)', label: 'Postal' },
}

export default function SectorBadge({ sector }: { sector: string | null | undefined }) {
  const key = (sector || '').toUpperCase()
  const config = sectorConfig[key] || { color: 'var(--color-accent)', bg: 'rgba(79,195,247,0.15)', label: sector || 'Unknown' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 8px', borderRadius: '4px',
      backgroundColor: config.bg, color: config.color,
      fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: config.color, flexShrink: 0 }} />
      {config.label}
    </span>
  )
}
