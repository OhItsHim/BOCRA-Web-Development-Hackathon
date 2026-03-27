import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PageHero from '../components/common/PageHero'
import SkeletonCard from '../components/common/SkeletonCard'
import SectorBadge from '../components/common/SectorBadge'
import StatusBadge from '../components/common/StatusBadge'

const FILTER_PILLS = ['All', 'News', 'Publications', 'Advisories', 'Consultations', 'Licensees'] as const
type FilterPill = typeof FILTER_PILLS[number]

interface SearchResult {
  id: string
  title: string
  excerpt: string
  type: string
  sector?: string
  date?: string
  url?: string
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  pages: number
}

function highlightText(text: string, keyword: string): React.ReactNode {
  if (!keyword.trim()) return text
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedKeyword})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase()
      ? <mark key={i} style={{ backgroundColor: 'rgba(79,195,247,0.25)', color: 'var(--color-accent)', fontWeight: 600, borderRadius: '2px', padding: '0 1px' }}>{part}</mark>
      : part
  )
}

const EmptySVG = () => (
  <svg viewBox="0 0 200 160" width="160" height="128" style={{ opacity: 0.35 }}>
    {Array.from({ length: 8 }, (_, i) => {
      const cx = 25 + i * 22
      const cy = 80 + Math.sin(i) * 30
      return <circle key={i} cx={cx} cy={cy} r="3" fill="var(--color-accent)" />
    })}
    {Array.from({ length: 7 }, (_, i) => {
      const x1 = 25 + i * 22
      const y1 = 80 + Math.sin(i) * 30
      const x2 = 25 + (i + 1) * 22
      const y2 = 80 + Math.sin(i + 1) * 30
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-accent)" strokeWidth="1" />
    })}
    <circle cx="100" cy="60" r="28" stroke="var(--text-muted)" strokeWidth="1.5" fill="none" />
    <line x1="120" y1="80" x2="140" y2="100" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
    <line x1="88" y1="52" x2="112" y2="52" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="88" y1="60" x2="112" y2="60" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(q)
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterPill>('All')

  const doSearch = useCallback(async (query: string, pageNum: number) => {
    if (!query.trim()) { setResponse(null); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}&page=${pageNum}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setResponse(data)
    } catch {
      setError('Search failed. Please try again.')
      // Provide mock results so the page is demonstrable
      setResponse({
        results: [],
        total: 0,
        page: pageNum,
        pages: 1,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setInputValue(q)
    setPage(1)
    setActiveFilter('All')
    doSearch(q, 1)
  }, [q, doSearch])

  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const filteredResults = useMemo(() => {
    if (!response?.results) return []
    if (activeFilter === 'All') return response.results
    return response.results.filter(r =>
      r.type?.toLowerCase() === activeFilter.toLowerCase()
    )
  }, [response, activeFilter])

  // Group by type
  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    filteredResults.forEach(r => {
      const key = r.type || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    })
    return map
  }, [filteredResults])

  const totalPages = response?.pages || 1

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    padding: '11px 16px',
    outline: 'none',
    flex: 1,
    minWidth: 0,
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <PageHero
        title="Search Results"
        subtitle={q ? `Showing results for "${q}"` : 'Search the BOCRA resource centre'}
      />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Search bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="search"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for documents, news, services…"
            aria-label="Search query"
            style={inputStyle}
          />
          <button
            onClick={handleSearch}
            aria-label="Search"
            style={{
              padding: '11px 20px', backgroundColor: 'var(--color-telecoms)',
              color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search
          </button>
        </div>

        {/* Filter pills */}
        {q && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {FILTER_PILLS.map(pill => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `1px solid ${activeFilter === pill ? 'var(--color-accent)' : 'var(--border-default)'}`,
                  backgroundColor: activeFilter === pill ? 'rgba(79,195,247,0.12)' : 'transparent',
                  color: activeFilter === pill ? 'var(--color-accent)' : 'var(--text-secondary)',
                  fontSize: '0.82rem', fontWeight: activeFilter === pill ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {pill}
              </button>
            ))}
          </div>
        )}

        {/* Empty q state */}
        {!q && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <EmptySVG />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '20px 0 8px' }}>
              What are you looking for?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Use the search bar above to find publications, news, advisories, and more.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && q && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SkeletonCard count={5} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            backgroundColor: 'var(--color-postal-bg)', border: '1px solid var(--color-postal)',
            borderRadius: '12px', padding: '20px', color: 'var(--color-postal-light)', marginBottom: '24px',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {!loading && q && response && (
          <>
            {filteredResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                <EmptySVG />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '20px 0 8px' }}>
                  No results found for "{q}"
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 8px' }}>
                  Try using broader or different search terms.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
                  e.g. "spectrum" instead of "spectrum management review 2023"
                </p>
              </div>
            ) : (
              <>
                {Array.from(grouped.entries()).map(([type, items]) => (
                  <div key={type} style={{ marginBottom: '36px' }}>
                    {/* Group header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      marginBottom: '16px', paddingBottom: '10px',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}>
                      <h3 style={{
                        fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
                        fontWeight: 700, color: 'var(--text-primary)', margin: 0,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{type}</h3>
                      <span style={{
                        padding: '2px 8px', borderRadius: '12px',
                        backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)',
                        fontSize: '0.75rem', fontWeight: 600,
                      }}>{items.length}</span>
                    </div>

                    {/* Result cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map(result => (
                        <article
                          key={result.id}
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '12px',
                            padding: '20px 24px',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <StatusBadge status={result.type?.toUpperCase() || 'OTHER'} />
                            {result.sector && <SectorBadge sector={result.sector} />}
                          </div>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                            {result.url
                              ? <Link to={result.url} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{result.title}</Link>
                              : result.title
                            }
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 10px', lineHeight: 1.6 }}>
                            {highlightText(result.excerpt || '', q)}
                          </p>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                            {result.date && <span>{new Date(result.date).toLocaleDateString('en-BW', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                            {result.sector && <span>Sector: {result.sector}</span>}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
                    <button
                      onClick={() => { const p = Math.max(1, page - 1); setPage(p); doSearch(q, p) }}
                      disabled={page <= 1}
                      style={{
                        padding: '8px 18px', borderRadius: '8px',
                        border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)',
                        color: page <= 1 ? 'var(--text-hint)' : 'var(--text-primary)',
                        cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500,
                      }}
                    >
                      ← Previous
                    </button>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); doSearch(q, p) }}
                      disabled={page >= totalPages}
                      style={{
                        padding: '8px 18px', borderRadius: '8px',
                        border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)',
                        color: page >= totalPages ? 'var(--text-hint)' : 'var(--text-primary)',
                        cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500,
                      }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
