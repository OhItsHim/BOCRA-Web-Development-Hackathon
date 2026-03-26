import React from 'react'
import PageHero from '../../components/common/PageHero'

export default function Mandate() {
  return (
    <div>
      <PageHero title="Our Mandate" subtitle="BOCRA's regulatory powers and functions under the Communications Regulatory Authority Act." />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        {[
          { title: 'Licensing', content: 'Issue, renew, modify, suspend, and revoke licences for telecommunications, broadcasting, postal, and internet service providers operating in Botswana.' },
          { title: 'Spectrum Management', content: 'Administer and manage the radio frequency spectrum in accordance with national requirements and international coordination obligations.' },
          { title: 'Consumer Protection', content: 'Protect the interests of consumers in the communications sector, including complaint resolution, tariff monitoring, and service quality enforcement.' },
          { title: 'Type Approval', content: 'Regulate the importation and sale of electronic communications equipment by issuing type approvals.' },
          { title: 'Competition Regulation', content: 'Promote fair competition in the communications sector and prevent anti-competitive conduct by operators.' },
          { title: 'Universal Service', content: 'Administer the Universal Service Fund to extend communications services to underserved rural and remote communities.' },
        ].map(item => (
          <div key={item.title} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid var(--color-accent)', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>{item.title}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
