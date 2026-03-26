import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import PageHero from '../../components/common/PageHero'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { adminApi } from '../../api/endpoints/admin'
import { formatDate } from '../../utils/formatters'

const typeColor: Record<string, string> = { INFO: '#1565C0', WARNING: '#F9A825', ALERT: '#B71C1C' }

export default function Alerts() {
  const { data, isLoading } = useQuery({ queryKey: ['alerts'], queryFn: () => adminApi.getAlerts().then(r => r.data.data) })

  return (
    <div>
      <PageHero title="Consumer Alerts" subtitle="Current warnings, notices, and service updates from BOCRA." />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        {isLoading ? <LoadingSpinner /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(data || []).map((alert: Record<string, unknown>, i: number) => (
              <motion.div key={alert.id as string} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: `4px solid ${typeColor[alert.type as string] || '#4FC3F7'}`, borderRadius: '8px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: typeColor[alert.type as string] || '#4FC3F7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{alert.type as string}</span>
                      <SectorBadge sector={alert.sector as string} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(alert.created_at as string)}</span>
                  </div>
                  <h3 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>{alert.title as string}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{alert.message as string}</p>
                </div>
              </motion.div>
            ))}
            {(!data || data.length === 0) && (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No active alerts at this time.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
