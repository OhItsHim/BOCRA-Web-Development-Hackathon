import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminSidebar } from './Dashboard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { motion, AnimatePresence } from 'framer-motion'
import client from '../../api/client'

const SECTORS = ['ALL', 'TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL']

export default function AdminFAQ() {
  const { addToast } = useToast()
  const qc = useQueryClient()
  const [sectorFilter, setSectorFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({ question: '', answer: '', category: 'General', sector: 'TELECOM', sort_order: 0, is_published: true })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-faq', sectorFilter],
    queryFn: () => client.get('/faq', { params: sectorFilter !== 'ALL' ? { sector: sectorFilter } : {} }).then(r => r.data),
  })

  const items = (data?.faqs || data || []) as any[]

  const createMutation = useMutation({
    mutationFn: (d: typeof form) => client.post('/faq', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-faq'] })
      setShowCreate(false)
      setForm({ question: '', answer: '', category: 'General', sector: 'TELECOM', sort_order: 0, is_published: true })
      addToast('FAQ item created.', 'success')
    },
    onError: () => addToast('Failed to create FAQ item.', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/faq/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faq'] }); addToast('FAQ item deleted.', 'success') },
  })

  const inputStyle = { width: '100%', padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main id="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>FAQ Management</h1>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-internet)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>+ New FAQ</button>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSectorFilter(s)} style={{
              padding: '0.4rem 0.875rem', borderRadius: '20px', border: '1px solid',
              borderColor: sectorFilter === s ? 'var(--color-accent)' : 'var(--border-default)',
              backgroundColor: sectorFilter === s ? 'rgba(79,195,247,0.12)' : 'var(--bg-surface)',
              color: sectorFilter === s ? 'var(--color-accent)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
            }}>{s === 'ALL' ? 'All Sectors' : s}</button>
          ))}
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No FAQ items found.</p>
            ) : items.map((faq: any) => (
              <div key={faq.id} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                  style={{
                    width: '100%', padding: '1rem 1.25rem', background: 'none', border: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                  aria-expanded={expanded === faq.id}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{faq.question}</span>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '3px', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', fontWeight: 500 }}>{faq.category}</span>
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '3px', backgroundColor: 'rgba(79,195,247,0.1)', color: 'var(--color-accent)', fontWeight: 500 }}>{faq.sector}</span>
                      {!faq.is_published && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>DRAFT</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); if (confirm('Delete this FAQ?')) deleteMutation.mutate(faq.id) }}
                      style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: 'rgba(183,28,28,0.1)', color: '#ef9a9a', border: '1px solid rgba(183,28,28,0.2)', cursor: 'pointer' }}>
                      Delete
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-muted)', transform: expanded === faq.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
                <AnimatePresence>
                  {expanded === faq.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                      <p style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.875rem' }}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '2rem', maxWidth: 560, width: '100%' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>New FAQ Item</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="faq-q" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Question</label>
                  <input id="faq-q" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="faq-a" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Answer</label>
                  <textarea id="faq-a" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label htmlFor="faq-cat" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Category</label>
                    <input id="faq-cat" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Licensing" style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="faq-sector" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sector</label>
                    <select id="faq-sector" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={inputStyle}>
                      {['TELECOM', 'BROADCASTING', 'INTERNET', 'POSTAL'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                  Published
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-internet)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  {createMutation.isPending ? 'Creating...' : 'Create FAQ'}
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
