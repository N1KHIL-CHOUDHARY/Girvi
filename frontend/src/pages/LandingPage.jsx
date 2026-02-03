import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Product screenshot URLs for showcase
const DASHBOARD_IMG = 'https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Darshboard_ndgkms.png';
const PAYMENTS_IMG = 'https://res.cloudinary.com/ddgdcca86/image/upload/v1765436517/Payments_j0iapt.png';
const CUSTOMERS_IMG = 'https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Customers_rul5vq.png';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeDemoTab, setActiveDemoTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className={`font-semibold text-lg ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}>
                PawnManager
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#demo" className={`font-medium transition-colors ${
                isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}>
                Demo
              </a>
              <a href="#features" className={`font-medium transition-colors ${
                isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}>
                Features
              </a>
              <a href="#faq" className={`font-medium transition-colors ${
                isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}>
                FAQ
              </a>
              <a href="#contact" className={`font-medium transition-colors ${
                isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}>
                Contact
              </a>
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors inline-block">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              variants={fadeInUp}
            >
              Manage pawn loans, customers, and payments in one place
            </motion.h1>
            
            <motion.p 
              className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              The complete pawn shop management platform for loans, customer records, inventory, and payments.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              variants={fadeInUp}
            >
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors inline-block">
                Start Free Trial
              </Link>
              <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors">
                Watch Demo
              </button>
            </motion.div>
            
            <motion.div 
              className="text-sm text-slate-400 space-x-6"
              variants={fadeInUp}
            >
              <span>✓ 14-day free trial</span>
              <span>✓ No credit card required</span>
              <span>✓ Cancel anytime</span>
            </motion.div>
          </motion.div>
          
          {/* Hero: Real dashboard screenshot for immediate product credibility */}
          <motion.div 
            className="mt-16 max-w-5xl mx-auto px-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="rounded-xl overflow-hidden border border-white/20 shadow-2xl shadow-black/30 bg-white/5 p-2 sm:p-4">
              <img
                src={DASHBOARD_IMG}
                alt="PawnManager dashboard showing loans overview, recent activity, and key metrics"
                className="w-full h-auto rounded-lg object-contain aspect-video sm:aspect-[16/10] object-top"
                loading="eager"
                width={1200}
                height={720}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* WORKFLOW / DEMO: Tabbed screenshots to show Dashboard, Customers, Payments */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              See PawnManager in action
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Dashboard, customers, and payments—all in one place.
            </p>
          </motion.div>

          {/* Tab buttons */}
          <motion.div 
            className="flex justify-center gap-2 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            {['Dashboard', 'Customers', 'Payments'].map((label, idx) => (
              <button
                key={label}
                onClick={() => setActiveDemoTab(idx)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeDemoTab === idx
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </motion.div>

          {/* Tab content: Screenshots with smooth transitions */}
          <motion.div 
            className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white p-2 sm:p-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDemoTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative"
              >
                {activeDemoTab === 0 && (
                  <img
                    src={DASHBOARD_IMG}
                    alt="PawnManager dashboard with loans overview and metrics"
                    className="w-full h-auto rounded-lg object-contain aspect-video object-top"
                    width={1200}
                    height={675}
                  />
                )}
                {activeDemoTab === 1 && (
                  <img
                    src={CUSTOMERS_IMG}
                    alt="PawnManager customers list and management view"
                    className="w-full h-auto rounded-lg object-contain aspect-video object-top"
                    width={1200}
                    height={675}
                  />
                )}
                {activeDemoTab === 2 && (
                  <img
                    src={PAYMENTS_IMG}
                    alt="PawnManager payments and transaction history"
                    className="w-full h-auto rounded-lg object-contain aspect-video object-top"
                    width={1200}
                    height={675}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 bg-slate-50">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <p className="text-slate-600 mb-8">Trusted by pawn shops nationwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['Quick Cash', 'Value Pawn', 'Ace Loans', 'Gold Standard', 'Pro Pawn'].map((company) => (
              <div key={company} className="bg-slate-200 px-6 py-3 rounded-full">
                <span className="font-medium text-slate-700">{company}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* WHY THIS PRODUCT */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why choose PawnManager?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Stop juggling spreadsheets and paper. Manage loans, customers, and payments in one purpose-built platform.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                title: "All-in-one platform",
                description: "Loans, customer records, inventory, and payments in one place. No more spreadsheets or disjointed systems."
              },
              {
                title: "Built for pawn shops",
                description: "Designed specifically for pawn workflows. Track every loan, renewal, and payment with ease."
              },
              {
                title: "Stay organized",
                description: "Never lose track of items or deadlines. Clear dashboards and reports keep your shop running smoothly."
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="text-center p-8"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to run your pawn shop
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features for loans, customers, inventory, and payments.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                title: "Loan Management",
                description: "Track every pawn loan from intake to redemption. Set terms, due dates, and interest with ease."
              },
              {
                title: "Customer Records",
                description: "Centralize customer data, contact info, and loan history in one searchable database."
              },
              {
                title: "Payments & Transactions",
                description: "Record payments, extensions, and redemptions. Keep a clear audit trail of all transactions."
              },
              {
                title: "Inventory Tracking",
                description: "Know exactly what's in your shop. Tag items to loans and track status at a glance."
              },
              {
                title: "Dashboards & Reports",
                description: "See active loans, revenue, and key metrics at a glance. Export reports when you need them."
              },
              {
                title: "Secure & Reliable",
                description: "Your data is protected. Built for reliability so you can focus on running your shop."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                variants={fadeInUp}
                whileHover={{ y: -2 }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Get started in minutes
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Simple setup process that gets you up and running without the complexity.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                step: "1",
                title: "Sign up",
                description: "Create your account in minutes. No credit card required to get started."
              },
              {
                step: "2",
                title: "Add your data",
                description: "Import customers and loans, or start fresh. The interface is built for pawn shop workflows."
              },
              {
                step: "3",
                title: "Run your shop",
                description: "Manage loans, customers, and payments in one place. PawnManager keeps everything organized."
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="text-center relative"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-slate-200 transform -translate-y-1/2"></div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about PawnManager.
            </p>
          </motion.div>
          
          <motion.div 
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                question: "How long does it take to set up PawnManager?",
                answer: "Most pawn shops are up and running within 30 minutes. Add your first customer and loan, and you're ready to go."
              },
              {
                question: "Can I import my existing customer and loan data?",
                answer: "Yes. You can import data from spreadsheets or enter it manually. We can help with larger migrations if needed."
              },
              {
                question: "What happens if I need to cancel?",
                answer: "You can cancel anytime with no penalties. We'll help you export your data, and you'll retain access until the end of your billing period."
              },
              {
                question: "Is my pawn shop data secure?",
                answer: "Absolutely. Your data is encrypted and stored securely. We take privacy seriously—your customer and loan information is protected."
              },
              {
                question: "Do you offer support?",
                answer: "Yes, all plans include email support. We're here to help you get the most out of PawnManager."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-sm"
                variants={fadeInUp}
              >
                <button
                  className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  <span className={`text-blue-600 transform transition-transform ${
                    openFaq === index ? 'rotate-45' : ''
                  }`}>
                    +
                  </span>
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6 text-slate-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-slate-900">
        <motion.div 
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            Ready to run your pawn shop better?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Join pawn shops nationwide using PawnManager to manage loans, customers, and payments.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
            variants={fadeInUp}
          >
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors inline-block">
              Start Your Free Trial
            </Link>
            <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors">
              Schedule Demo
            </button>
          </motion.div>
          
          <motion.p 
            className="text-sm text-slate-400"
            variants={fadeInUp}
          >
            No credit card required • Cancel anytime • 14-day free trial
          </motion.p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg text-white">PawnManager</span>
            </div>
            
            <div className="flex space-x-8 mb-4 md:mb-0">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#demo" className="text-slate-400 hover:text-white transition-colors">Demo</a>
              <a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a>
              <a href="mailto:support@pawnmanager.com" className="text-slate-400 hover:text-white transition-colors">Contact</a>
            </div>
            
            <p className="text-slate-400 text-sm">
              © 2025 PawnManager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
