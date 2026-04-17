import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { IconHome, IconAlertTriangle } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div style={{
      minHeight: '100dvh', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '1.5rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ maxWidth: '22rem', width: '100%', textAlign: 'center' }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '4.5rem', height: '4.5rem', borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
          margin: '0 auto 1.5rem',
        }}>
          <IconAlertTriangle size={26} style={{ color: 'var(--text-muted)' }} />
        </div>

        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', margin: '0 0 0.25rem', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.625rem' }}>
          {t('notFound.title')}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 2rem' }}>
          {t('notFound.description')}
        </p>

        <Link to="/app/dashboard" className="pm-btn pm-btn-primary pm-btn-lg">
          <IconHome size={16} />
          {t('notFound.backToDashboard')}
        </Link>
      </motion.div>
    </div>
  );
}