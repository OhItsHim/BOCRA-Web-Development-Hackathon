import React from 'react'

const statusConfig: Record<string, { color: string; bg: string }> = {
  OPEN: { color: '#F9A825', bg: 'rgba(249,168,37,0.15)' },
  PENDING: { color: '#F9A825', bg: 'rgba(249,168,37,0.15)' },
  IN_PROGRESS: { color: '#4FC3F7', bg: 'rgba(79,195,247,0.15)' },
  UNDER_REVIEW: { color: '#4FC3F7', bg: 'rgba(79,195,247,0.15)' },
  RESOLVED: { color: '#2E7D32', bg: 'rgba(46,125,50,0.15)' },
  APPROVED: { color: '#2E7D32', bg: 'rgba(46,125,50,0.15)' },
  ACTIVE: { color: '#2E7D32', bg: 'rgba(46,125,50,0.15)' },
  CLOSED: { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.07)' },
  REJECTED: { color: '#B71C1C', bg: 'rgba(183,28,28,0.15)' },
  SUSPENDED: { color: '#B71C1C', bg: 'rgba(183,28,28,0.15)' },
  ESCALATED: { color: '#FF7043', bg: 'rgba(255,112,67,0.15)' },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status?.toUpperCase()] || { color: 'var(--text-secondary)', bg: 'var(--bg-elevated)' }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: '4px',
      backgroundColor: config.bg, color: config.color,
      fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
