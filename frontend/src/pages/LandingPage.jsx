import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Users, BarChart3, Cloud, Bell, Moon, Shield } from "lucide-react";
import { cn } from "../lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-white to-neutral-100 dark:from-black dark:to-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-screen z-50 backdrop-blur-md bg-white/70 dark:bg-black/60 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="w-full  flex items-center justify-between px-6 py-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            PawnSmart
          </h1>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-indigo-500 transition">Features</a>
            <a href="#demo" className="hover:text-indigo-500 transition">Demo</a>
            <a href="#faq" className="hover:text-indigo-500 transition">FAQ</a>
          </div>
          <button className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold hover:scale-105 transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6">
        {/* Floating gradient blobs */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full"></div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent mb-6 mt-20"
        >
          Manage Your Pawn Shop <br /> Smarter and Faster
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto mb-8 text-lg"
        >
          From tickets to customers — streamline everything with one dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center z-10"
        >
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold flex items-center gap-2 hover:scale-105 transition">
            Try Demo <ArrowRight size={18} />
          </button>
          <button className="px-6 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            <PlayCircle size={20} /> Watch Video
          </button>
        </motion.div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need in One Place</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage customers, loans, and reports — beautifully and efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: <Users className="text-indigo-500 w-8 h-8" />, title: "Customer Management", desc: "Track all your customers, transactions, and details easily." },
            { icon: <BarChart3 className="text-indigo-500 w-8 h-8" />, title: "Analytics Dashboard", desc: "Get deep insights into your loans and business performance." },
            { icon: <Cloud className="text-indigo-500 w-8 h-8" />, title: "Cloud Sync", desc: "Access your data anywhere, anytime — safely stored in the cloud." },
            { icon: <Bell className="text-indigo-500 w-8 h-8" />, title: "Smart Notifications", desc: "Stay updated with due dates, renewals, and more." },
            { icon: <Moon className="text-indigo-500 w-8 h-8" />, title: "Dark Mode", desc: "Work comfortably with elegant light and dark themes." },
            { icon: <Shield className="text-indigo-500 w-8 h-8" />, title: "Bank-Grade Security", desc: "All your data is encrypted and backed up automatically." },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- DEMO --- */}
      <section id="demo" className="py-24 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-100/20 dark:to-indigo-900/10"></div>
        <h2 className="text-4xl font-bold mb-6 relative z-10">See PawnSmart in Action</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-10 relative z-10">
          Watch how simple your workflow can become.
        </p>
        <div className="max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-700 relative z-10">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 px-6 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Got Questions?</h2>
          <div className="space-y-6">
            {[
              { q: "Is PawnSmart free to use?", a: "Yes! Start free, upgrade anytime for analytics and integrations." },
              { q: "Can I use it on mobile?", a: "Absolutely. It’s fully responsive and works on all devices." },
              { q: "Is my data secure?", a: "We use bank-level encryption and frequent backups for maximum safety." },
            ].map((faq, i) => (
              <motion.details
                key={i}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700"
              >
                <summary className="cursor-pointer font-semibold text-lg">{faq.q}</summary>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-10 text-center border-t border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500 dark:text-neutral-400">
        <p>© {new Date().getFullYear()} PawnSmart. All rights reserved.</p>
      </footer>
    </div>
  );
}
