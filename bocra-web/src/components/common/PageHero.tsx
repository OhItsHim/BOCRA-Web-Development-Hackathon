import React from 'react'
import { motion } from 'framer-motion'

interface PageHeroProps {
  title: string
  subtitle?: string
  sector?: string
  children?: React.ReactNode
}

const sectorAccent: Record<string, string> = {
  TELECOM: 'var(--color-telecoms)',
  BROADCASTING: 'var(--color-broadcast)',
  INTERNET: 'var(--color-internet)',
  POSTAL: 'var(--color-postal)',
}

export default function PageHero({ title, subtitle, sector, children }: PageHeroProps) {
  const accent = sector ? sectorAccent[sector.toUpperCase()] : 'var(--color-accent)'
  return (
    <section
      aria-label="Page header"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {sector && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: '4px',
              backgroundColor: sector ? `${sectorAccent[sector.toUpperCase()]}20` : 'var(--bg-elevated)',
              color: accent, fontSize: '0.7rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {sector}
            </span>
          </div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 12px',
            lineHeight: 1.1,
            borderLeft: `4px solid ${accent}`,
            paddingLeft: '16px',
          }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, maxWidth: '600px' }}
          >
            {subtitle}
          </motion.p>
        )}
        {children}
      </div>
    </section>
  )
}
