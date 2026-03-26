import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { authApi } from '../../api/endpoints/auth'

function PortalNav({ active }: { active: string }) {
  const links = [
    { to: '/portal', label: 'Dashboard' },
    { to: '/portal/applications', label: 'Applications' },
    { to: '/portal/complaints', label: 'Complaints' },
    { to: '/portal/profile', label: 'Profile' },
  ]
  return (
    <nav aria-label="Portal navigation" style={{
      backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)',
      padding: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap',
    }}>
      {links.map(({ to, label }) => (
        <Link key={to} to={to} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
          backgroundColor: active === label ? 'rgba(79,195,247,0.12)' : 'transparent',
          color: active === label ? 'var(--color-accent)' : 'var(--text-secondary)', transition: 'all 0.15s',
        }}>{label}</Link>
      ))}
    </nav>
  )
}

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  organization: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const pwSchema = z.object({
  current_password: z.string().min(1, 'Current password required'),
  new_password: z.string().min(8, 'Minimum 8 characters'),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})
type PwFormData = z.infer<typeof pwSchema>

const fieldStyle = {
  width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
  border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
  boxSizing: 'border-box' as const,
}
const labelStyle = { display: 'block' as const, fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }

export default function PortalProfile() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [profileSaved, setProfileSaved] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      organization: user?.organization || '',
    },
  })

  const { register: pwRegister, handleSubmit: pwHandleSubmit, reset: pwReset, formState: { errors: pwErrors, isSubmitting: pwSubmitting } } = useForm<PwFormData>({
    resolver: zodResolver(pwSchema),
  })

  const onSaveProfile = async (_data: FormData) => {
    // Would call a profile update endpoint
    await new Promise(r => setTimeout(r, 500))
    setProfileSaved(true)
    addToast('Profile updated successfully.', 'success')
  }

  const onChangePassword = async (_data: PwFormData) => {
    await new Promise(r => setTimeout(r, 500))
    pwReset()
    addToast('Password changed successfully.', 'success')
  }

  const ROLE_LABELS: Record<string, string> = {
    PUBLIC: 'Public User', LICENSEE: 'Licensee', STAFF: 'Staff', ADMIN: 'Administrator',
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <a href="#main-content" style={{ position: 'absolute', top: '-40px', left: 0, background: 'var(--color-accent)', color: '#000', padding: '8px', zIndex: 100 }}>
        Skip to content
      </a>
      <main id="main-content" style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <PortalNav active="Profile" />

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2rem' }}>
          My Profile
        </h1>

        {/* Account info card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
            border: '1px solid var(--border-subtle)', padding: '1.5rem',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-telecoms), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: '#fff',
          }}>
            {(user?.first_name?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user?.email}</p>
            <span style={{
              display: 'inline-block', marginTop: '0.35rem',
              fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
              backgroundColor: 'rgba(79,195,247,0.12)', color: 'var(--color-accent)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {ROLE_LABELS[user?.role || ''] || user?.role}
            </span>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Member since {user?.created_at ? new Date(user.created_at).getFullYear() : '—'}
            </p>
            <p style={{ fontSize: '0.75rem', color: user?.is_verified ? '#a5d6a7' : '#ef9a9a', marginTop: '0.25rem' }}>
              {user?.is_verified ? '✓ Verified' : '○ Not verified'}
            </p>
          </div>
        </motion.div>

        {/* Profile form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
            border: '1px solid var(--border-subtle)', padding: '1.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Personal Information
          </h2>
          <form onSubmit={handleSubmit(onSaveProfile)} aria-label="Edit profile form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="first_name" style={labelStyle}>First Name</label>
                <input id="first_name" {...register('first_name')} style={{ ...fieldStyle, borderColor: errors.first_name ? '#ef5350' : 'var(--border-default)' }} />
                {errors.first_name && <p style={{ color: '#ef5350', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.first_name.message}</p>}
              </div>
              <div>
                <label htmlFor="last_name" style={labelStyle}>Last Name</label>
                <input id="last_name" {...register('last_name')} style={{ ...fieldStyle, borderColor: errors.last_name ? '#ef5350' : 'var(--border-default)' }} />
                {errors.last_name && <p style={{ color: '#ef5350', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.last_name.message}</p>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label htmlFor="phone" style={labelStyle}>Phone (optional)</label>
                <input id="phone" {...register('phone')} placeholder="+267 71234567" style={fieldStyle} />
              </div>
              <div>
                <label htmlFor="organization" style={labelStyle}>Organisation (optional)</label>
                <input id="organization" {...register('organization')} placeholder="Company or institution" style={fieldStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="submit" disabled={isSubmitting} style={{
                padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none',
                backgroundColor: 'var(--color-accent)', color: '#000',
                fontWeight: 700, fontSize: '0.875rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              {profileSaved && <span style={{ color: '#a5d6a7', fontSize: '0.85rem' }}>✓ Saved</span>}
            </div>
          </form>
        </motion.div>

        {/* Change password */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            backgroundColor: 'var(--bg-surface)', borderRadius: '12px',
            border: '1px solid var(--border-subtle)', padding: '1.75rem',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Change Password
          </h2>
          <form onSubmit={pwHandleSubmit(onChangePassword)} aria-label="Change password form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label htmlFor="current_password" style={labelStyle}>Current Password</label>
                <input id="current_password" type="password" {...pwRegister('current_password')} style={{ ...fieldStyle, borderColor: pwErrors.current_password ? '#ef5350' : 'var(--border-default)' }} />
                {pwErrors.current_password && <p style={{ color: '#ef5350', fontSize: '0.75rem', marginTop: '0.25rem' }}>{pwErrors.current_password.message}</p>}
              </div>
              <div>
                <label htmlFor="new_password" style={labelStyle}>New Password</label>
                <input id="new_password" type="password" {...pwRegister('new_password')} style={{ ...fieldStyle, borderColor: pwErrors.new_password ? '#ef5350' : 'var(--border-default)' }} />
                {pwErrors.new_password && <p style={{ color: '#ef5350', fontSize: '0.75rem', marginTop: '0.25rem' }}>{pwErrors.new_password.message}</p>}
              </div>
              <div>
                <label htmlFor="confirm_password" style={labelStyle}>Confirm New Password</label>
                <input id="confirm_password" type="password" {...pwRegister('confirm_password')} style={{ ...fieldStyle, borderColor: pwErrors.confirm_password ? '#ef5350' : 'var(--border-default)' }} />
                {pwErrors.confirm_password && <p style={{ color: '#ef5350', fontSize: '0.75rem', marginTop: '0.25rem' }}>{pwErrors.confirm_password.message}</p>}
              </div>
            </div>
            <button type="submit" disabled={pwSubmitting} style={{
              padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none',
              backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' as any,
              fontWeight: 700, fontSize: '0.875rem', cursor: pwSubmitting ? 'not-allowed' : 'pointer',
              opacity: pwSubmitting ? 0.7 : 1,
            }}>
              {pwSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
