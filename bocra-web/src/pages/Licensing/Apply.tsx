import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageHero from '../../components/common/PageHero'
import { licensesApi } from '../../api/endpoints/licenses'
import { licenseApplicationSchema } from '../../utils/validators'

const DRAFT_KEY = 'bocra-license-draft'
const steps = ['Licence Type', 'Applicant Details', 'Technical Details', 'Documents', 'Declaration', 'Confirmation']

const licenseTypes = [
  { id: 'TELECOM_CLASS', name: 'Class Telecom Licence', sector: 'TELECOM', color: '#1565C0' },
  { id: 'TELECOM_INDIVIDUAL', name: 'Individual Telecom Licence', sector: 'TELECOM', color: '#1565C0' },
  { id: 'TELECOM_NETWORK', name: 'Network Service Licence', sector: 'TELECOM', color: '#1565C0' },
  { id: 'BROADCAST_FTA_TV', name: 'Free-to-Air TV', sector: 'BROADCASTING', color: '#F9A825' },
  { id: 'BROADCAST_PAY_TV', name: 'Pay Television', sector: 'BROADCASTING', color: '#F9A825' },
  { id: 'BROADCAST_COMMUNITY_RADIO', name: 'Community Radio', sector: 'BROADCASTING', color: '#F9A825' },
  { id: 'BROADCAST_COMMERCIAL_RADIO', name: 'Commercial Radio', sector: 'BROADCASTING', color: '#F9A825' },
  { id: 'INTERNET_ISP', name: 'Internet Service Provider', sector: 'INTERNET', color: '#2E7D32' },
  { id: 'INTERNET_VSAT', name: 'VSAT Service', sector: 'INTERNET', color: '#2E7D32' },
  { id: 'POSTAL_COURIER', name: 'Courier Service', sector: 'POSTAL', color: '#B71C1C' },
  { id: 'POSTAL_EXPRESS', name: 'Express Delivery', sector: 'POSTAL', color: '#B71C1C' },
]

