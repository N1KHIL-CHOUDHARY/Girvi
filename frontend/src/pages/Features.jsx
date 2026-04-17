import Seo from '@/components/Seo';

const features = [
  {
    id: 'inventory',
    title: 'Inventory & pledged item tracking',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    description: 'Record every pledged item with photos, descriptions, valuation and ticket status. See what is active, redeemed or overdue without flipping through physical registers.',
    bullets: [
      'Central inventory view of all pledged items',
      'Quick search by customer, ticket number or item type',
      'Clear status for active, closed and overdue tickets',
    ],
  },
  {
    id: 'billing',
    title: 'Accurate billing & pawn ticket calculations',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    description: 'Let PawnManager handle interest and due date calculations so your team issues correct bills every time.',
    bullets: [
      'Automatic interest and penalty calculations',
      'Printable, professional pawn tickets and receipts',
      'Support for Indian formats and local languages',
    ],
  },
  {
    id: 'customers',
    title: 'Customer history & KYC in one place',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    description: 'Maintain a clean customer record with KYC details and full pawn history so you always know who you are dealing with.',
    bullets: [
      'Complete view of loans, repayments and outstanding tickets',
      'KYC and contact details stored securely',
      'Faster repeat transactions for loyal customers',
    ],
  },
  {
    id: 'reports',
    title: 'Dashboards & reports for owners',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    description: 'Track loan amounts, ticket volumes and payments so you can make decisions based on data instead of guesswork.',
    bullets: [
      'Daily overview of active loans and collections',
      'Area and gender breakdown of customers',
      'Export-friendly data for audit and compliance',
    ],
  },
];

export default function Features() {
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg-base)' }}>
      <Seo
        title="Pawn Shop POS Features – Inventory & Billing"
        description="Explore PawnManager pawn shop POS features for inventory, billing, loan tracking and reporting."
        canonicalPath="/features"
      />

      <section style={{ maxWidth: '64rem', margin: '0 auto', padding: '5rem 1.5rem 4rem' }}>
        {/* Header */}
        <header style={{ marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--brand-light)', color: 'var(--brand-text)',
            padding: '0.3rem 0.875rem', borderRadius: '9999px',
            fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            Features
          </div>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.03em',
            lineHeight: 1.15, margin: '0 0 1rem',
          }}>
            Built for modern pawn shops
          </h1>
          <p style={{
            fontSize: '1.0625rem', color: 'var(--text-muted)', maxWidth: '36rem', lineHeight: 1.65, margin: 0,
          }}>
            PawnManager combines pawn ticket management, inventory tracking and billing into one simple POS so you can see exactly what is pledged, due and paid at any time.
          </p>
        </header>

        {/* Feature grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem',
        }}>
          {features.map(f => (
            <article
              key={f.id}
              className="pm-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Icon */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '2.75rem', height: '2.75rem',
                background: 'var(--brand-light)', borderRadius: 'var(--radius)',
                color: 'var(--brand)',
              }}>
                {f.icon}
              </div>

              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem', lineHeight: 1.3 }}>
                  {f.title}
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 1rem' }}>
                  {f.description}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {f.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8375rem', color: 'var(--text-secondary)' }}>
                      <svg style={{ flexShrink: 0, marginTop: '0.125rem', color: 'var(--success)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}