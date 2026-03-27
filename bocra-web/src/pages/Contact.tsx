import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PageHero from '../components/common/PageHero'

const SUBJECTS = [
  'General Enquiry',
  'Licensing',
  'Consumer Complaint',
  'Media / Press',
  'Spectrum',
  'Other',
]

const DEPARTMENTS = [
  { name: 'Licensing', email: 'licensing@bocra.org.bw', ext: '101' },
  { name: 'Consumer Affairs', email: 'consumer@bocra.org.bw', ext: '102' },
  { name: 'ICT & Internet', email: 'ict@bocra.org.bw', ext: '103' },
  { name: 'Legal', email: 'legal@bocra.org.bw', ext: '104' },
  { name: 'Media & Communications', email: 'media@bocra.org.bw', ext: '105' },
  { name: 'Spectrum Management', email: 'spectrum@bocra.org.bw', ext: '106' },
]

function generateCaptcha() {
  const x = Math.floor(Math.random() * 9) + 1
  const y = Math.floor(Math.random() * 9) + 1
  return { x, y, answer: x + y }
}

const buildSchema = (captchaAnswer: number) =>
  z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    subject: z.string().min(1, 'Please select a subject'),
    message: z.string().min(20, 'Message must be at least 20 characters'),
    captcha: z.string()
      .min(1, 'Please answer the CAPTCHA')
      .refine(val => parseInt(val, 10) === captchaAnswer, 'Incorrect answer — please try again'),
  })

type ContactFormData = {
  fullName: string
  email: string
  subject: string
  message: string
  captcha: string
}

const MapPlaceholder = () => (
  <div style={{
    position: 'relative',
    backgroundColor: 'var(--bg-overlay)',
    borderRadius: '12px',
    overflow: 'hidden',
    height: '220px',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '10px',
  }}>
    {/* Connectivity web SVG */}
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }} viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 12 }, (_, i) => {
        const cx = (i * 47) % 400
        const cy = (i * 31 + Math.sin(i) * 40 + 110) % 220
        return <circle key={i} cx={cx} cy={cy} r="3" fill="var(--color-accent)" />
      })}
      {Array.from({ length: 15 }, (_, i) => {
        const x1 = (i * 37) % 400
        const y1 = (i * 19) % 220
        const x2 = (i * 37 + 80) % 400
        const y2 = (i * 19 + 50) % 220
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-accent)" strokeWidth="0.5" />
      })}
    </svg>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" style={{ opacity: 0.7 }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', padding: '0 16px', position: 'relative' }}>
      Plot 50671 Independence Avenue, Gaborone
    </span>
  </div>
)

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '8px',
      backgroundColor: 'var(--color-telecoms-bg)', color: 'var(--color-telecoms-light)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</div>
      <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{value}</div>
    </div>
  </div>
)

