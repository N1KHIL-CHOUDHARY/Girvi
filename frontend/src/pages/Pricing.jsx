import Seo from '@/components/Seo';

export default function Pricing() {
  return (
    <main className="min-h-screen bg-[#f4faf5] text-slate-900">
      <Seo
        title="Pawn Shop Software Pricing – POS, Inventory & Billing"
        description="Simple pawn shop software pricing with predictable monthly plans for POS, inventory and billing."
        canonicalPath="/pricing"
      />

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Pricing</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-slate-900">Simple pricing for growing pawn shops</h1>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-slate-600">
              Start with a lightweight pawn shop POS and upgrade only when your ticket volume grows.
              No hidden setup charges or surprise fees.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Starter – for new pawn shops</h2>
              <p className="text-3xl font-bold text-slate-900 mb-1">₹0 <span className="text-base font-normal text-slate-500">/ month</span></p>
              <p className="text-slate-600 mb-4">
                Try PawnManager as your first pawn shop management software before you fully move away
                from notebooks and Excel.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Core pawn ticket and inventory management</li>
                <li>Basic customer records and billing</li>
                <li>Single shop, limited staff access</li>
              </ul>
            </section>

            <section className="rounded-[2rem] border border-emerald-200 bg-white p-8 shadow-md ring-1 ring-emerald-100">
              <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Popular</div>
              <h2 className="mt-6 text-2xl font-semibold text-slate-900 mb-2">Growth – for busy pawn shops</h2>
              <p className="text-slate-600 mb-4">
                Designed for established pawn shops that need stronger reporting, permissions and
                controls as their team grows.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Advanced reports and dashboards</li>
                <li>Role-based access and activity logs</li>
                <li>Priority support for onboarding and training</li>
              </ul>
            </section>
          </div>

          <p className="mt-10 text-sm text-slate-500 text-center max-w-2xl mx-auto">
            Final pricing for PawnManager depends on your ticket volume, number of branches and users.
            Talk to us to find a plan that matches your shop today and can scale with you tomorrow.
          </p>
        </div>
      </section>
    </main>
  );
}
