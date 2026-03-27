import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

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

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
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

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const registered = searchParams.get('registered') === '1'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)
    try {
      const result = await login(data.email, data.password)
      const role = result?.user?.role || result?.role || 'PUBLIC'
      if (role === 'ADMIN' || role === 'STAFF') {
        navigate('/admin/dashboard')
      } else {
        navigate('/portal/dashboard')
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 429) {
        setSubmitError('Too many login attempts. Please wait 15 minutes.')
      } else {
        setSubmitError('Invalid email or password')
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
        maxWidth: '420px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '2rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.06em',
          }}>
            BOCRA
          </span>
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            {['#1565C0', '#F9A825', '#2E7D32', '#B71C1C'].map((color) => (
              <div key={color} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
            ))}
          </div>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 6px',
          textAlign: 'center',
        }}>
          Sign in to your account
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 24px' }}>
          Access your applications, complaints, and BOCRA services
        </p>

        {/* Registered success banner */}
        {registered && (
          <div style={{
            backgroundColor: 'var(--color-internet-bg)',
            border: '1px solid var(--color-internet)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '20px',
            color: 'var(--color-internet-light)',
            fontSize: '0.85rem',
          }}>
            ✓ Account created. Please sign in.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="login-email" style={labelStyle}>Email Address</label>
            <input
              id="login-email"
              type="email"
              {...register('email')}
              style={inputStyle}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="login-password" style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                style={{ ...inputStyle, paddingRight: '44px' }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
          </div>

          {/* Remember me */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              {...register('rememberMe')}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Remember me</span>
          </label>

          {/* Submit error */}
          {submitError && (
            <div style={{
              backgroundColor: 'var(--color-postal-bg)',
              border: '1px solid var(--color-postal)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: 'var(--color-postal-light)',
              fontSize: '0.85rem',
            }}>
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--color-telecoms)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting && (
              <span style={{
                width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }} />
            )}
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer links */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.85rem' }}>
            Forgot your password?
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
              Register
            </Link>
          </span>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>
            Continue as guest →
          </Link>
        </div>
      </div>
    </div>
  )
}
