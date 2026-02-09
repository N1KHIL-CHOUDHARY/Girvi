import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { IconHome, IconAlertTriangle } from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200">
            <IconAlertTriangle className="w-10 h-10 text-slate-500" />
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-6xl font-bold text-slate-900 tracking-tight mb-2">
          404
        </h1>

        <h2 className="text-xl font-semibold text-slate-800 mb-3">
          {t('notFound.title')}
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          {t('notFound.description')}
        </p>

        {/* Action */}
        <div className="flex justify-center">
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <IconHome size={16} />
            {t('notFound.backToDashboard')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
