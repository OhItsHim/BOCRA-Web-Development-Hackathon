import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageHero from '../../components/common/PageHero'
import { complaintsApi } from '../../api/endpoints/complaints'

const SESSION_KEY = 'bocra-complaint-draft'

const steps = ['Identity', 'Category', 'Details', 'Evidence', 'Review']

const sectorOptions = ['TELECOM', 'BROADCASTING', 'POSTAL', 'INTERNET']
const categoryOptions = ['BILLING', 'COVERAGE', 'SERVICE_QUALITY', 'CONTENT', 'SPAM', 'OTHER']

const stepSchemas = [
  z.object({ anonymous: z.boolean() }),
  z.object({ sector: z.string().min(1, 'Sector required'), category: z.string().min(1, 'Category required') }),
  z.object({ description: z.string().min(50, 'Describe your complaint in at least 50 characters'), resolution_preference: z.string().optional() }),
  z.object({ contact_email: z.string().email('Valid email required').or(z.literal('')) }),
  z.object({ declaration: z.boolean().refine(v => v === true, 'You must agree to the declaration') }),
]

export default function Complaint() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}') } catch { return {} }
  })
  const [submitted, setSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(stepSchemas[step]),
    defaultValues: formData,
  })

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(formData))
  }, [formData])

  const onNext = (data: Record<string, unknown>) => {
    const updated = { ...formData, ...data }
    setFormData(updated)
    if (step < steps.length - 1) setStep(s => s + 1)
  }

  const onSubmit = async () => {
    setLoading(true); setError('')
    try {
      const res = await complaintsApi.create({
        category: formData.category,
        sector: formData.sector,
        description: formData.description,
        priority: 'MEDIUM',
        contact_email: formData.contact_email,
      })
      setTicketNumber(res.data.ticket_number)
      setSubmitted(true)
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      setError('Failed to submit complaint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div>
        <PageHero title="Complaint Submitted" />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid rgba(46,125,50,0.3)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>Complaint Received</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px' }}>Your complaint has been submitted successfully. Use your ticket number to track progress.</p>
            <div style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ticket Number</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)' }}>{ticketNumber}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/consumer/track')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1565C0', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Track Complaint</button>
              <button onClick={() => navigate('/')} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Home</button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHero title="File a Complaint" subtitle="Report issues with licensed telecommunications, broadcasting, postal, or internet service providers." />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '100%', height: '3px', borderRadius: '2px', backgroundColor: i <= step ? '#B71C1C' : 'var(--border-default)' }} />
              <span style={{ fontSize: '0.65rem', color: i <= step ? '#B71C1C' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <form onSubmit={handleSubmit(data => step === steps.length - 1 ? onSubmit() : onNext(data as Record<string, unknown>))}>
              <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '32px', marginBottom: '16px' }}>

                {/* Step 0: Identity */}
                {step === 0 && (
                  <div>
                    <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>How would you like to submit?</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[
                        { value: true, label: 'Anonymously', desc: 'Your identity is not recorded', icon: '👤' },
                        { value: false, label: 'With my account', desc: 'Login for status updates', icon: '🔐' },
                      ].map(opt => (
                        <div
                          key={String(opt.value)}
                          onClick={() => setValue('anonymous', opt.value)}
                          style={{
                            padding: '20px', borderRadius: '10px', cursor: 'pointer',
                            border: `2px solid ${watch('anonymous') === opt.value ? '#B71C1C' : 'var(--border-default)'}`,
                            backgroundColor: watch('anonymous') === opt.value ? 'rgba(183,28,28,0.08)' : 'var(--bg-base)',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{opt.icon}</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{opt.label}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt.desc}</div>
                        </div>
                      ))}
                    </div>
                    <input type="hidden" {...register('anonymous')} />
                  </div>
                )}

                {/* Step 1: Category */}
                {step === 1 && (
                  <div>
                    <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>What is the complaint about?</h3>
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="sector" style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>Sector *</label>
                      <select id="sector" {...register('sector')} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${errors.sector ? '#B71C1C' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        <option value="">Select sector...</option>
                        {sectorOptions.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                      </select>
                      {errors.sector && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', margin: '4px 0 0' }}>{String(errors.sector.message)}</p>}
                    </div>
                    <div>
                      <label htmlFor="category" style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>Category *</label>
                      <select id="category" {...register('category')} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${errors.category ? '#B71C1C' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        <option value="">Select category...</option>
                        {categoryOptions.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                      </select>
                      {errors.category && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', margin: '4px 0 0' }}>{String(errors.category.message)}</p>}
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                  <div>
                    <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Describe your complaint</h3>
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="description" style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>Description * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(minimum 50 characters)</span></label>
                      <textarea
                        id="description" {...register('description')} rows={6}
                        placeholder="Describe your complaint in detail. Include dates, amounts, and what you expected vs what happened..."
                        defaultValue={formData.description as string || ''}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${errors.description ? '#B71C1C' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        {errors.description && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', margin: 0 }}>{String(errors.description.message)}</p>}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{String(watch('description') || '').length} chars</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="resolution_preference" style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>Resolution Preference</label>
                      <select id="resolution_preference" {...register('resolution_preference')} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        <option value="">Select preference...</option>
                        <option value="REFUND">Refund / Compensation</option>
                        <option value="SERVICE_FIX">Service Fixed</option>
                        <option value="EXPLANATION">Formal Explanation</option>
                        <option value="ENFORCEMENT">Regulatory Action</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 3: Evidence */}
                {step === 3 && (
                  <div>
                    <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Evidence & Contact</h3>
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="contact_email" style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>Contact Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(for status updates)</span></label>
                      <input id="contact_email" {...register('contact_email')} type="email" placeholder="your@email.com" defaultValue={formData.contact_email as string || ''} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${errors.contact_email ? '#B71C1C' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                      {errors.contact_email && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', margin: '4px 0 0' }}>{String(errors.contact_email.message)}</p>}
                    </div>
                    <div style={{ border: '2px dashed var(--border-default)', borderRadius: '10px', padding: '32px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📎</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Drag and drop files here, or click to upload</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>PDF, JPG, PNG — max 5MB each</div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                  <div>
                    <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Review & Submit</h3>
                    <div style={{ backgroundColor: 'var(--bg-base)', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                      {[
                        ['Submission Type', formData.anonymous ? 'Anonymous' : 'With Account'],
                        ['Sector', formData.sector],
                        ['Category', String(formData.category || '').replace(/_/g, ' ')],
                        ['Contact', formData.contact_email || 'Not provided'],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', padding: '8px 0', fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{String(value || 'N/A')}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {String(formData.description || '')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <input type="checkbox" id="declaration" {...register('declaration')} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <label htmlFor="declaration" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                        I declare that the information provided is accurate and complete to the best of my knowledge. I understand that providing false information may result in my complaint being dismissed.
                      </label>
                    </div>
                    {errors.declaration && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', margin: '4px 0 0' }}>{String(errors.declaration.message)}</p>}
                    {error && <div style={{ backgroundColor: 'rgba(183,28,28,0.1)', border: '1px solid rgba(183,28,28,0.3)', borderRadius: '8px', padding: '12px', marginTop: '16px', color: '#ef9a9a', fontSize: '0.875rem' }}>{error}</div>}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1 }}>
                  Back
                </button>
                <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: step === steps.length - 1 ? '#B71C1C' : '#1565C0', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Submitting...' : step === steps.length - 1 ? 'Submit Complaint' : 'Next →'}
                </button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
