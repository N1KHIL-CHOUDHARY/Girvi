import Seo from '@/components/Seo';

export default function Features() {
  return (
    <main className="min-h-screen bg-[#f4faf5] text-slate-900">
      <Seo
        title="Pawn Shop POS Features – Inventory & Billing"
        description="Explore PawnManager pawn shop POS features for inventory, billing, loan tracking and reporting."
        canonicalPath="/features"
      />

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-10 md:mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Features</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-slate-900">Built for modern pawn shops</h1>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-slate-600">
              PawnManager combines pawn ticket management, inventory tracking and billing into one
              simple pawn shop POS so you can see exactly what is pledged, due and paid at any time.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2">
            <article className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Inventory & pledged item tracking</h2>
              <p className="text-slate-600 mb-4">
                Record every pledged item with photos, descriptions, valuation and ticket status. See
                what is active, redeemed or overdue without flipping through physical registers.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Central inventory view of all pledged items</li>
                <li>Quick search by customer, ticket number or item type</li>
                <li>Clear status for active, closed and overdue tickets</li>
              </ul>
            </article>

            <article className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Accurate billing & pawn ticket calculations</h2>
              <p className="text-slate-600 mb-4">
                Let PawnManager handle interest and due date calculations so your team issues correct
                bills every time.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Automatic interest and penalty calculations</li>
                <li>Printable, professional pawn tickets and receipts</li>
                <li>Support for Indian formats and local languages</li>
              </ul>
            </article>

            <article className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Customer history & KYC in one place</h2>
              <p className="text-slate-600 mb-4">
                Maintain a clean customer record with KYC details and full pawn history so you always
                know who you are dealing with.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Complete view of loans, repayments and outstanding tickets</li>
                <li>KYC and contact details stored securely</li>
                <li>Faster repeat transactions for loyal customers</li>
              </ul>
            </article>

            <article className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Dashboards & reports for owners</h2>
              <p className="text-slate-600 mb-4">
                Track loan amounts, ticket volumes and payments so you can make decisions based on
                data instead of guesswork.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Daily overview of active loans and collections</li>
                <li>Area and gender breakdown of customers</li>
                <li>Export-friendly data for audit and compliance</li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

