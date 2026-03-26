import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { consultationsApi } from '../../api/endpoints/consultations'
import SectorBadge from '../../components/common/SectorBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useToast } from '../../hooks/useToast'

const schema = z.object({
  organization: z.string().optional(),
  submission: z.string().min(50, 'Submission must be at least 50 characters'),
})
type FormData = z.infer<typeof schema>

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToast } = useToast()
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })

  const consultation = data?.consultation || data

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const submissionText = watch('submission', '')
  const isOpen = consultation?.status?.toUpperCase() === 'OPEN'
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-BW', { day: 'numeric', month: 'long', year: 'numeric' })

  const onSubmit = async (values: FormData) => {
    try {
      await consultationsApi.submit(id!, values)
      setSubmitted(true)
      addToast('Your submission has been received. Thank you for participating.', 'success')
    } catch {
      addToast('Failed to submit. Please try again.', 'error')
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (isError || !consultation) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--text-muted)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Consultation Not Found</h1>
        <Link to="/consultations" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Consultations
        </Link>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <a href="#main-content" style={{
        position: 'absolute', top: '-40px', left: 0,
        background: 'var(--color-accent)', color: '#000', padding: '8px', zIndex: 100,
      }}>Skip to content</a>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-overlay) 0%, var(--bg-base) 100%)',
        padding: '5rem 1.5rem 3rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Link to="/consultations" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1.5rem',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All Consultations
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                backgroundColor: isOpen ? 'rgba(46,125,50,0.15)' : 'var(--bg-elevated)',
                color: isOpen ? '#a5d6a7' : 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {consultation.status}
              </span>
              {consultation.sector && <SectorBadge sector={consultation.sector} />}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '1rem',
            }}>
              {consultation.title}
            </h1>

            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span>Open: <strong style={{ color: 'var(--text-secondary)' }}>{formatDate(consultation.start_date)}</strong></span>
              <span>Close: <strong style={{ color: isOpen ? '#ef5350' : 'var(--text-secondary)' }}>{formatDate(consultation.end_date)}</strong></span>
            </div>
          </motion.div>
        </div>
      </div>

      <main id="main-content" style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }}>
        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
            border: '1px solid var(--border-subtle)', padding: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            About This Consultation
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {consultation.description}
          </p>
          {consultation.document_url && (
            <a
              href={consultation.document_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem',
                padding: '0.6rem 1.2rem', borderRadius: '8px',
                backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Download Consultation Document
            </a>
          )}
        </motion.div>

        {/* Submission form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
            border: `1px solid ${isOpen ? 'rgba(46,125,50,0.25)' : 'var(--border-subtle)'}`,
            padding: '2rem',
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 1rem', display: 'block' }}>
                <circle cx="12" cy="12" r="10" fill="rgba(46,125,50,0.15)" />
                <path d="M8 12l3 3 5-5" stroke="#a5d6a7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Submission Received
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Thank you for your input. BOCRA will consider all submissions before publishing the final regulatory decision.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {isOpen ? 'Submit Your Views' : 'Consultation Closed'}
              </h2>
              {!isOpen && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  This consultation has closed. Submissions are no longer accepted.
                </p>
              )}

              {isOpen && (
                <form onSubmit={handleSubmit(onSubmit)} aria-label="Consultation submission form">
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    All submissions are treated as public documents unless you request confidentiality.
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="organization" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Organisation (optional)
                    </label>
                    <input
                      id="organization"
                      {...register('organization')}
                      placeholder="Your company or organisation"
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                        border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="submission" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Your Submission <span style={{ color: '#ef5350' }}>*</span>
                    </label>
                    <textarea
                      id="submission"
                      {...register('submission')}
                      rows={8}
                      placeholder="Enter your detailed submission here (minimum 50 characters)..."
                      aria-describedby={errors.submission ? 'submission-error' : undefined}
                      style={{
                        width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                        border: `1px solid ${errors.submission ? '#ef5350' : 'var(--border-default)'}`,
                        backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)',
                        fontSize: '0.9rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                        lineHeight: 1.7,
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      {errors.submission && (
                        <p id="submission-error" style={{ color: '#ef5350', fontSize: '0.8rem' }}>
                          {errors.submission.message}
                        </p>
                      )}
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {submissionText.length} chars {submissionText.length < 50 && `(${50 - submissionText.length} more needed)`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '0.75rem 2rem', borderRadius: '8px', border: 'none',
                      backgroundColor: 'var(--color-internet)', color: '#fff',
                      fontSize: '0.9rem', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 0.2s',
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Views'}
                  </button>
                </form>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
