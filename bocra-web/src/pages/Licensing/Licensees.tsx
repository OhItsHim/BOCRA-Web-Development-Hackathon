import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import PageHero from '../../components/common/PageHero'
import SectorBadge from '../../components/common/SectorBadge'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { licensesApi } from '../../api/endpoints/licenses'

export default function Licensees() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['licensees', page],
    queryFn: () => licensesApi.listLicensees({ page, per_page: 20 }).then(r => r.data),
  })

  const filtered = (data?.data || []).filter((l: Record<string, unknown>) =>
    !search || String(l.company_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHero title="Licensed Operators" subtitle="Directory of all licensed telecommunications, broadcasting, postal, and internet service providers in Botswana." />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by company name..."
            aria-label="Search licensees"
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%', maxWidth: '400px', boxSizing: 'border-box' }}
          />
        </div>
        {isLoading ? <LoadingSpinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filtered.map((l: Record<string, unknown>, i: number) => (
              <motion.div key={l.id as string} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <SectorBadge sector={l.sector as string} />
                    <StatusBadge status={l.status as string} />
                  </div>
                  <h3 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>{l.company_name as string}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>{l.license_number as string}</div>
                  {l.description && <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{String(l.description).slice(0, 100)}...</p>}
                  {l.website && <a href={l.website as string} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.775rem', color: 'var(--color-accent)', textDecoration: 'none' }}>Visit website →</a>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {data && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
            <span style={{ padding: '8px 16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Page {page} of {Math.ceil((data.total || 0) / 20)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= (data.total || 0)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
