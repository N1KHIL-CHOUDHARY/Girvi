import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconHome, IconAlertTriangle } from '@tabler/icons-react';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[100dvh] bg-[#f4faf5] px-4 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-soft"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
          <IconAlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="mt-8 text-6xl font-semibold text-slate-900">404</h1>
        <p className="mt-4 text-xl font-semibold text-slate-900">{t('notFound.title')}</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">{t('notFound.description')}</p>
        <Link
          to="/app/dashboard"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <IconHome className="h-4 w-4" />
          {t('notFound.backToDashboard')}
        </Link>
      </motion.div>
    </div>
  );
}
