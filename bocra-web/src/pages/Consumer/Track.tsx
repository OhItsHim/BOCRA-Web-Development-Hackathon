import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import PageHero from '../../components/common/PageHero'
import StatusBadge from '../../components/common/StatusBadge'
import { complaintsApi } from '../../api/endpoints/complaints'
import { formatDate } from '../../utils/formatters'

const schema = z.object({
  ticket: z.string().min(1, 'Ticket number required'),
  email: z.string().email('Valid email required'),
})

export default function TrackComplaint() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data: { ticket: string; email: string }) => {
    setLoading(true); setError('')
    try {
      const res = await complaintsApi.track(data.ticket, data.email)
      setResult(res.data)
    } catch {
      setError('No complaint found with that ticket number.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHero title="Track Complaint" subtitle="Check the status of your submitted complaint." />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
        <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '32px' }}>
          {[
            { id: 'ticket', label: 'Ticket Number', placeholder: 'BOCRA-2024-XXXXXX', type: 'text', error: errors.ticket },
            { id: 'email', label: 'Email Address', placeholder: 'your@email.com', type: 'email', error: errors.email },
          ].map(f => (
            <div key={f.id} style={{ marginBottom: '20px' }}>
              <label htmlFor={f.id} style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>{f.label}</label>
              <input id={f.id} {...register(f.id as 'ticket' | 'email')} type={f.type} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${f.error ? '#B71C1C' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              {f.error && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', margin: '4px 0 0' }}>{f.error.message}</p>}
            </div>
          ))}
          {error && <div style={{ backgroundColor: 'rgba(183,28,28,0.1)', border: '1px solid rgba(183,28,28,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#ef9a9a', fontSize: '0.875rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#B71C1C', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Searching...' : 'Track Complaint'}
          </button>
        </form>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{result.ticket_number as string}</h3>
              <StatusBadge status={result.status as string} />
            </div>
            {[
              ['Category', String(result.category || '').replace(/_/g, ' ')],
              ['Sector', result.sector],
              ['Submitted', formatDate(result.submitted_at as string)],
              ['Resolved', result.resolved_at ? formatDate(result.resolved_at as string) : 'Pending'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', padding: '8px 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{String(value || 'N/A')}</span>
              </div>
            ))}
            {result.resolution && (
              <div style={{ backgroundColor: 'rgba(46,125,50,0.1)', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '8px', padding: '12px', marginTop: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#a5d6a7', marginBottom: '4px', fontWeight: 600 }}>Resolution:</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{result.resolution as string}</div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
