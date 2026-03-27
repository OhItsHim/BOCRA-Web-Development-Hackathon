import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { newsApi } from '../../api/endpoints/news'
import { AdminSidebar } from './Dashboard'
import StatusBadge from '../../components/common/StatusBadge'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { motion } from 'framer-motion'

export default function AdminNews() {
  const { addToast } = useToast()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', category: 'Announcement', sector: 'TELECOM', tags: '', is_published: false })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news'],
    queryFn: () => newsApi.list().then(r => r.data),
  })

  const raw = data?.articles || data?.items || data?.data || data
  const articles = Array.isArray(raw) ? raw : []

  const createMutation = useMutation({
    mutationFn: (d: any) => newsApi.create({ ...d, tags: d.tags ? d.tags.split(',').map((t: string) => t.trim()) : [] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-news'] })
      setShowCreate(false)
      setForm({ title: '', slug: '', content: '', excerpt: '', category: 'Announcement', sector: 'TELECOM', tags: '', is_published: false })
      addToast('Article created.', 'success')
    },
    onError: () => addToast('Failed to create article.', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => newsApi.delete(slug),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-news'] }); addToast('Article deleted.', 'success') },
  })

  const inputStyle = { width: '100%', padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>News Articles</h1>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#F9A825', color: '#000', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>+ New Article</button>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="News articles table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}>
                  {['Title', 'Sector', 'Category', 'Published', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No articles yet.</td></tr>
                ) : articles.map((a: any) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1rem', maxWidth: 320 }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{a.title}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.slug}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>{a.sector && <SectorBadge sector={a.sector} />}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.category}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: a.is_published ? 'rgba(46,125,50,0.15)' : 'var(--bg-elevated)', color: a.is_published ? '#a5d6a7' : 'var(--text-muted)', fontWeight: 600 }}>
                        {a.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button onClick={() => { if (confirm('Delete this article?')) deleteMutation.mutate(a.slug) }}
                        style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(183,28,28,0.1)', color: '#ef9a9a', border: '1px solid rgba(183,28,28,0.2)', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showCreate && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }} role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '2rem', maxWidth: 620, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>New Article</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="n-title" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Title</label>
                  <input id="n-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="n-slug" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Slug</label>
                  <input id="n-slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
                </div>
                <div>
                  <label htmlFor="n-excerpt" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Excerpt</label>
                  <textarea id="n-excerpt" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label htmlFor="n-content" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Content</label>
                  <textarea id="n-content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label htmlFor="n-category" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Category</label>
                    <select id="n-category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                      {['Announcement', 'Press Release', 'Advisory', 'Event', 'Consultation'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="n-sector" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sector</label>
                    <select id="n-sector" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={inputStyle}>
                      {['TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="n-tags" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tags (comma-separated)</label>
                  <input id="n-tags" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="spectrum, 5G, licensing" style={inputStyle} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                  Publish immediately
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#F9A825', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                  {createMutation.isPending ? 'Creating...' : 'Create Article'}
                </button>
                <button onClick={() => setShowCreate(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
