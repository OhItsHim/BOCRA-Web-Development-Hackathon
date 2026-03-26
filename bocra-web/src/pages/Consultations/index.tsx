import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { consultationsApi } from '../../api/endpoints/consultations'
import PageHero from '../../components/common/PageHero'
import SectorBadge from '../../components/common/SectorBadge'
import SkeletonCard from '../../components/common/SkeletonCard'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06 } }),
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = React.useState(() => getTimeLeft(endDate))

  React.useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 1000)
    return () => clearInterval(id)
  }, [endDate])

  function getTimeLeft(end: string) {
    const diff = new Date(end).getTime() - Date.now()
    if (diff <= 0) return null
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { d, h, m, s }
  }

  if (!timeLeft) return <span style={{ color: '#ef5350', fontSize: '0.8rem', fontWeight: 600 }}>CLOSED</span>

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {[{ v: timeLeft.d, l: 'd' }, { v: timeLeft.h, l: 'h' }, { v: timeLeft.m, l: 'm' }, { v: timeLeft.s, l: 's' }].map(({ v, l }) => (
        <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{
            fontSize: '1rem', fontWeight: 700, color: 'var(--color-accent)',
            fontFamily: 'var(--font-mono)',
            minWidth: 28, textAlign: 'center',
          }}>
            {String(v).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{l}</span>
        </div>
      ))}
    </div>
  )
}

export default function ConsultationsPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => consultationsApi.list().then((r) => r.data),
  })

  const items = (data?.consultations || data || []) as any[]
  const filtered = items.filter((c: any) => {
    if (filter === 'all') return true
    if (filter === 'open') return c.status?.toUpperCase() === 'OPEN'
    return c.status?.toUpperCase() !== 'OPEN'
  })

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-BW', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <a href="#main-content" style={{
        position: 'absolute', top: '-40px', left: 0,
        background: 'var(--color-accent)', color: '#000', padding: '8px', zIndex: 100,
      }}>Skip to content</a>

      <PageHero
        title="Public Consultations"
        subtitle="Participate in regulatory consultations and help shape Botswana's communications landscape"
        sector="INTERNET"
      />

      <main id="main-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            backgroundColor: 'rgba(79,195,247,0.08)',
            border: '1px solid rgba(79,195,247,0.2)',
            borderRadius: '12px', padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
            display: 'flex', alignItems: 'flex-start', gap: '1rem',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10" stroke="var(--color-accent)" strokeWidth="2" />
            <path d="M12 16v-4M12 8h.01" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Your input matters
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              BOCRA values public participation in the regulatory process. Submit your comments and views on open consultations before their closing dates.
            </p>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid',
                borderColor: filter === f ? 'var(--color-accent)' : 'var(--border-default)',
                backgroundColor: filter === f ? 'rgba(79,195,247,0.12)' : 'var(--bg-surface)',
                color: filter === f ? 'var(--color-accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                textTransform: 'capitalize', transition: 'all 0.15s',
              }}
            >
              {f === 'all' ? 'All' : f === 'open' ? '🟢 Open' : '⚫ Closed'}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>
            {filtered.length} consultation{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>No consultations found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((c: any, i: number) => {
              const isOpen = c.status?.toUpperCase() === 'OPEN'
              const progressPct = (() => {
                const start = new Date(c.start_date).getTime()
                const end = new Date(c.end_date).getTime()
                const now = Date.now()
                if (now >= end) return 100
                if (now <= start) return 0
                return Math.round(((now - start) / (end - start)) * 100)
              })()

              return (
                <motion.div
                  key={c.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  style={{
                    backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
                    border: `1px solid ${isOpen ? 'rgba(46,125,50,0.2)' : 'var(--border-subtle)'}`,
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                          backgroundColor: isOpen ? 'rgba(46,125,50,0.15)' : 'var(--bg-elevated)',
                          color: isOpen ? '#a5d6a7' : 'var(--text-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {c.status}
                        </span>
                        {c.sector && <SectorBadge sector={c.sector} />}
                      </div>

                      <h2 style={{
                        fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)',
                        lineHeight: 1.4, marginBottom: '0.5rem',
                      }}>
                        {c.title}
                      </h2>

                      <p style={{
                        fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                        marginBottom: '1rem',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {c.description}
                      </p>

                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Open: {formatDate(c.start_date)}</span>
                        <span>Close: {formatDate(c.end_date)}</span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{
                          height: 4, borderRadius: 2, backgroundColor: 'var(--bg-elevated)',
                          overflow: 'hidden',
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              backgroundColor: isOpen ? 'var(--color-internet)' : 'var(--text-muted)',
                            }}
                          />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {progressPct}% of consultation period elapsed
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                      {isOpen && <CountdownTimer endDate={c.end_date} />}

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {c.document_url && (
                          <a
                            href={c.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.8rem',
                              border: '1px solid var(--border-default)', color: 'var(--text-secondary)',
                              textDecoration: 'none', fontWeight: 500,
                            }}
                          >
                            Document
                          </a>
                        )}
                        <Link
                          to={`/consultations/${c.id}`}
                          style={{
                            padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.8rem',
                            backgroundColor: isOpen ? 'var(--color-internet)' : 'var(--bg-elevated)',
                            color: isOpen ? '#fff' : 'var(--text-muted)',
                            textDecoration: 'none', fontWeight: 600,
                          }}
                        >
                          {isOpen ? 'Submit Views' : 'View Details'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