export default function Apply() {
  const [step, setStep] = useState(0)
  const [selectedType, setSelectedType] = useState('')
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(licenseApplicationSchema),
    defaultValues: (() => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') } catch { return {} } })(),
  })

  const saveDraft = (data: Record<string, unknown>) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, license_type: selectedType }))
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!selectedType) { setError('Please select a licence type'); return }
    setLoading(true); setError('')
    try {
      const res = await licensesApi.createApplication({ ...data, license_type: selectedType })
      setReference(res.data.reference)
      localStorage.removeItem(DRAFT_KEY)
      setStep(5)
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 5) {
    return (
      <div>
        <PageHero title="Application Submitted" />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid rgba(46,125,50,0.3)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-primary)', margin: '0 0 8px' }}>Application Received</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px' }}>Your licence application has been submitted. Processing takes 60–90 business days.</p>
            <div style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Reference Number</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)' }}>{reference}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/licensing/track')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1565C0', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Track Application</button>
              <button onClick={() => navigate('/licensing')} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Back to Licensing</button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHero title="Apply for a Licence" subtitle="Complete the application form to apply for a communications licence in Botswana." />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
          {steps.slice(0, 5).map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '100%', height: '3px', borderRadius: '2px', backgroundColor: i <= step ? '#1565C0' : 'var(--border-default)' }} />
              <span style={{ fontSize: '0.6rem', color: i <= step ? '#1565C0' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400, textAlign: 'center' }}>{s}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '32px', marginBottom: '16px' }}>

              {/* Step 0: Licence Type */}
              {step === 0 && (
                <div>
                  <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Select Licence Type</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {licenseTypes.map(lt => (
                      <div key={lt.id} onClick={() => setSelectedType(lt.id)} style={{
                        padding: '14px', borderRadius: '8px', cursor: 'pointer',
                        border: `2px solid ${selectedType === lt.id ? lt.color : 'var(--border-default)'}`,
                        backgroundColor: selectedType === lt.id ? `${lt.color}12` : 'var(--bg-base)',
                        transition: 'all 0.15s',
                      }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: lt.color, marginBottom: '4px', textTransform: 'uppercase' }}>{lt.sector}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{lt.name}</div>
                      </div>
                    ))}
                  </div>
                  {!selectedType && error && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', marginTop: '8px' }}>{error}</p>}
                </div>
              )}

              {/* Step 1: Applicant Details */}
              {step === 1 && (
                <form id="step1-form">
                  <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Applicant Details</h3>
                  {[
                    { id: 'business_name', label: 'Business Name *', placeholder: 'Company or organisation name', type: 'text', error: errors.business_name },
                    { id: 'registration_number', label: 'Company Registration Number', placeholder: 'BW/2024/XXXXX', type: 'text', error: undefined },
                    { id: 'contact_email', label: 'Contact Email *', placeholder: 'applications@company.bw', type: 'email', error: errors.contact_email },
                    { id: 'contact_phone', label: 'Contact Phone', placeholder: '+267 7X XXX XXXX', type: 'tel', error: undefined },
                    { id: 'address', label: 'Business Address', placeholder: 'Physical address of business', type: 'text', error: undefined },
                  ].map(f => (
                    <div key={f.id} style={{ marginBottom: '16px' }}>
                      <label htmlFor={f.id} style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>{f.label}</label>
                      <input id={f.id} {...register(f.id as keyof typeof errors)} type={f.type} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${f.error ? '#B71C1C' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box' }} onChange={e => { saveDraft({ [f.id]: e.target.value }) }} />
                      {f.error && <p style={{ color: '#ef9a9a', fontSize: '0.75rem', margin: '4px 0 0' }}>{String(f.error.message)}</p>}
                    </div>
                  ))}
                </form>
              )}

              {/* Step 2: Technical Details */}
              {step === 2 && (
                <div>
                  <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Technical Details</h3>
                  <div style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', padding: '16px', marginBottom: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    ℹ️ Technical requirements vary by licence type. You selected: <strong style={{ color: 'var(--text-primary)' }}>{licenseTypes.find(l => l.id === selectedType)?.name}</strong>
                  </div>
                  {['Service coverage area', 'Technical infrastructure description', 'Frequency bands required (if applicable)', 'Estimated subscriber base'].map(field => (
                    <div key={field} style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontSize: '0.875rem' }}>{field}</label>
                      <textarea rows={2} placeholder={`Describe ${field.toLowerCase()}...`} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Document Upload */}
              {step === 3 && (
                <div>
                  <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Document Upload</h3>
                  {['Company Certificate of Incorporation', 'Tax Clearance Certificate', 'Financial Statements (last 2 years)', 'Technical Specifications', 'Directors\' Identification Documents'].map(doc => (
                    <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border-default)', borderRadius: '8px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{doc}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '2px' }}>PDF, max 5MB</div>
                      </div>
                      <label style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: '0.775rem', cursor: 'pointer', backgroundColor: 'var(--bg-elevated)' }}>
                        Upload
                        <input type="file" accept=".pdf,.jpg,.png" style={{ display: 'none' }} />
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Declaration */}
              {step === 4 && (
                <div>
                  <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Declaration</h3>
                  <div style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', padding: '20px', marginBottom: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    I/We hereby declare that: (1) All information provided in this application is true, accurate, and complete; (2) The applicant meets all eligibility requirements for the requested licence type; (3) The applicant agrees to comply with all applicable legislation, regulations, and BOCRA licence conditions; (4) Providing false information is a criminal offence under Botswana law.
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <input type="checkbox" id="agree" style={{ marginTop: '2px', flexShrink: 0 }} required />
                    <label htmlFor="agree" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      I/We have read, understood, and agree to the above declaration.
                    </label>
                  </div>
                  {error && <div style={{ backgroundColor: 'rgba(183,28,28,0.1)', border: '1px solid rgba(183,28,28,0.3)', borderRadius: '8px', padding: '12px', marginTop: '16px', color: '#ef9a9a', fontSize: '0.875rem' }}>{error}</div>}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1 }}>Back</button>
              {step < 4 ? (
                <button type="button" onClick={() => {
                  if (step === 0 && !selectedType) { setError('Please select a licence type'); return }
                  setError(''); setStep(s => s + 1)
                }} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#1565C0', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Next →
                </button>
              ) : (
                <button onClick={handleSubmit(data => onSubmit(data as Record<string, unknown>))} disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2E7D32', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
