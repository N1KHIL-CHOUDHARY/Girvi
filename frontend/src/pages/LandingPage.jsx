import React, { useRef, useState } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  AnimatePresence, 
  useSpring 
} from "framer-motion";
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
  UserCircle
} from "lucide-react";

import heroImage from "../assets/bussinessman.png";

import appScreenDashboard from "../assets/Darshboard.png";
import appScreenCustomer from "../assets/Customers.png";
import appScreenPayments from "../assets/Payments.png";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, image: appScreenDashboard, desc: "Get a bird's eye view of your daily performance, recent loans, and inventory alerts." },
  { id: "customer", label: "Customers", icon: UserCircle, image: appScreenCustomer, desc: "Manage detailed client profiles, view history, and track pawn limits instantly." },
  { id: "payments", label: "Payments", icon: Wallet, image: appScreenPayments, desc: "Process loans, buy-backs, and retail sales with a streamlined, secure checkout." },
];

export default function PawnManagerLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleScroll = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900 overflow-x-hidden">

      <nav className="absolute top-0 left-0 w-full z-50 py-6 px-6 md:px-12 font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-white">
          <div className="text-2xl font-bold tracking-tight">PawnManager</div>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm/6 opacity-90">
            <button onClick={() => handleScroll('features')} className="hover:opacity-100 transition">Features</button>
            <button onClick={() => handleScroll('faq')} className="hover:opacity-100 transition">FAQ</button>
            <button onClick={() => handleScroll('contact')} className="hover:opacity-100 transition">Contact</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-semibold hover:opacity-80 transition">Login</button>
            <button className="px-5 py-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition text-sm font-semibold">
              Get Started
            </button>
          </div>

          <button
            className="md:hidden text-white z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 w-full bg-blue-700 pt-24 p-6 flex flex-col gap-6 text-white shadow-xl md:hidden z-40"
            >
              <button onClick={() => handleScroll('features')} className="text-left text-lg font-medium">Features</button>
              <button onClick={() => handleScroll('faq')} className="text-left text-lg font-medium">FAQ</button>
              <button className="text-left text-lg font-medium">Login</button>
              <button className="py-3 rounded-full bg-white text-blue-600 font-bold">Get Started</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <header className="relative bg-blue-600 pt-36 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
           <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full"></div>
           <div className="absolute bottom-32 right-10 w-2 h-2 bg-white rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Pawn Shop Management <br /> Simplified.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-blue-100 text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
            >
              Grow your pawn business with a platform designed to handle loans, inventory, and customers in one secure cloud solution.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <button className="px-8 py-3.5 rounded-full bg-white text-blue-600 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition transform">
                Get Started Free
              </button>
              <button 
                onClick={() => handleScroll('demo-section')}
                className="px-8 py-3.5 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 backdrop-blur-sm transition flex items-center gap-2"
              >
                <PlayCircle size={20} /> View Demo
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
            className="relative flex justify-center md:justify-end pointer-events-none"
          >
            <div className="relative">
               <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 rounded-full -z-10 transform scale-110"></div>
                <img
                  src={heroImage}
                  alt="3D Character Working"
                  className="w-full max-w-[500px] h-auto object-contain drop-shadow-2xl z-10 relative"
                />
            </div>
          </motion.div>
        </div>
      </header>

      <section id="demo-section" className="py-10 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Experience the Workflow</h2>
            <p className="text-lg text-slate-600">Switch between views to see how PawnManager streamlines your operations.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="flex border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-4 px-4 text-center focus:outline-none transition-colors duration-300 ${
                    activeTab === tab.id ? "text-blue-600 bg-blue-50/50" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 font-bold text-lg">
                    <tab.icon size={20} className={activeTab === tab.id ? "text-blue-600" : "text-slate-400"} />
                    {tab.label}
                  </div>
                  
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-8 md:p-12 bg-white min-h-[700px] max-h-[700px]  flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full text-center"
                >
                  <div className="mb-8">
                     <p className="text-slate-500 text-lg">{tabs.find(t => t.id === activeTab).desc}</p>
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 inline-block">
                    <img 
                      src={tabs.find(t => t.id === activeTab).image} 
                      alt={tabs.find(t => t.id === activeTab).label} 
                      className="max-w-full h-auto"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need to run efficiently</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">We've bundled all the essential tools into one cohesive platform.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      <section id="faq" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
             <h2 className="text-3xl font-bold mb-4 text-slate-900">Common Questions</h2>
             <p className="text-slate-600">Everything you need to know about the product.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <FaqItem 
              question="Is PawnManager compliant with local regulations?"
              answer="Yes. PawnManager is built with compliance in mind. We allow custom configurations for interest rates, grace periods, and reporting formats to match specific state requirements."
            />
            <FaqItem 
              question="Can I migrate data from my existing software?"
              answer="Absolutely. Our team offers complimentary data migration services to ensure a smooth transition from your current system to PawnManager, keeping your history intact."
            />
            <FaqItem 
              question="Is my data secure in the cloud?"
              answer="Security is our top priority. We use 256-bit SSL encryption for all data in transit and at rest, hosted on secure AWS servers with daily automated backups."
            />
             <FaqItem 
              question="Do you offer training for my staff?"
              answer="Yes, all new accounts include onboarding sessions. We also provide extensive documentation and video tutorials accessed directly within the dashboard."
            />
             <FaqItem 
              question="Does it work with barcode scanners?"
              answer="Yes, PawnManager is plug-and-play compatible with most standard USB and Bluetooth barcode scanners and receipt printers."
            />
             <FaqItem 
              question="Can I manage multiple store locations?"
              answer="Yes! Our multi-store architecture allows you to manage inventory transfers, employee permissions, and reporting across unlimited locations from one master account."
            />
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-white border-t border-slate-100 pt-16 pb-8 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
               <div className="text-xl font-bold text-blue-600 mb-4">PawnManager</div>
               <p className="text-slate-500 text-sm max-w-xs">Modernizing the pawn industry with secure, cloud-based management solutions.</p>
            </div>
            <div>
               <h4 className="font-semibold mb-4 text-slate-900">Product</h4>
               <ul className="space-y-2 text-sm text-slate-500">
                  <li><button onClick={() => handleScroll('features')} className="hover:text-blue-600 transition">Features</button></li>
                  <li><a href="#" className="hover:text-blue-600 transition">Security</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition">Roadmap</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-semibold mb-4 text-slate-900">Company</h4>
               <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-blue-600 transition">About Us</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition">Contact</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
               </ul>
            </div>
         </div>
         <div className="text-center text-slate-400 text-sm border-t border-slate-50 pt-8">
            <p>© {new Date().getFullYear()} PawnManager Inc. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        {React.cloneElement(icon, { className: "w-6 h-6 text-blue-600 group-hover:text-white transition-colors" })}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
        layout
        className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 ${isOpen ? 'border-blue-500 shadow-md ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex justify-between items-start w-full text-left p-6 focus:outline-none group"
      >
        <span className={`font-semibold text-base pr-4 transition-colors ${isOpen ? 'text-blue-700' : 'text-slate-800'}`}>
            {question}
        </span>
        <motion.div 
            className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}
        >
           {isOpen ? <Minus size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-4 mt-2">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}