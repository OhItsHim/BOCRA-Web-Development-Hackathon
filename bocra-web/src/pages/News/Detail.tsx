import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { newsApi } from '../../api/endpoints/news'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['news', slug],
    queryFn: () => newsApi.get(slug!).then((r) => r.data),
    enabled: !!slug,
  })

  const article = data?.article || data

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-BW', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

  if (isLoading) return <LoadingSpinner />

  if (isError || !article) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--text-muted)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Article Not Found</h1>
        <Link to="/news" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to News
        </Link>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <a href="#main-content" style={{
        position: 'absolute', top: '-40px', left: 0, background: 'var(--color-accent)',
        color: '#000', padding: '8px', zIndex: 100,
      }}>Skip to content</a>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-overlay) 0%, var(--bg-base) 100%)',
        padding: '5rem 1.5rem 3rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <Link to="/news" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to News
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {article.sector && <SectorBadge sector={article.sector} />}
              {article.category && (
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px',
                  backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)',
                  fontWeight: 600, textTransform: 'uppercase',
                }}>
                  {article.category}
                </span>
              )}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '1rem',
            }}>
              {article.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span>{formatDate(article.published_at || article.created_at)}</span>
              {article.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {article.tags.map((tag: string) => (
                    <span key={tag} style={{
                      fontSize: '0.72rem', padding: '2px 8px', borderRadius: '20px',
                      border: '1px solid var(--border-default)', color: 'var(--text-secondary)',
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <main id="main-content" style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {article.featured_image_url && (
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            src={article.featured_image_url}
            alt={article.title}
            style={{
              width: '100%', borderRadius: '12px',
              marginBottom: '2rem', display: 'block',
              border: '1px solid var(--border-subtle)',
            }}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {article.excerpt && (
            <p style={{
              fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7,
              marginBottom: '2rem', paddingBottom: '2rem',
              borderBottom: '1px solid var(--border-subtle)',
              fontStyle: 'italic',
            }}>
              {article.excerpt}
            </p>
          )}

          <div style={{
            color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem',
            whiteSpace: 'pre-wrap',
          }}>
            {article.content}
          </div>
        </motion.div>

        {/* Share / back */}
        <div style={{
          marginTop: '3rem', paddingTop: '2rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        }}>
          <Link to="/news" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All News
          </Link>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
              }}
            >
              Copy Link
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
