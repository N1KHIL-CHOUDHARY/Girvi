import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring
} from "motion/react";
import {
  Users,
  BarChart3,
  Cloud,
  Shield,
  TrendingUp,
  PlayCircle,
  Menu,
  X,
  Plus,
  Minus,
  LayoutDashboard,
  Wallet,
  UserCircle,
  LogOut,
  Zap,
  Clock,
  CheckCircle2
} from "lucide-react";

const heroImage = "https://res.cloudinary.com/ddgdcca86/image/upload/v1765437152/bussinessman_zqomrz.png";
const appScreenPayments ="https://res.cloudinary.com/ddgdcca86/image/upload/v1765436517/Payments_j0iapt.png";
const appScreenCustomer ="https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Customers_rul5vq.png";
const appScreenDashboard ="https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Darshboard_ndgkms.png";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, image: appScreenDashboard, desc: "Get a bird's eye view of your daily performance, recent loans, and inventory alerts." },
  { id: "customer", label: "Customers", icon: UserCircle, image: appScreenCustomer, desc: "Manage detailed client profiles, view history, and track pawn limits instantly." },
  { id: "payments", label: "Payments", icon: Wallet, image: appScreenPayments, desc: "Process loans, buy-backs, and retail sales with a streamlined, secure checkout." },
];

