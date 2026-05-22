import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';

const DASHBOARD_IMG =
  'https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Darshboard_ndgkms.png';

const features = [
  {
    icon: '🏷️',
    title: 'Pawn Tickets',
    desc: 'Track loans, interest, renewals, and due dates with full audit trails and automated reminders.',
  },
  {
    icon: '👤',
    title: 'Customer Records',
    desc: 'Store KYC documents, contact info, and complete loan history in one searchable place.',
  },
  {
    icon: '💳',
    title: 'Payments',
    desc: 'Record every transaction with accuracy. Accept partials, log late fees, and generate receipts.',
  },
  {
    icon: '📊',
    title: 'Analytics',
    desc: 'Understand your portfolio at a glance — overdue tickets, revenue trends, and top customers.',
  },
  {
    icon: '🔔',
    title: 'Reminders',
    desc: 'Automatically notify customers when tickets are due so you never lose a loan to forfeiture.',
  },
  {
    icon: '🔒',
    title: 'Compliance Ready',
    desc: 'Built-in ID verification logs and data retention policies to keep you audit-ready.',
  },
];

const steps = [
  { n: '01', title: 'Create your shop', body: 'Sign up in under 2 minutes. No credit card needed for the trial.' },
  { n: '02', title: 'Add customers & items', body: 'Import existing records or start fresh with our guided setup.' },
  { n: '03', title: 'Issue pawn tickets', body: 'Set terms, interest rates, and due dates — print or send digitally.' },
  { n: '04', title: 'Track repayments', body: 'Payments, renewals, and forfeitures handled automatically.' },
];

const testimonials = [
  {
    name: 'Rajan P.',
    role: 'Owner, City Gold Pawnbrokers',
    body: 'We went from paper ledgers to fully digital in one afternoon. Game changer.',
    initials: 'RP',
  },
  {
    name: 'Meera S.',
    role: 'Manager, Heritage Loans',
    body: "The overdue alert system alone saves us hours every week. Customers actually pay on time now.",
    initials: 'MS',
  },
  {
    name: 'David K.',
    role: 'Owner, QuickCash Pawn',
    body: 'Finally, software that understands how pawn shops actually work. Not a generic CRM.',
    initials: 'DK',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4faf5] text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <Seo
        title="PawnManager — Pawn Shop Management Software"
        description="Manage pawn tickets, customers, inventory and payments in one clean dashboard."
        canonicalPath="/"
      />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-[#f4faf5]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-900">
            <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-base shadow-sm">
              P
            </span>
            PawnManager
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link to="/features" className="hover:text-slate-900 transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Login</Link>
            <Link
              to="/signup"
              className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-[0.98]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider">
              Built for pawn shops
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Run your pawn shop <br />
              <span className="text-emerald-600">with clarity.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Track pawn tickets, customers, and payments in one clean dashboard designed around real pawn shop workflows — not generic CRM software.
            </p>

            <div className="flex gap-3 flex-wrap pt-2">
              <Link to="/signup" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-[0.98]">
                Start Free Trial
              </Link>
              <Link to="/pricing" className="border border-gray-300 bg-white text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-2xs active:scale-[0.98]">
                View Pricing
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 pt-8 mt-4 border-t border-gray-200">
              {[
                { val: '100+', label: 'Shops' },
                { val: '4h', label: 'Saved / week' },
                { val: '99.9%', label: 'Uptime' },
              ].map((s) => (
                <div key={s.label} className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{s.val}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Image Display */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
              {/* Browser bar layout */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-1.5">
                {['bg-red-400', 'bg-amber-400', 'bg-emerald-400'].map(c => (
                  <span key={c} className={`width w-2.5 h-2.5 rounded-full ${c}`} />
                ))}
                <div className="ml-4 bg-white border border-gray-200 rounded-md px-12 py-0.5 text-[11px] text-slate-400 flex-1 max-w-xs mx-auto text-center font-medium select-none">
                  app.pawnmanager.com
                </div>
              </div>
              <img
                src={DASHBOARD_IMG}
                alt="PawnManager dashboard preview"
                className="w-full h-auto block object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything a pawn shop needs
            </h2>
            <p className="text-slate-600 mt-2 text-base">Purpose-built workspace mechanics, not adapted from generic platforms.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 transition-all hover:border-emerald-300 hover:bg-emerald-50/10 hover:shadow-2xs">
                <div className="text-3xl mb-4 select-none">{f.icon}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-6 border-t border-gray-200">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider mb-3">
            Workflow
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Up and running in minutes
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-1/2 right-[-1/2] h-[2px] bg-gray-200 z-0" />
              )}
              <div className="relative z-10">
                <div className="text-4xl font-black text-emerald-600/20 mb-3 tracking-tight select-none">
                  {s.n}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              Reviews
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted by real shop owners
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col justify-between">
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium italic mb-6">
                  "{t.body}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 select-none">
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{t.name}</p>
                    <p className="text-xs font-semibold text-slate-500 truncate">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-xs max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Replace your notebooks today
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8 font-medium">
            Join over 100 shops already using PawnManager to operate cleaner, faster, and smarter digital workflows.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/signup" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-[0.98] text-sm">
              Start Free Trial
            </Link>
            <Link to="/pricing" className="border border-gray-300 bg-white text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-2xs active:scale-[0.98] text-sm">
              View Pricing
            </Link>
          </div>
          <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">No credit card required • 14-day trial</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200/60 py-8 bg-[#f4faf5]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-semibold">
          <div className="flex items-center gap-2.5 text-slate-900">
            <span className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-extrabold text-xs">
              P
            </span>
            <span>PawnManager</span>
          </div>

          <div className="flex gap-6 text-slate-500">
            <Link to="/features" className="hover:text-slate-900 transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Login</Link>
          </div>

          <p className="text-xs font-bold text-slate-400">
            © 2026 PawnManager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}