import { motion } from 'framer-motion';
import { usePermission } from '../hooks/usePermission';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';

const PermissionGuard = ({ children, requiredPermission }) => {
  const { hasPermission } = usePermission();

  if (hasPermission(requiredPermission)) {
    return children;
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4 text-emerald-700">
          <IconLock className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">Access Denied</h2>
        <p className="text-sm leading-7 text-slate-600 mb-6">
          You do not have permission to access this section. Please contact your shop owner for access.
        </p>
        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          <IconAlertCircle size={16} />
          Restricted Area
        </div>
      </motion.div>
    </div>
  );
};

export default PermissionGuard;

