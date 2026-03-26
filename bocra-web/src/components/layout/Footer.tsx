import React from 'react'
import { Link } from 'react-router-dom'

const ConnectivityWeb = () => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
    {[0,1,2,3,4,5,6,7,8,9].map(i => (
      <circle key={i} cx={80 * i} cy={Math.sin(i) * 60 + 150} r="3" fill="#4FC3F7" />
    ))}
    {[0,1,2,3,4,5,6,7,8].map(i => (
      <line key={i} x1={80 * i} y1={Math.sin(i) * 60 + 150} x2={80 * (i+1)} y2={Math.sin(i+1) * 60 + 150} stroke="#4FC3F7" strokeWidth="0.5" />
    ))}
  </svg>
)

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      style={{
        position: 'relative',
        backgroundColor: '#0d0d0d',
        borderTop: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}
    >
      <ConnectivityWeb />
      <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                {['#1565C0','#F9A825','#2E7D32','#B71C1C'].map((color, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                ))}
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>BOCRA</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
              Botswana Communications Regulatory Authority. Regulating telecommunications, broadcasting, postal, and internet services.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              {[
                { label: 'Telecoms', color: '#1565C0' },
                { label: 'Broadcast', color: '#F9A825' },
                { label: 'Internet', color: '#2E7D32' },
                { label: 'Postal', color: '#B71C1C' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.color }} />
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Services</h3>
            {[
              ['/licensing', 'Licensing'],
              ['/consumer/complaint', 'File a Complaint'],
              ['/consumer/track', 'Track Complaint'],
              ['/licensing/track', 'Track Application'],
              ['/licensing/licensees', 'Licensees Directory'],
            ].map(([to, label]) => (
              <div key={to} style={{ marginBottom: '6px' }}>
                <Link to={to} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = '#4FC3F7'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
                >{label}</Link>
              </div>
            ))}
          </div>

          {/* About */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>About BOCRA</h3>
            {[
              ['/about', 'About Us'],
              ['/about/mandate', 'Our Mandate'],
              ['/about/leadership', 'Leadership'],
              ['/about/legislation', 'Legislation'],
              ['/consultations', 'Consultations'],
            ].map(([to, label]) => (
              <div key={to} style={{ marginBottom: '6px' }}>
                <Link to={to} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = '#4FC3F7'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
                >{label}</Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact</h3>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.8 }}>
              <div>📍 Plot 50671, Fairgrounds</div>
              <div>Gaborone, Botswana</div>
              <div style={{ marginTop: '8px' }}>📞 +267 395 8900</div>
              <div>✉️ info@bocra.org.bw</div>
              <div style={{ marginTop: '8px' }}>🕐 Mon–Fri 08:00–17:00 CAT</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', margin: 0 }}>
            © {new Date().getFullYear()} BOCRA. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              ['/publications', 'Publications'],
              ['/news', 'News'],
              ['/contact', 'Contact'],
            ].map(([to, label]) => (
              <Link key={to} to={to} style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontSize: '0.75rem' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
