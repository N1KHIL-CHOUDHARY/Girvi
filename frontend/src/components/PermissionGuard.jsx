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
    <div className="relative w-full h-[calc(100vh-100px)] flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-app bg-app-primary">
      <div className="absolute inset-0 backdrop-blur-sm app-overlay opacity-50 z-10" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-20 app-surface p-8 rounded-2xl shadow-2xl border border-app text-center max-w-sm mx-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <IconLock className="h-7 w-7 text-red-600 dark:text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-app-primary mb-2">
          Access Denied
        </h2>

        <p className="text-app-secondary text-sm mb-6">
          You do not have permission to access this page. Contact your shop owner if you believe this is an error.
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-app-secondary uppercase tracking-wider font-semibold">
          <IconAlertCircle size={14} />
          <span>Restricted Area</span>
        </div>
      </motion.div>
    </div>
  );
};

export default PermissionGuard;

