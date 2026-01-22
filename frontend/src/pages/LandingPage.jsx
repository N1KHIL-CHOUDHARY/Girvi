import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Users,
  BarChart3,
  Cloud,
  Shield,
  TrendingUp,
  Menu,
  X,
  Plus,
  Minus,
  LayoutDashboard,
  Wallet,
  UserCircle,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Zap
} from "lucide-react";

const appScreenDashboard = "https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Darshboard_ndgkms.png";
const appScreenCustomer = "https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Customers_rul5vq.png";
const appScreenPayments = "https://res.cloudinary.com/ddgdcca86/image/upload/v1765436517/Payments_j0iapt.png";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, image: appScreenDashboard, desc: "See today's loan activity, inventory aging, and cash flow at a glance" },
  { id: "customer", label: "Customers", icon: UserCircle, image: appScreenCustomer, desc: "Pull up any customer's loan history, ID verification, and credit limits in seconds" },
  { id: "payments", label: "Payments", icon: Wallet, image: appScreenPayments, desc: "Process buybacks, renewals, and retail sales without switching systems" },
];

export default function PawnManagerLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScrollListener = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScrollListener);
    return () => window.removeEventListener("scroll", handleScrollListener);
  }, []);

  const handleScroll = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const faqData = [
    {
      question: "Is PawnManager compliant with local regulations?",
      answer: "Yes. You can configure daily, monthly, or compounding interest rates to match your state's requirements. Our system automatically calculates totals and generates compliant pawn tickets with all required disclosures."
    },
    {
      question: "Does PawnManager work offline?",
      answer: "Offline support is currently in development. We're actively working on enabling essential features to function during temporary internet outages, with automatic data syncing once you're back online."
    },
    {
      question: "How secure is my data?",
      answer: "Your data is protected with 256-bit SSL encryption and hosted on SOC 2 certified infrastructure with automated daily backups, strict access controls, and regular third-party security audits."
    },
    {
      question: "Do you offer onboarding support?",
      answer: "Yes. Every new customer receives a personalized onboarding session where we configure the system for your state's requirements, import your existing data, and train your team on daily operations."
    },
    {
      question: "Does PawnManager work with barcode scanners and printers?",
      answer: "Yes. PawnManager is plug-and-play compatible with most standard USB and Bluetooth barcode scanners, receipt printers, and label printers. We provide a tested hardware compatibility list during setup."
    },
    {
      question: "Can I manage multiple store locations?",
      answer: "Yes. Our multi-store system lets you manage inventory transfers, set location-specific permissions, view consolidated financial reports, and control user access across all your locations from one dashboard."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900">

      {/* --- Navbar --- */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-200 ${
          isScrolled || isMobileMenuOpen 
            ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200" 
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">PawnManager</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-700">
            <button onClick={() => handleScroll('features')} className="hover:text-emerald-600 transition-colors">Features</button>
            <button onClick={() => handleScroll('faq')} className="hover:text-emerald-600 transition-colors">FAQ</button>
            <button onClick={() => handleScroll('contact')} className="hover:text-emerald-600 transition-colors">Contact</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors">
              <Link to="/login">Login</Link>
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold">
              Schedule Demo
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden z-50 relative text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence initial={false}>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                <button onClick={() => handleScroll('features')} className="text-left text-base font-medium text-slate-700 hover:text-emerald-600 transition-colors">Features</button>
                <button onClick={() => handleScroll('faq')} className="text-left text-base font-medium text-slate-700 hover:text-emerald-600 transition-colors">FAQ</button>
                <button onClick={() => handleScroll('contact')} className="text-left text-base font-medium text-slate-700 hover:text-emerald-600 transition-colors">Contact</button>
                <div className="h-px bg-slate-200 my-2"></div>
                <button className="text-left text-base font-medium text-slate-700">Login</button>
                <button className="py-3 rounded-lg bg-emerald-600 text-white font-semibold text-center">Schedule Demo</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO --- */}
<header className="bg-white pt-32 pb-24 px-6 border-b border-slate-200">
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center">

    {/* Left: Value */}
    <div>
      <span className="inline-block mb-4 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
        Pawn shop management software
      </span>

      <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
        Accurate loan tracking.
        <br />
        Built-in compliance.
        <br />
        <span className="text-emerald-700">No guesswork.</span>
      </h1>

      <p className="text-lg text-slate-600 max-w-xl mb-10 leading-relaxed">
        PawnManager gives you full control over loans, inventory, and customer
        records — with workflows designed around real pawn shop operations.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="px-8 py-4 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
          Schedule a Live Demo
        </button>
        <button className="px-8 py-4 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
          View Sample Dashboard
        </button>
      </div>
    </div>

    {/* Right: Product Preview */}
    <div className="relative">
      {/* Subtle frame */}
      <div className="absolute -top-6 -left-6 w-full h-full rounded-xl border border-slate-200 bg-slate-50" />

      <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-xl bg-white">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="ml-2">PawnManager — Dashboard</span>
        </div>

        <img
          src={appScreenDashboard}
          alt="PawnManager dashboard overview"
          className="w-full h-auto"
        />
      </div>
    </div>
  </div>
</header>


      {/* --- SOCIAL PROOF --- */}
      <section className="py-12 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-slate-500 text-sm font-medium mb-6">TRUSTED BY PAWN PROFESSIONALS</p>
          <blockquote className="text-xl text-slate-700 italic max-w-3xl mx-auto">
            "We've processed $2.3M in loans without a single compliance issue. PawnManager handles everything our state requires automatically."
          </blockquote>
          <p className="text-slate-500 text-sm mt-4">— Mike Chen, Owner, Golden State Pawn (Sacramento, CA)</p>
        </div>
      </section>

      {/* --- BUSINESS OUTCOMES --- */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Built for your business outcomes</h2>
            <p className="text-lg text-slate-600">The results that matter to pawn shop owners</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <OutcomeCard
              icon={<Shield />}
              title="Maintain Compliance"
              desc="Automated interest calculations match state regulations. Every pawn ticket includes required disclosures."
            />
            <OutcomeCard
              icon={<CheckCircle2 />}
              title="Increase Accuracy"
              desc="Eliminate manual errors with barcode scanning, auto-fill, and automatic calculations on every transaction."
            />
            <OutcomeCard
              icon={<Clock />}
              title="Save Time"
              desc="Process loans 3x faster than paper-based systems. Spend less time on paperwork, more time serving customers."
            />
          </div>
        </div>
      </section>

      {/* --- PRODUCT PREVIEW --- */}
      <section className="py-20 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">See how it works</h2>
            <p className="text-lg text-slate-600">Everything you need in one platform</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-5 px-4 text-center focus:outline-none transition-colors ${
                    activeTab === tab.id ? "text-emerald-600 bg-slate-50" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 font-semibold text-base">
                    <tab.icon size={20} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>

                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-8 md:p-12">
              <div className="mb-8 text-center">
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                  {tabs.find(t => t.id === activeTab).desc}
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl border border-slate-200">
                <img
                  src={tabs.find(t => t.id === activeTab).image}
                  alt={tabs.find(t => t.id === activeTab).label}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-900">Everything you need to operate efficiently</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Core capabilities built for pawn shop operations</p>
        </div>

        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Operations</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Users />}
              title="Customer loan history & limits"
              desc="Access complete customer profiles with loan history, payment records, and pre-approved credit limits."
            />
            <FeatureCard
              icon={<BarChart3 />}
              title="Real-time inventory tracking"
              desc="Track items from pawn to sale with automated categorization, aging alerts, and SKU management."
            />
            <FeatureCard
              icon={<TrendingUp />}
              title="Automated loan calculations"
              desc="Interest, fees, and due dates calculated automatically based on your state's regulations."
            />
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Compliance & Security</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FileText />}
              title="Compliant reporting"
              desc="Generate state-required reports, audit trails, and transaction histories with one click."
            />
            <FeatureCard
              icon={<Shield />}
              title="Bank-level encryption & backups"
              desc="Your data is encrypted in transit and at rest, with automated daily backups to secure infrastructure."
            />
            <FeatureCard
              icon={<Lock />}
              title="Role-based access control"
              desc="Set permissions by employee role to protect sensitive customer and financial data."
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Growth</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BarChart3 />}
              title="Financial dashboards"
              desc="Track daily revenue, outstanding loans, and profit margins in real-time from any device."
            />
            <FeatureCard
              icon={<Cloud />}
              title="Cloud-based access"
              desc="Access your system from desktop, tablet, or mobile. No installation required."
            />
            <FeatureCard
              icon={<Zap />}
              title="Multi-location support"
              desc="Manage inventory, transfers, and reporting across multiple store locations from one account."
            />
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Frequently asked questions</h2>
            <p className="text-slate-600 text-lg">Common questions from pawn shop owners</p>
          </div>

          <div className="space-y-3">
            {faqData.map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openFaqIndex === index}
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            See how PawnManager works for your shop
          </h2>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Schedule a personalized walkthrough with our team. We'll show you exactly how PawnManager handles your state's compliance requirements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
              Schedule a Demo
            </button>
            <button className="px-8 py-4 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PawnManager</span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Professional management software for pawn shops. Trusted by hundreds of businesses nationwide.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleScroll('features')} className="hover:text-emerald-400 transition-colors">Features</button></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-slate-500 text-sm border-t border-slate-800 pt-8">
          <p>© {new Date().getFullYear()} PawnManager Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function OutcomeCard({ icon, title, desc }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
        {React.cloneElement(icon, { className: "w-8 h-8 text-emerald-600" })}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4">
        {React.cloneElement(icon, { className: "w-6 h-6 text-slate-700" })}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div
      className={`bg-white rounded-lg overflow-hidden border transition-colors ${
        isOpen ? 'border-slate-300' : 'border-slate-200'
      }`}
    >
      <button 
        className="flex justify-between items-start w-full text-left p-6 focus:outline-none"
        onClick={onClick}
      >
        <span className="font-semibold text-lg pr-4 text-slate-900">
          {question}
        </span>
        <div className="shrink-0 w-6 h-6 flex items-center justify-center text-slate-400">
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}