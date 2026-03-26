import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PageHero from '../../components/common/PageHero'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import SectorBadge from '../../components/common/SectorBadge'
import { publicationsApi } from '../../api/endpoints/publications'
import { formatDate, formatFileSize } from '../../utils/formatters'

export default function PublicationDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: pub, isLoading } = useQuery({
    queryKey: ['publication', id],
    queryFn: () => publicationsApi.get(id!).then(r => r.data),
    enabled: !!id,
  })

  if (isLoading) return <LoadingSpinner />
  if (!pub) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Publication not found.</div>

  return (
    <div>
      <PageHero title={pub.title} sector={pub.sector} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <SectorBadge sector={pub.sector} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: '4px' }}>{String(pub.type || '').replace(/_/g, ' ')}</span>
          </div>
          {pub.description && <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>{pub.description}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              ['Published', formatDate(pub.published_at)],
              ['File Size', formatFileSize(pub.file_size)],
              ['Views', pub.views?.toLocaleString() || '0'],
              ['Downloads', pub.downloads?.toLocaleString() || '0'],
            ].map(([label, value]) => (
              <div key={label} style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
          {pub.file_url ? (
            <a href={pub.file_url} download style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', backgroundColor: '#1565C0', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
              ⬇ Download Document
            </a>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Document not yet available for download.</div>
          )}
        </div>
        <div style={{ marginTop: '16px' }}>
          <Link to="/publications" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Publications</Link>
        </div>
      </div>
    </div>
  )
}
