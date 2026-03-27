import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotFormData = z.infer<typeof forgotSchema>

const ConnectivityWebBg = () => (
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035 }}
    viewBox="0 0 800 800"
    preserveAspectRatio="xMidYMid slice"
  >
    {Array.from({ length: 15 }, (_, i) => {
      const cx = (i * 89) % 800
      const cy = (i * 113 + Math.sin(i) * 150) % 800
      return <circle key={i} cx={cx} cy={cy} r="3" fill="#4FC3F7" />
    })}
    {Array.from({ length: 20 }, (_, i) => {
      const x1 = (i * 67) % 800
      const y1 = (i * 97) % 800
      const x2 = (i * 67 + 120) % 800
      const y2 = (i * 97 + 80) % 800
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4FC3F7" strokeWidth="0.5" />
    })}
  </svg>
)

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
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

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotFormData) => {
    try {
      await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })
    } catch {
      // Silently ignore errors — always show success (security best practice)
    }
    setSubmitted(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ConnectivityWebBg />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
            BOCRA
          </span>
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            {['#1565C0', '#F9A825', '#2E7D32', '#B71C1C'].map((color) => (
              <div key={color} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
            ))}
          </div>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: 'var(--color-internet-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-internet-light)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Check your email
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
              If an account exists for that email address, we've sent a password reset link. Please check your inbox.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block', padding: '10px 24px',
                backgroundColor: 'var(--color-telecoms)', color: '#fff',
                textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem',
              }}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700,
              color: 'var(--text-primary)', margin: '0 0 8px', textAlign: 'center',
            }}>
              Forgot your password?
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 24px' }}>
              Enter your email address and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="forgot-email" style={labelStyle}>Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  {...register('email')}
                  style={inputStyle}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p style={{ color: 'var(--color-postal)', fontSize: '0.78rem', marginTop: '4px' }}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%', padding: '12px', backgroundColor: 'var(--color-telecoms)',
                  color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {isSubmitting && (
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
                  }} />
                )}
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.85rem' }}>
                ← Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