export default function PawnManagerLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = tabs.findIndex(t => t.id === current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex].id;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScrollListener = () => {
      setIsScrolled(window.scrollY > 50);
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
      answer: "Yes. PawnManager supports customizable interest rules, grace periods, and reporting formats so you can align the system with your state's regulatory requirements."
    },
    {
      question: "Does PawnManager work offline?",
      answer: "Offline support is currently in development. We're actively working on enabling essential features to function during temporary internet outages, with automatic data syncing once you're back online."
    },
    {
      question: "How secure is my data?",
      answer: "Your data is protected with 256-bit SSL encryption and hosted on secure AWS infrastructure with automated daily backups and strict access controls."
    },
    {
      question: "Do you offer onboarding support?",
      answer: "Yes. We offer self-serve onboarding with step-by-step setup guides, video tutorials, and in-app tooltips designed to help your team get comfortable quickly."
    },
    {
      question: "Does PawnManager work with barcode scanners and printers?",
      answer: "Yes. PawnManager is plug-and-play compatible with most standard USB and Bluetooth barcode scanners, receipt printers, and label printers."
    },
    {
      question: "Can I manage multiple store locations?",
      answer: "Yes. Our multi-store system lets you manage inventory transfers, permissions, financial reports, and user access across all your locations from one dashboard."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-x-hidden">

      {/* --- Navbar --- */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen 
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold ${isScrolled || isMobileMenuOpen ? 'text-slate-900' : 'text-white'}`}>
              PawnManager
            </span>
          </div>

          {/* Desktop Links */}
          <div className={`hidden md:flex items-center gap-8 font-medium text-sm ${isScrolled || isMobileMenuOpen ? 'text-slate-700' : 'text-white/90'}`}>
            <button onClick={() => handleScroll('features')} className="hover:text-emerald-600 transition">Features</button>
            <button onClick={() => handleScroll('faq')} className="hover:text-emerald-600 transition">FAQ</button>
            <button onClick={() => handleScroll('contact')} className="hover:text-emerald-600 transition">Contact</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-sm font-semibold flex items-center gap-2"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button
                  className={`text-sm font-semibold hover:text-emerald-600 transition flex items-center gap-2 ${isScrolled || isMobileMenuOpen ? 'text-slate-700' : 'text-white'}`}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className={`text-sm font-semibold hover:text-emerald-600 transition ${isScrolled || isMobileMenuOpen ? 'text-slate-700' : 'text-white'}`}
                >
                  Login
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-sm font-semibold"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden z-50 relative ${isScrolled || isMobileMenuOpen ? 'text-slate-900' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence initial={false}>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 w-full bg-white pt-20 p-6 flex flex-col gap-5 shadow-xl md:hidden z-40 border-b border-slate-200"
            >
              <button onClick={() => handleScroll('features')} className="text-left text-base font-medium text-slate-700 hover:text-emerald-600 transition">Features</button>
              <button onClick={() => handleScroll('faq')} className="text-left text-base font-medium text-slate-700 hover:text-emerald-600 transition">FAQ</button>
              <button onClick={() => handleScroll('contact')} className="text-left text-base font-medium text-slate-700 hover:text-emerald-600 transition">Contact</button>

              <div className="h-px bg-slate-200 my-2"></div>

              {isLoggedIn ? (
                <>
                  <button className="text-left text-base font-medium text-slate-700 flex items-center gap-2">
                    <LayoutDashboard size={18} /> Go to Dashboard
                  </button>
                  <button className="py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="text-left text-base font-medium text-slate-700">Login</button>
                  <button className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg">Get Started</button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO --- */}
      <header className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center pt-20 px-6 overflow-hidden">
        {/* Ambient Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-[120px]"></div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6"
            >
              <Zap size={16} className="text-emerald-400" />
              Cloud-Based Management System
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Pawn Shop<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Management
              </span><br />
              Simplified.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-slate-300 text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
            >
              Grow your pawn business with a platform designed to handle loans, inventory, and customers in one secure cloud solution.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-12"
            >
              <button
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all transform"
              >
                Get Started Free
              </button>

              <button
                onClick={() => handleScroll('demo-section')}
                className="px-8 py-4 rounded-xl border border-slate-600 text-white font-semibold hover:bg-slate-800/50 backdrop-blur-sm transition flex items-center gap-2"
              >
                <PlayCircle size={20} /> View Demo
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-6 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 120, damping: 18 }}
            className="relative flex justify-center md:justify-end"
          >
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-[58%_42%_35%_65%_/_60%_38%_62%_40%] blur-[100px] -z-10 scale-[1.4]" />
               <motion.img
                 src={heroImage}
                 alt="3D Character Working"
                 className="w-full max-w-[500px] h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)]"
                 initial={{ scale: 0.9 }}
                 animate={{ scale: 1 }}
                 transition={{ duration: 0.9, type: "spring" }}
               />
            </div>
          </motion.div>
        </div>
      </header>

      {/* --- WORKFLOW TABS --- */}
      <section id="demo-section" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6"
            >
              <Clock size={16} />
              Interactive Demo
            </motion.div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Experience the Workflow</h2>
            <p className="text-lg text-slate-600">Switch between views to see how PawnManager streamlines your operations.</p>
          </div>

          <div className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200 bg-white">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-6 px-4 text-center focus:outline-none transition-all duration-300 ${
                    activeTab === tab.id ? "text-emerald-600 bg-emerald-50/50" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 font-semibold text-base md:text-lg">
                    <tab.icon size={20} className={activeTab === tab.id ? "text-emerald-600" : "text-slate-400"} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>

                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      initial={false}
                      className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-8 md:p-12 bg-slate-50 min-h-[500px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full text-center"
                >
                  <div className="mb-8">
                    <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">{tabs.find(t => t.id === activeTab).desc}</p>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200 inline-block bg-white">
                    <img
                      src={tabs.find(t => t.id === activeTab).image}
                      alt={tabs.find(t => t.id === activeTab).label}
                      className="max-w-full h-auto object-cover"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto bg-slate-50">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6"
          >
            <Zap size={16} />
            Features
          </motion.div>
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">Everything you need to run efficiently</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">We've bundled all the essential tools into one cohesive platform.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Users />}
            title="Customer CRM"
            desc="Keep track of customer history, loan limits, and personal details in one secure database."
          />
          <FeatureCard
            icon={<BarChart3 />}
            title="Inventory Management"
            desc="Real-time tracking of items, automated categorization, and aging inventory alerts."
          />
          <FeatureCard
            icon={<TrendingUp />}
            title="Loan Tracking"
            desc="Automated interest calculations and due date reminders for all active loans."
          />
          <FeatureCard
            icon={<BarChart3 />}
            title="Financial Reporting"
            desc="Generate profit/loss statements, audit reports, and daily transaction summaries instantly."
          />
          <FeatureCard
            icon={<Shield />}
            title="Secure Data"
            desc="Bank-grade encryption ensures your business and customer data is never compromised."
          />
          <FeatureCard
            icon={<Cloud />}
            title="Cloud-Based Access"
            desc="Manage your shop from anywhere. Works seamlessly on desktop, tablet, and mobile."
          />
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6"
            >
              FAQs
            </motion.div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Common Questions</h2>
            <p className="text-slate-600 text-lg">Everything you need to know about the product.</p>
          </div>

          <div className="space-y-4">
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
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/30 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to transform your pawn shop?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of pawn shops already using PawnManager to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all transform">
              Start Free Trial
            </button>
            <button className="px-8 py-4 rounded-xl border border-slate-600 text-white font-semibold hover:bg-slate-800/50 transition">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PawnManager</span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">Modernizing the pawn industry with secure, cloud-based management solutions.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => handleScroll('features')} className="hover:text-emerald-400 transition">Features</button></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Security</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Contact</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a></li>
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

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-6 group-hover:from-emerald-500 group-hover:to-teal-600 transition-all duration-300">
        {React.cloneElement(icon, { className: "w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" })}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <motion.div
      layout
      initial={false}
      onClick={onClick}
      className={`bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 ${
        isOpen 
          ? 'border-emerald-200 shadow-lg shadow-emerald-500/5' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <button className="flex justify-between items-start w-full text-left p-6 focus:outline-none group">
        <span className={`font-semibold text-lg pr-4 transition-colors ${isOpen ? 'text-emerald-700' : 'text-slate-800'}`}>
          {question}
        </span>
        <motion.div
          layout
          transition={{ duration: 0.2 }}
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
          }`}
        >
          {isOpen ? <Minus size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
        </motion.div>
        </button>

<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="px-6 pb-6 text-slate-600 text-base leading-relaxed border-t border-slate-100 pt-4">
        {answer}
      </div>
    </motion.div>
  )}
</AnimatePresence>
</motion.div>
);
}
