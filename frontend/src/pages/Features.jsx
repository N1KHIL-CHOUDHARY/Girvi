import Seo from '@/components/Seo';

export default function Features() {
  return (
    <main className="min-h-screen bg-white">
      <Seo
        title="Pawn Shop POS Features – Inventory & Billing"
        description="Explore PawnManager pawn shop POS features for inventory, billing, loan tracking and reporting."
        canonicalPath="/features"
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <header className="mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Features built for modern pawn shops
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            PawnManager combines pawn ticket management, inventory tracking and billing into one
            simple pawn shop POS so you can see exactly what is pledged, due and paid at any time.
          </p>
        </header>

        <div className="grid gap-8 md:gap-10 md:grid-cols-2">
          <section aria-labelledby="inventory-management-title">
            <h2
              id="inventory-management-title"
              className="text-2xl font-semibold text-slate-900 mb-3"
            >
              Inventory & pledged item tracking
            </h2>
            <p className="text-slate-600 mb-3">
              Record every pledged item with photos, descriptions, valuation and ticket status. See
              what is active, redeemed or overdue without flipping through physical registers.
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Central inventory view of all pledged items</li>
              <li>Quick search by customer, ticket number or item type</li>
              <li>Clear status for active, closed and overdue tickets</li>
            </ul>
          </section>

          <section aria-labelledby="billing-title">
            <h2 id="billing-title" className="text-2xl font-semibold text-slate-900 mb-3">
              Accurate billing & pawn ticket calculations
            </h2>
            <p className="text-slate-600 mb-3">
              Let PawnManager handle interest and due date calculations so your team issues correct
              bills every time.
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Automatic interest and penalty calculations</li>
              <li>Printable, professional pawn tickets and receipts</li>
              <li>Support for Indian formats and local languages</li>
            </ul>
          </section>

          <section aria-labelledby="customer-crm-title">
            <h2 id="customer-crm-title" className="text-2xl font-semibold text-slate-900 mb-3">
              Customer history & KYC in one place
            </h2>
            <p className="text-slate-600 mb-3">
              Maintain a clean customer record with KYC details and full pawn history so you always
              know who you are dealing with.
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Complete view of loans, repayments and outstanding tickets</li>
              <li>KYC and contact details stored securely</li>
              <li>Faster repeat transactions for loyal customers</li>
            </ul>
          </section>

          <section aria-labelledby="reports-title">
            <h2 id="reports-title" className="text-2xl font-semibold text-slate-900 mb-3">
              Dashboards & reports for owners
            </h2>
            <p className="text-slate-600 mb-3">
              Track loan amounts, ticket volumes and payments so you can make decisions based on
              data instead of guesswork.
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Daily overview of active loans and collections</li>
              <li>Area and gender breakdown of customers</li>
              <li>Export-friendly data for audit and compliance</li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}

