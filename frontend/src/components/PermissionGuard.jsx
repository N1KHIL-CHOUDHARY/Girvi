import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const PermissionGuard = ({ children, requiredPermission }) => {
  const { hasPermission } = usePermission();

  if (hasPermission(requiredPermission)) {
    return children;
  }

  return (
    <div className="relative w-full h-[calc(100vh-100px)] flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/50">
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 z-10" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-20 bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center max-w-sm mx-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <IconLock className="h-7 w-7 text-red-600 dark:text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
          Access Denied
        </h2>

        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">
          You do not have permission to access this page. Contact your shop owner if you believe this is an error.
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 uppercase tracking-wider font-semibold">
          <IconAlertCircle size={14} />
          <span>Restricted Area</span>
        </div>
      </motion.div>
    </div>
  );
};

export default PermissionGuard;

