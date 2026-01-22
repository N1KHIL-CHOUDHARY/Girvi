import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconHome,
  IconFileText,
  IconUsers,
  IconReportMoney,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';


const MobileBottomNav = ({ open, setOpen, onToggleMenu }) => {
  // Primary nav items (5-item layout with center action button)
  const leftItems = [
    { label: 'Dashboard', href: '/app/dashboard', icon: IconHome },
    { label: 'Pawns', href: '/app/pawns', icon: IconFileText },
  ];

  const rightItems = [
    { label: 'Customers', href: '/app/customers', icon: IconUsers },
    { label: 'Payments', href: '/app/payments', icon: IconReportMoney },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-slate-200 bg-white"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-5 items-end h-16 px-2">
        {/* Left two */}
        {leftItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 min-h-[48px] px-2 py-2 rounded-lg',
                  'text-slate-600 transition-colors active:bg-slate-50',
                  isActive && 'text-slate-900'
                )
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-5 w-5', isActive && 'text-slate-900')} />
                  <span className={cn('text-xs font-medium', isActive && 'text-slate-900')}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Center circular action button (More / X) */}
        <div className="flex items-end justify-center">
          <button
            type="button"
            onClick={onToggleMenu ?? (() => setOpen(!open))}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className={cn(
              'w-14 h-14 rounded-full bg-white border border-slate-200 shadow-md',
              'flex items-center justify-center',
              '-translate-y-3',
              'transition-transform active:scale-95',
              'min-w-[48px] min-h-[48px]'
            )}
          >
            {/* Smooth icon swap (fade + slight scale) */}
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.12 }}
                  className="flex"
                >
                  <IconX className="h-6 w-6 text-slate-900" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.12 }}
                  className="flex"
                >
                  <IconMenu2 className="h-6 w-6 text-slate-900" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Right two */}
        {rightItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 min-h-[48px] px-2 py-2 rounded-lg',
                  'text-slate-600 transition-colors active:bg-slate-50',
                  isActive && 'text-slate-900'
                )
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-5 w-5', isActive && 'text-slate-900')} />
                  <span className={cn('text-xs font-medium', isActive && 'text-slate-900')}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
