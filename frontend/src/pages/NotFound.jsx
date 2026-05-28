import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconHome, IconAlertTriangle } from '@tabler/icons-react';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden mx-auto w-full max-w-md rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-8 sm:p-10 text-center shadow-sm"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05] text-zinc-400 dark:text-zinc-500">
          <IconAlertTriangle className="h-8 w-8" />
        </div>
        
        <h1 className="relative z-10 mt-8 text-6xl font-medium tracking-tight text-zinc-900 dark:text-white">
          404
        </h1>
        
        <p className="relative z-10 mt-4 text-lg font-medium tracking-tight text-zinc-900 dark:text-white">
          {t('notFound.title')}
        </p>
        
        <p className="relative z-10 mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {t('notFound.description')}
        </p>
        
        <div className="relative z-10 mt-8 border-t border-zinc-100 dark:border-white/[0.05] pt-8">
          <Link
            to="/app/dashboard"
            className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-8 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <IconHome className="h-4 w-4" />
            {t('notFound.backToDashboard')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}