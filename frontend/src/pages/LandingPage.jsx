import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Seo from '@/components/Seo';

// Product screenshot URLs for showcase
const DASHBOARD_IMG = 'https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Darshboard_ndgkms.png';
const PAYMENTS_IMG = 'https://res.cloudinary.com/ddgdcca86/image/upload/v1765436517/Payments_j0iapt.png';
const CUSTOMERS_IMG = 'https://res.cloudinary.com/ddgdcca86/image/upload/v1765436515/Customers_rul5vq.png';
const logo_IMG ='https://res.cloudinary.com/ddgdcca86/image/upload/v1770195946/logo_imxhzo.png';

const LandingPage = () => {
  const { t } = useTranslation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeDemoTab, setActiveDemoTab] = useState(0);
  
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
      <Seo
        title="Pawn Shop Management Software & POS – Inventory & Billing"
        description="Cloud pawn shop POS for India with inventory, billing and loan tracking in one simple dashboard."
        canonicalPath="/"
      />

      <nav
  className={`fixed inset-x-0 z-50 transition-all duration-300 ${
    isScrolled
      ? 'bg-white/80 backdrop-blur-md shadow-md'
      : 'bg-transparent'
  }`}
>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="h-7 w-7">
                <img
                  src={logo_IMG}
                  alt="PawnManager logo"
                  width={28}
                  height={28}
                  loading="lazy"
                />
              </h1>
              <span className={`font-semibold text-lg ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}>
                {t('landing.appName')}
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#demo" className={`font-medium transition-colors ${
                isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}>
                {t('nav.demo')}
              </a>
              <a href="#features" className={`font-medium transition-colors ${
                isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}>
                {t('nav.features')}
              </a>
              <a href="#faq" className={`font-medium transition-colors ${
                isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}>
                {t('nav.faq')}
              </a>
              <a href="#contact" className={`font-medium transition-colors ${
                isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'
              }`}>
                {t('nav.contact')}
              </a>
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors inline-block">
                {t('nav.getStarted')}
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
            initial={false}
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              variants={fadeInUp}
            >
              {t('landing.heroTitle')}
            </motion.h1>
            
            <motion.p 
              className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              {t('landing.heroSubtitle')}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              variants={fadeInUp}
            >
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors inline-block">
                {t('landing.startFreeTrial')}
              </Link>
              <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors">
                {t('landing.watchDemo')}
              </button>
            </motion.div>
            
            <motion.div 
              className="text-sm text-slate-400 space-x-6"
              variants={fadeInUp}
            >
              <span>✓ {t('landing.freeTrial14')}</span>
              <span>✓ {t('landing.noCreditCard')}</span>
              <span>✓ {t('landing.cancelAnytime')}</span>
            </motion.div>
          </motion.div>
          
          {/* Hero: Real dashboard screenshot for immediate product credibility */}
          <motion.div 
            className="mt-16 max-w-5xl mx-auto px-4"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl overflow-hidden border border-white/20 shadow-2xl shadow-black/30 bg-white/5 p-2 sm:p-4">
              <img
                src={DASHBOARD_IMG}
                alt={t('landing.dashboardAlt')}
                className="w-full h-auto rounded-lg object-contain aspect-video sm:aspect-[16/10] object-top"
                loading="eager"
                width={1200}
                height={720}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEO TEXT: What PawnManager is and who it is for */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Pawn shop management software for real-world pawn businesses
          </h2>
          <p className="text-slate-700">
            PawnManager is a pawn shop management software and POS that helps you track pledged
            items, customer records, pawn tickets and repayments in one secure system instead of
            scattered notebooks and Excel sheets.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Problems most pawn shops face
              </h3>
              <p className="text-slate-700">
                Without a proper pawn shop inventory system it is hard to see which tickets are due,
                which customers are overdue and how much money is tied up in active loans. Manual
                interest calculations and handwritten bills also increase the risk of mistakes.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                How PawnManager solves them
              </h3>
              <p className="text-slate-700">
                PawnManager automates ticket calculations, keeps every pledged item linked to a
                customer profile and gives owners a live dashboard of loans, inventory and payments.
                It is a simple pawn shop billing software that fits smoothly into your daily work.
              </p>
            </div>
          </div>
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
              {t('landing.seeInAction')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('landing.demoSubtitle')}
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
            {[t('nav.dashboard'), t('nav.customers'), t('nav.payments')].map((label, idx) => (
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
                    alt={t('landing.dashboardImgAlt')}
                    className="w-full h-auto rounded-lg object-contain aspect-video object-top"
                    width={1200}
                    height={675}
                    loading="lazy"
                  />
                )}
                {activeDemoTab === 1 && (
                  <img
                    src={CUSTOMERS_IMG}
                    alt={t('landing.customersImgAlt')}
                    className="w-full h-auto rounded-lg object-contain aspect-video object-top"
                    width={1200}
                    height={675}
                    loading="lazy"
                  />
                )}
                {activeDemoTab === 2 && (
                  <img
                    src={PAYMENTS_IMG}
                    alt={t('landing.paymentsImgAlt')}
                    className="w-full h-auto rounded-lg object-contain aspect-video object-top"
                    width={1200}
                    height={675}
                    loading="lazy"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
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
              {t('landing.whyChoose')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('landing.whySubtitle')}
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
                title: t('landing.allInOneTitle'),
                description: t('landing.allInOneDesc')
              },
              {
                title: t('landing.builtForPawnTitle'),
                description: t('landing.builtForPawnDesc')
              },
              {
                title: t('landing.stayOrganizedTitle'),
                description: t('landing.stayOrganizedDesc')
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
              {t('landing.everythingYouNeed')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('landing.featuresSubtitle')}
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
                title: t('landing.loanManagement'),
                description: t('landing.loanManagementDesc')
              },
              {
                title: t('landing.customerRecords'),
                description: t('landing.customerRecordsDesc')
              },
              {
                title: t('landing.paymentsTransactions'),
                description: t('landing.paymentsTransactionsDesc')
              },
              {
                title: t('landing.inventoryTracking'),
                description: t('landing.inventoryTrackingDesc')
              },
              {
                title: t('landing.dashboardsReports'),
                description: t('landing.dashboardsReportsDesc')
              },
              {
                title: t('landing.secureReliable'),
                description: t('landing.secureReliableDesc')
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
              {t('landing.getStartedMinutes')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('landing.getStartedSubtitle')}
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
                title: t('landing.signUpStep'),
                description: t('landing.signUpStepDesc')
              },
              {
                step: "2",
                title: t('landing.addYourData'),
                description: t('landing.addYourDataDesc')
              },
              {
                step: "3",
                title: t('landing.runYourShop'),
                description: t('landing.runYourShopDesc')
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="text-center relative overflow-hidden"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-1/2 h-px bg-slate-200 transform -translate-y-1/2"></div>
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
              {t('landing.faqTitle')}
            </h2>
            <p className="text-xl text-slate-600">
              {t('landing.faqSubtitle')}
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
                question: t('landing.faq1Q'),
                answer: t('landing.faq1A')
              },
              {
                question: t('landing.faq2Q'),
                answer: t('landing.faq2A')
              },
              {
                question: t('landing.faq3Q'),
                answer: t('landing.faq3A')
              },
              {
                question: t('landing.faq4Q'),
                answer: t('landing.faq4A')
              },
              {
                question: t('landing.faq5Q'),
                answer: t('landing.faq5A')
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
            {t('landing.readyCta')}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            {t('landing.readySubtitle')}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
            variants={fadeInUp}
          >
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors inline-block">
              {t('landing.startYourFreeTrial')}
            </Link>
            <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors">
              {t('landing.scheduleDemo')}
            </button>
          </motion.div>
          
          <motion.p 
            className="text-sm text-slate-400"
            variants={fadeInUp}
          >
            {t('landing.ctaFooter')}
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
              <span className="font-semibold text-lg text-white">{t('landing.appName')}</span>
            </div>
            
            <div className="flex space-x-8 mb-4 md:mb-0">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">{t('nav.features')}</a>
              <a href="#demo" className="text-slate-400 hover:text-white transition-colors">{t('nav.demo')}</a>
              <a href="#faq" className="text-slate-400 hover:text-white transition-colors">{t('nav.faq')}</a>
              <a href="mailto:support@pawnmanager.com" className="text-slate-400 hover:text-white transition-colors">{t('nav.contact')}</a>
            </div>
            
            <p className="text-slate-400 text-sm">
              {t('landing.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