export default function Contact() {
  const [captcha, setCaptcha] = useState(() => generateCaptcha())
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [refNumber, setRefNumber] = useState('')
  const refreshedRef = useRef(false)

  const schema = buildSchema(captcha.answer)

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
  })

  // Regenerate captcha on mount (only once)
  useEffect(() => {
    if (!refreshedRef.current) {
      setCaptcha(generateCaptcha())
      refreshedRef.current = true
    }
  }, [])

  const refreshCaptcha = () => setCaptcha(generateCaptcha())

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus('loading')
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.fullName,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }),
      })
      const json = await res.json().catch(() => ({}))
      setRefNumber(json?.reference || `BOC-${Date.now().toString().slice(-8)}`)
      setSubmitStatus('success')
      reset()
      setCaptcha(generateCaptcha())
    } catch {
      setSubmitStatus('error')
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <PageHero
        title="Contact Us"
        subtitle="Reach the Botswana Communications Regulatory Authority. We're here to assist with licensing, consumer matters, spectrum, and more."
        sector="PUBLIC SERVICE"
      />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px' }}>

          {/* LEFT — Contact Form */}
          <div>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700,
                color: 'var(--text-primary)', margin: '0 0 24px',
              }}>
                Send us a Message
              </h2>

              {submitStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    backgroundColor: 'var(--color-internet-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-internet-light)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                    Message Received
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.6 }}>
                    Thank you for contacting BOCRA. We will get back to you within 2–3 business days.
                  </p>
                  <div style={{
                    display: 'inline-block', padding: '8px 16px',
                    backgroundColor: 'var(--bg-elevated)', borderRadius: '8px',
                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-accent)',
                  }}>
                    Reference: {refNumber}
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <button
                      onClick={() => setSubmitStatus('idle')}
                      style={{
                        padding: '10px 20px', backgroundColor: 'transparent',
                        border: '1px solid var(--border-default)', borderRadius: '8px',
                        color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem',
                      }}
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label htmlFor="contact-name" style={labelStyle}>Full Name</label>
                      <input id="contact-name" type="text" {...register('fullName')} style={inputStyle} placeholder="Thabo Mokoena" />
                      {errors.fullName && <p style={{ color: 'var(--color-postal)', fontSize: '0.78rem', marginTop: '4px' }}>{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-email" style={labelStyle}>Email Address</label>
                      <input id="contact-email" type="email" {...register('email')} style={inputStyle} placeholder="you@example.com" />
                      {errors.email && <p style={{ color: 'var(--color-postal)', fontSize: '0.78rem', marginTop: '4px' }}>{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" style={labelStyle}>Subject</label>
                    <Controller
                      name="subject"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <select
                          id="contact-subject"
                          {...field}
                          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                        >
                          <option value="" disabled>Select a subject…</option>
                          {SUBJECTS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.subject && <p style={{ color: 'var(--color-postal)', fontSize: '0.78rem', marginTop: '4px' }}>{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-message" style={labelStyle}>Message</label>
                    <textarea
                      id="contact-message"
                      {...register('message')}
                      rows={5}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                      placeholder="Please describe your enquiry in detail (minimum 20 characters)…"
                    />
                    {errors.message && <p style={{ color: 'var(--color-postal)', fontSize: '0.78rem', marginTop: '4px' }}>{errors.message.message}</p>}
                  </div>

                  {/* CAPTCHA */}
                  <div style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: '8px',
                    padding: '14px',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <label htmlFor="contact-captcha" style={{ ...labelStyle, margin: 0, flexShrink: 0 }}>
                        What is {captcha.x} + {captcha.y}?
                      </label>
                      <input
                        id="contact-captcha"
                        type="number"
                        {...register('captcha')}
                        style={{ ...inputStyle, width: '80px', flex: 'none' }}
                        placeholder="?"
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        title="Get a new question"
                        style={{
                          background: 'none', border: 'none', color: 'var(--text-muted)',
                          cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 4 23 10 17 10"/>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        New question
                      </button>
                    </div>
                    {errors.captcha && <p style={{ color: 'var(--color-postal)', fontSize: '0.78rem', marginTop: '8px' }}>{errors.captcha.message}</p>}
                  </div>

                  {submitStatus === 'error' && (
                    <div style={{
                      backgroundColor: 'var(--color-postal-bg)', border: '1px solid var(--color-postal)',
                      borderRadius: '8px', padding: '10px 14px', color: 'var(--color-postal-light)', fontSize: '0.85rem',
                    }}>
                      Failed to send. Please try again or contact us directly.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitStatus === 'loading'}
                    style={{
                      width: '100%', padding: '13px',
                      backgroundColor: 'var(--color-telecoms)', color: '#fff',
                      border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem',
                      cursor: submitStatus === 'loading' ? 'not-allowed' : 'pointer',
                      opacity: submitStatus === 'loading' ? 0.7 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    {submitStatus === 'loading' && (
                      <span style={{
                        width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
                      }} />
                    )}
                    {submitStatus === 'loading' ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT — Contact info + table + map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Info card */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px' }}>
                Contact Information
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InfoRow
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                  label="Address"
                  value={<>Plot 50671 Independence Avenue<br />Private Bag 00495, Gaborone, Botswana</>}
                />
                <InfoRow
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012.41 1h3a2 2 0 012 1.72c.12.96.36 1.9.71 2.81a2 2 0 01-.45 2.11L6.91 8.4a16 16 0 006.64 6.64l.76-.76a2 2 0 012.11-.45c.91.35 1.85.59 2.81.71A2 2 0 0122 16.92z"/></svg>}
                  label="Phone"
                  value="+267 3957755"
                />
                <InfoRow
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                  label="Fax"
                  value="+267 3957976"
                />
                <InfoRow
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                  label="Email"
                  value={<a href="mailto:info@bocra.org.bw" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>info@bocra.org.bw</a>}
                />
                <InfoRow
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                  label="Office Hours"
                  value={<>Monday–Friday 08:00–17:00 CAT<br /><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Closed on public holidays</span></>}
                />
              </div>
            </div>

            {/* Department table */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
                Department Contacts
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                      {['Department', 'Email', 'Ext.'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left', padding: '8px 10px',
                          color: 'var(--text-muted)', fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEPARTMENTS.map((d, i) => (
                      <tr key={d.name} style={{
                        borderBottom: i < DEPARTMENTS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      }}>
                        <td style={{ padding: '10px 10px', color: 'var(--text-primary)', fontWeight: 500 }}>{d.name}</td>
                        <td style={{ padding: '10px 10px' }}>
                          <a href={`mailto:${d.email}`} style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.8rem' }}>
                            {d.email}
                          </a>
                        </td>
                        <td style={{ padding: '10px 10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {d.ext}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Map placeholder */}
            <MapPlaceholder />
          </div>
        </div>
      </div>
    </div>
  )
}
