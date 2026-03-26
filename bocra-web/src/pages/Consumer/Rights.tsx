import React from 'react'
import PageHero from '../../components/common/PageHero'

export default function Rights() {
  const rights = [
    { title: 'Right to Clear Billing', desc: 'You have the right to receive clear, accurate, and itemised bills from your service provider. Charges must be clearly explained.', icon: '💳' },
    { title: 'Right to Quality Service', desc: 'Licensed operators must meet minimum service quality standards set by BOCRA. You can complain if standards are not met.', icon: '⭐' },
    { title: 'Right to Privacy', desc: 'Your personal communications data may not be accessed, used, or shared without your consent except as permitted by law.', icon: '🔒' },
    { title: 'Right to Dispute Resolution', desc: 'You have the right to escalate unresolved complaints to BOCRA after a reasonable period with your service provider.', icon: '⚖️' },
    { title: 'Protection from Spam', desc: 'You have the right not to receive unsolicited commercial communications. Report spam SMS and calls to BOCRA.', icon: '🚫' },
    { title: 'Right to Information', desc: 'Service providers must give you clear information about their services, prices, and terms before you sign a contract.', icon: '📋' },
    { title: 'Contract Cancellation', desc: 'You have the right to cancel services under certain conditions. Service providers must have fair cancellation policies.', icon: '📄' },
    { title: 'Emergency Services Access', desc: 'All telecommunications operators must provide access to emergency services (999) free of charge.', icon: '🆘' },
  ]
  return (
    <div>
      <PageHero title="Consumer Rights" subtitle="Your rights as a communications consumer in Botswana." sector="TELECOM" />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {rights.map(r => (
            <div key={r.title} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '24px' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{r.icon}</div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>{r.title}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.6 }}>{r.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '32px', backgroundColor: 'rgba(183,28,28,0.08)', border: '1px solid rgba(183,28,28,0.2)', borderRadius: '10px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px', color: '#ef9a9a', fontSize: '1rem', fontWeight: 600 }}>Your rights are not being respected?</h3>
          <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>If a licensed operator is not respecting your rights, file a complaint with BOCRA. We will investigate and take appropriate action.</p>
          <a href="/consumer/complaint" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#B71C1C', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>File a Complaint</a>
        </div>
      </div>
    </div>
  )
}
