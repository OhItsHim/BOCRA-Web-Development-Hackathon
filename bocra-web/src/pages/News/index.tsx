import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { newsApi } from '../../api/endpoints/news'
import PageHero from '../../components/common/PageHero'
import SectorBadge from '../../components/common/SectorBadge'
import SkeletonCard from '../../components/common/SkeletonCard'

const SECTORS = ['All', 'TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL']
const CATEGORIES = ['All', 'Announcement', 'Press Release', 'Advisory', 'Event', 'Consultation']

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.05 } }),
}

export default function NewsPage() {
  const [sector, setSector] = useState('All')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['news', sector, category],
    queryFn: () =>
      newsApi.list({
        ...(sector !== 'All' && { sector }),
        ...(category !== 'All' && { category }),
      }).then((r) => r.data),
  })

  const articles = (data?.articles || data || []) as any[]
  const filtered = articles.filter((a: any) =>
    search === '' ||
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.excerpt?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-BW', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link" style={{
        position: 'absolute', top: '-40px', left: 0, background: 'var(--color-accent)',
        color: '#000', padding: '8px', zIndex: 100,
        ':focus': { top: 0 },
      }}>Skip to content</a>

      <PageHero
        title="News & Updates"
        subtitle="Stay informed with the latest regulatory news, press releases, and advisories from BOCRA"
        sector="TELECOM"
      />

      <main id="main-content" style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Search + Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          <input
            type="search"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search news articles"
            style={{
              padding: '0.75rem 1rem', borderRadius: '8px',
              border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
              width: '100%', maxWidth: 480,
            }}
          />

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {SECTORS.map((s) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid',
                  borderColor: sector === s ? 'var(--color-accent)' : 'var(--border-default)',
                  backgroundColor: sector === s ? 'rgba(79,195,247,0.15)' : 'var(--bg-surface)',
                  color: sector === s ? 'var(--color-accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                {s === 'All' ? 'All Sectors' : s}
              </button>
            ))}
            <div style={{ width: 1, backgroundColor: 'var(--border-subtle)', margin: '0 0.5rem' }} />
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid',
                  borderColor: category === c ? '#F9A825' : 'var(--border-default)',
                  backgroundColor: category === c ? 'rgba(249,168,37,0.1)' : 'var(--bg-surface)',
                  color: category === c ? '#F9A825' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>No articles found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {filtered.map((article: any, i: number) => (
              <motion.article
                key={article.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                style={{
                  backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)', overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {article.featured_image_url ? (
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: 200,
                    background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-overlay))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" opacity={0.3}>
                      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM3 9h18M9 21V9" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {article.sector && <SectorBadge sector={article.sector} />}
                    {article.category && (
                      <span style={{
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)',
                        fontWeight: 500, textTransform: 'uppercase',
                      }}>
                        {article.category}
                      </span>
                    )}
                  </div>

                  <h2 style={{
                    fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
                    lineHeight: 1.4, marginBottom: '0.5rem',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {article.title}
                  </h2>

                  {article.excerpt && (
                    <p style={{
                      fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                      marginBottom: '1rem',
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {article.excerpt}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                    <Link
                      to={`/news/${article.slug}`}
                      style={{
                        fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600,
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem',
                      }}
                    >
                      Read more
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
