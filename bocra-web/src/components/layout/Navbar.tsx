import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const BOCRALogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
      {['#1565C0','#F9A825','#2E7D32','#B71C1C'].map((color, i) => (
        <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
      ))}
    </div>
    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
      BOCRA
    </span>
  </div>
)

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { to: '/about', label: 'About' },
    { to: '/licensing', label: 'Licensing' },
    { to: '/consumer', label: 'Consumer' },
    { to: '/consultations', label: 'Consultations' },
    { to: '/publications', label: 'Publications' },
    { to: '/news', label: 'News' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <nav
      role="banner"
      aria-label="Main navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: scrolled ? 'rgba(26,26,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '64px', gap: '24px' }}>
        <Link to="/" aria-label="BOCRA Home" style={{ textDecoration: 'none' }}>
          <BOCRALogo />
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '4px', flex: 1 }} className="hidden md:flex">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.color = 'var(--text-primary)'
                ;(e.target as HTMLElement).style.backgroundColor = 'var(--bg-elevated)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.color = 'var(--text-secondary)'
                ;(e.target as HTMLElement).style.backgroundColor = 'transparent'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'none',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ display: 'flex', transition: 'opacity 0.2s, transform 0.2s', opacity: 1 }}>
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </span>
          </button>

          {user ? (
            <>
              {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                <Link to="/admin" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                  Admin
                </Link>
              )}
              <Link to="/portal" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                Portal
              </Link>
              <button
                onClick={() => { logout(); navigate('/') }}
                style={{
                  background: 'none', border: '1px solid var(--border-default)',
                  borderRadius: '8px', padding: '7px 14px', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.875rem',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  padding: '7px 14px', border: '1px solid var(--border-default)',
                  borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
                }}
              >
                Login
              </Link>
              <Link
                to="/consumer/complaint"
                style={{
                  backgroundColor: '#B71C1C', color: '#fff', textDecoration: 'none',
                  padding: '7px 14px', borderRadius: '8px', fontSize: '0.875rem',
                  fontWeight: 600, whiteSpace: 'nowrap',
                }}
              >
                File Complaint
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
