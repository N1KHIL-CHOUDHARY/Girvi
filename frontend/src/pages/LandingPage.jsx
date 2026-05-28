import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import Seo from '@/components/Seo'
import {
  IconTicket,
  IconUsers,
  IconReceipt2,
  IconChartPie,
  IconBell,
  IconShieldCheck,
  IconArrowRight,
  IconCircleCheckFilled
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const DASHBOARD_IMG = 'https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Darshboard_ndgkms.png'

const features = [
  {
    icon: IconTicket,
    title: 'Pawn Tickets',
    desc: 'Track loans, interest, renewals, and due dates with full audit trails and automated reminders.',
  },
  {
    icon: IconUsers,
    title: 'Customer Records',
    desc: 'Store KYC documents, contact info, and complete loan history in one searchable place.',
  },
  {
    icon: IconReceipt2,
    title: 'Payments',
    desc: 'Record every transaction with accuracy. Accept partials, log late fees, and generate receipts.',
  },
  {
    icon: IconChartPie,
    title: 'Analytics',
    desc: 'Understand your portfolio at a glance — overdue tickets, revenue trends, and top customers.',
  },
  {
    icon: IconBell,
    title: 'Reminders',
    desc: 'Automatically notify customers when tickets are due so you never lose a loan to forfeiture.',
  },
  {
    icon: IconShieldCheck,
    title: 'Compliance Ready',
    desc: 'Built-in ID verification logs and data retention policies to keep you audit-ready.',
  },
]

const steps = [
  { n: '01', title: 'Create your shop', body: 'Sign up instantly and set up your shop profile in seconds.' },
  { n: '02', title: 'Add customers', body: 'Import existing records or start fresh with our guided setup.' },
  { n: '03', title: 'Issue tickets', body: 'Set terms, interest rates, and due dates — print or send digitally.' },
  { n: '04', title: 'Track payments', body: 'Payments, renewals, and forfeitures handled automatically.' },
]

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
    body: 'The overdue alert system alone saves us hours every week. Customers actually pay on time now.',
    initials: 'MS',
  },
  {
    name: 'David K.',
    role: 'Owner, QuickCash Pawn',
    body: 'Finally, software that understands how pawn shops actually work. Not a generic CRM.',
    initials: 'DK',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 20 } 
  }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0A0A0A] text-zinc-900 dark:text-white antialiased font-sans selection:bg-zinc-200 dark:selection:bg-white/20 scroll-smooth">
      <Seo
        title="PawnManager — Premium Pawn Shop Software"
        description="Manage pawn tickets, customers, inventory and payments in one clean dashboard. Completely free to use."
        canonicalPath="/"
      />

      <header className="sticky top-0 z-50 border-b border-zinc-200/60 dark:border-white/[0.05] bg-[#FAFAF9]/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-lg font-medium tracking-tight">
            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm shadow-sm">
              P
            </span>
            PawnManager
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Workflow</a>
            <Link to="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Login</Link>
            <Link
              to="/signup"
              className="flex items-center justify-center h-10 px-5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid lg:grid-cols-2 gap-16 items-center"
            >
              <div className="space-y-8 relative z-10">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200/60 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 dark:text-zinc-400">100% Free Forever</span>
                </motion.div>

                <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tighter leading-[1.05] text-zinc-900 dark:text-white">
                  Run your shop <br />
                  <span className="text-zinc-400 dark:text-zinc-500">with absolute clarity.</span>
                </motion.h1>

                <motion.p variants={fadeUp} className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                  Track pawn tickets, customers, and payments in a premium workspace designed around real pawn shop workflows. Stop wrestling with generic software.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/signup" className="flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm group">
                    Create Free Account
                    <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href="#features" className="flex items-center justify-center h-14 px-8 rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200/60 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm font-medium hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                    Explore Features
                  </a>
                </motion.div>

                <motion.div variants={fadeUp} className="grid grid-cols-3 gap-8 pt-10 mt-10 border-t border-zinc-200/60 dark:border-white/[0.05]">
                  {[
                    { val: '100+', label: 'Shops' },
                    { val: '4h', label: 'Saved / Week' },
                    { val: '99.9%', label: 'Uptime' },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-white">{s.val}</p>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="relative lg:h-[600px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200/40 via-transparent to-zinc-200/40 dark:from-white/[0.05] dark:via-transparent dark:to-white/[0.05] rounded-[3rem] blur-3xl -z-10" />
                <div className="relative w-full rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.1] bg-white dark:bg-[#0A0A0A] p-2 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-white/[0.05] bg-zinc-50 dark:bg-[#121212] rounded-t-[1.5rem]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    </div>
                    <div className="mx-auto px-10 py-1 rounded-md bg-white dark:bg-[#1A1A1A] border border-zinc-200/60 dark:border-white/[0.05] text-[10px] font-mono text-zinc-400">
                      app.pawnmanager.com
                    </div>
                  </div>
                  <img
                    src={DASHBOARD_IMG}
                    alt="PawnManager Dashboard"
                    className="w-full h-auto rounded-b-[1.5rem] object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-24 md:py-32 border-t border-zinc-200/60 dark:border-white/[0.05] scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="text-center max-w-2xl mx-auto mb-20"
            >
              <motion.p variants={fadeUp} className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">
                Capabilities
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-white mb-6">
                Everything your shop needs
              </motion.h2>
              <motion.p variants={fadeUp} className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                Purpose-built mechanics constructed specifically for pawn brokers. Free forever.
              </motion.p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((f) => (
                <motion.div key={f.title} variants={fadeUp} className="relative overflow-hidden rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-8 shadow-sm group hover:border-zinc-300 dark:hover:border-white/[0.1] transition-colors">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05] flex items-center justify-center mb-6">
                      <f.icon className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                    </div>
                    <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-white mb-3">{f.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="workflow" className="py-24 md:py-32 border-t border-zinc-200/60 dark:border-white/[0.05] bg-zinc-50 dark:bg-white/[0.02] scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center max-w-2xl mx-auto mb-20"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">
                Workflow
              </p>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-white">
                Up and running in minutes
              </h2>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {steps.map((s, i) => (
                <motion.div key={s.n} variants={fadeUp} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-[1px] bg-zinc-200 dark:bg-white/10 z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-[#121212] border border-zinc-200/60 dark:border-white/[0.05] flex items-center justify-center text-xl font-mono text-zinc-400 dark:text-zinc-500 mb-6 shadow-sm">
                      {s.n}
                    </div>
                    <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24 md:py-32 border-t border-zinc-200/60 dark:border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center max-w-2xl mx-auto mb-20"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">
                Reviews
              </p>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-white">
                Trusted by shop owners
              </h2>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid gap-6 lg:grid-cols-3"
            >
              {testimonials.map((t) => (
                <motion.div key={t.name} variants={fadeUp} className="relative overflow-hidden flex flex-col justify-between bg-white dark:bg-[#121212] border border-zinc-200/60 dark:border-white/[0.05] rounded-[2rem] p-8 shadow-sm">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
                  <div className="relative z-10 mb-8">
                    <div className="flex gap-1 mb-6 text-zinc-400 dark:text-zinc-500">
                      {[1, 2, 3, 4, 5].map(i => <IconCircleCheckFilled key={i} className="w-4 h-4" />)}
                    </div>
                    <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      "{t.body}"
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center gap-4 pt-6 border-t border-zinc-100 dark:border-white/[0.05]">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-sm font-mono text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{t.name}</p>
                      <p className="text-[11px] font-mono text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24 md:py-32 border-t border-zinc-200/60 dark:border-white/[0.05]">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-4xl mx-auto px-6 text-center"
          >
            <div className="relative overflow-hidden bg-white dark:bg-[#121212] border border-zinc-200/60 dark:border-white/[0.05] rounded-[3rem] p-10 md:p-20 shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-white mb-6">
                  Replace your notebooks today.
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
                  Join modern shops operating cleaner, faster, and smarter workflows. Software that respects your time, completely free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/signup" className="flex items-center justify-center h-14 px-8 w-full sm:w-auto rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm">
                    Create Free Account
                  </Link>
                </div>
                <p className="mt-8 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  Completely free • No hidden fees
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#0A0A0A] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-zinc-900 dark:text-white font-medium">
            <span className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm">
              P
            </span>
            <span>PawnManager</span>
          </div>

          <div className="flex gap-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Workflow</a>
            <Link to="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Login</Link>
          </div>

          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            © 2026 PawnManager.
          </p>
        </div>
      </footer>
    </div>
  )
}