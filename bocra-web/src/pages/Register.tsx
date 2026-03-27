import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
  organization: z.string().optional(),
  phone: z.string().optional(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type RegisterFormData = z.infer<typeof registerSchema>

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

const errorStyle: React.CSSProperties = {
  color: 'var(--color-postal)',
  fontSize: '0.78rem',
  marginTop: '4px',
}

export default function Register() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null)
    try {
      await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        organization: data.organization,
        phone: data.phone,
      })
      navigate('/login?registered=1')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setSubmitError('An account with this email already exists.')
      } else {
        setSubmitError('Registration failed. Please try again.')
      }
    }
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
        maxWidth: '480px',
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

        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700,
          color: 'var(--text-primary)', margin: '0 0 8px', textAlign: 'center',
        }}>
          Create an account
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 24px' }}>
          Join the BOCRA portal to access services
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="reg-first-name" style={labelStyle}>First Name</label>
              <input id="reg-first-name" type="text" {...register('first_name')} style={inputStyle} placeholder="Thabo" />
              {errors.first_name && <p style={errorStyle}>{errors.first_name.message}</p>}
            </div>
            <div>
              <label htmlFor="reg-last-name" style={labelStyle}>Last Name</label>
              <input id="reg-last-name" type="text" {...register('last_name')} style={inputStyle} placeholder="Mokoena" />
              {errors.last_name && <p style={errorStyle}>{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" style={labelStyle}>Email Address</label>
            <input id="reg-email" type="email" {...register('email')} style={inputStyle} placeholder="you@example.com" />
            {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                style={{ ...inputStyle, paddingRight: '44px' }}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPassword
                    ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  }
                </svg>
              </button>
            </div>
            {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-confirm-password" style={labelStyle}>Confirm Password</label>
            <input id="reg-confirm-password" type="password" {...register('confirm_password')} style={inputStyle} placeholder="Repeat password" />
            {errors.confirm_password && <p style={errorStyle}>{errors.confirm_password.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-org" style={labelStyle}>Organisation <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input id="reg-org" type="text" {...register('organization')} style={inputStyle} placeholder="e.g. Mascom Wireless" />
          </div>

          <div>
            <label htmlFor="reg-phone" style={labelStyle}>Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input id="reg-phone" type="tel" {...register('phone')} style={inputStyle} placeholder="+267 7XXXXXXX" />
          </div>

          {submitError && (
            <div style={{
              backgroundColor: 'var(--color-postal-bg)', border: '1px solid var(--color-postal)',
              borderRadius: '8px', padding: '10px 14px', color: 'var(--color-postal-light)', fontSize: '0.85rem',
            }}>
              {submitError}
            </div>
          )}

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
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
