import { motion } from 'motion/react';
import { usePermission } from '../hooks/usePermission';
import { IconLock, IconAlertTriangle } from '@tabler/icons-react';

const PermissionGuard = ({ children, requiredPermission }) => {
  const { hasPermission } = usePermission();

  if (hasPermission(requiredPermission)) {
    return children;
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-8 sm:p-10 shadow-sm text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05] mb-6 shadow-sm">
          <IconLock className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        </div>
        
        <h2 className="relative z-10 text-2xl font-medium tracking-tight text-zinc-900 dark:text-white mb-3">
          Access Denied
        </h2>
        
        <p className="relative z-10 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs mx-auto">
          You do not have the necessary permissions to view this section. Please contact your shop owner.
        </p>
        
        <div className="relative z-10 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-white/[0.05]">
          <IconAlertTriangle size={14} />
          Restricted Area
        </div>
      </motion.div>
    </div>
  );
};

export default PermissionGuard;