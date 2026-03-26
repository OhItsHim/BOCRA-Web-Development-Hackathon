import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import PageHero from '../../components/common/PageHero'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { publicationsApi } from '../../api/endpoints/publications'
import { formatDate, formatFileSize } from '../../utils/formatters'

export default function Publications() {
  const [page, setPage] = useState(1)
  const [sector, setSector] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['publications', page, sector],
    queryFn: () => publicationsApi.list({ page, per_page: 12, sector: sector || undefined }).then(r => r.data),
  })

  return (
    <div>
      <PageHero title="Publications" subtitle="Annual reports, guidelines, research, and regulatory documents from BOCRA." />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {['', 'TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL'].map(s => (
            <button key={s} onClick={() => { setSector(s); setPage(1) }} style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid',
              borderColor: sector === s ? 'var(--color-accent)' : 'var(--border-default)',
              backgroundColor: sector === s ? 'rgba(79,195,247,0.15)' : 'transparent',
              color: sector === s ? 'var(--color-accent)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
            }}>
              {s === '' ? 'All Sectors' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {isLoading ? <LoadingSpinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {(data?.data || []).map((pub: Record<string, unknown>, i: number) => (
              <motion.div key={pub.id as string} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/publications/${pub.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s', height: '100%', boxSizing: 'border-box' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <SectorBadge sector={pub.sector as string} />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>{String(pub.type || '').replace(/_/g, ' ')}</span>
                    </div>
                    <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4 }}>{pub.title as string}</h3>
                    {pub.description && <p style={{ margin: '0 0 12px', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{String(pub.description).slice(0, 100)}...</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>{formatDate(pub.published_at as string)}</span>
                      <span>{formatFileSize(pub.file_size as number)} · {pub.downloads as number} downloads</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        {data && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
            <span style={{ padding: '8px 16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 12 >= (data.total || 0)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
