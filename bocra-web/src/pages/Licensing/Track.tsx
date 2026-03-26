import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import PageHero from '../../components/common/PageHero'
import StatusBadge from '../../components/common/StatusBadge'
import { licensesApi } from '../../api/endpoints/licenses'
import { formatDate } from '../../utils/formatters'

const schema = z.object({
  ref: z.string().min(1, 'Reference number required'),
  email: z.string().email('Valid email required'),
})

export default function LicenseTrack() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data: { ref: string; email: string }) => {
    setLoading(true); setError('')
    try {
      const res = await licensesApi.trackApplication(data.ref, data.email)
      setResult(res.data)
    } catch {
      setError('No application found with that reference and email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHero title="Track Application" subtitle="Check the status of your licence application." />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
        <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="ref" style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>Reference Number</label>
            <input id="ref" {...register('ref')} placeholder="LIC-2024-XXXXX" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${errors.ref ? '#B71C1C' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
            {errors.ref && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.ref.message}</p>}
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="email" style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>Contact Email</label>
            <input id="email" {...register('email')} type="email" placeholder="your@email.com" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${errors.email ? '#B71C1C' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
            {errors.email && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.email.message}</p>}
          </div>
          {error && <div style={{ backgroundColor: 'rgba(183,28,28,0.1)', border: '1px solid rgba(183,28,28,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#ef9a9a', fontSize: '0.875rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#1565C0', color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Searching...' : 'Track Application'}
          </button>
        </form>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px', marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Application Status</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                ['Business Name', result.business_name],
                ['Licence Type', String(result.license_type || '').replace(/_/g, ' ')],
                ['Submitted', formatDate(result.submitted_at as string)],
                ['Last Reviewed', result.reviewed_at ? formatDate(result.reviewed_at as string) : 'Pending'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{String(value || 'N/A')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status</span>
                <StatusBadge status={result.status as string} />
              </div>
              {result.notes && (
                <div style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', padding: '12px', marginTop: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Notes from reviewer:</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{result.notes as string}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
