import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';

const DASHBOARD_IMG =
  'https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Darshboard_ndgkms.png';

const LandingPage = () => {
  return (
    <main className="min-h-screen bg-[#f4faf5] text-slate-900">
      <Seo
        title="PawnManager — Pawn Shop Management Software"
        description="Manage pawn tickets, customers, inventory and payments in one clean dashboard."
        canonicalPath="/"
      />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#f4faf5]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-semibold text-lg">
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white">
              P
            </span>
            PawnManager
          </Link>

          <nav className="hidden md:flex gap-8 text-sm text-slate-600">
            <Link to="/features" className="hover:text-slate-900">Features</Link>
            <Link to="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link to="/login" className="hover:text-slate-900">Login</Link>
          </nav>

          <Link
            to="/signup"
            className="hidden md:inline-block bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-emerald-600 font-semibold uppercase tracking-widest mb-4">
              Built for pawn shops
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Manage your pawn shop with clarity and confidence.
            </h1>

            <p className="text-lg text-slate-600 mb-8">
              Track pawn tickets, customers, and payments in one clean dashboard designed for real workflows.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700">
                Start Free Trial
              </Link>
              <Link className="border border-slate-200 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50">
                View Pricing
              </Link>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              <div>
                <p className="text-2xl font-semibold">100+</p>
                <p className="text-sm text-slate-500">Shops</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">4h</p>
                <p className="text-sm text-slate-500">Saved / week</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">100%</p>
                <p className="text-sm text-slate-500">Tracked</p>
              </div>
            </div>
          </div>

          <img
            src={DASHBOARD_IMG}
            alt="Dashboard preview"
            className="rounded-2xl shadow-lg w-full"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need to run your shop
            </h2>
            <p className="text-slate-600">
              Designed specifically for pawn businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Pawn Tickets',
                desc: 'Track loans, interest, renewals and due dates easily.'
              },
              {
                title: 'Customer Records',
                desc: 'Store KYC, contact info and full loan history.'
              },
              {
                title: 'Payments',
                desc: 'Record and manage all transactions with accuracy.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border">
                <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">
            Get started in minutes
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              'Sign up',
              'Add customers',
              'Track repayments'
            ].map((step, i) => (
              <div key={i}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <p className="font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">
            Get full control of your pawn shop today
          </h2>

          <p className="text-slate-300 mb-8">
            Replace notebooks and spreadsheets with a clean modern system.
          </p>

          <Link className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-10 bg-[#f4faf5]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 font-semibold">
            <span className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
              P
            </span>
            PawnManager
          </div>

          <div className="flex gap-6 text-sm text-slate-600">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/login">Login</Link>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 PawnManager
          </p>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;