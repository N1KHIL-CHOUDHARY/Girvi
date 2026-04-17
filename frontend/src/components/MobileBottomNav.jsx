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

const BottomNavItem = ({ item }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      end={item.href === '/app/dashboard'}
      className={({ isActive }) =>
        cn(
          'group flex min-h-12 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] px-2 py-2 text-[0.75rem] leading-tight transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]',
          isActive
            ? 'font-semibold text-[var(--brand)]'
            : 'font-medium text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-secondary)]'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative flex items-center justify-center">
            <Icon
              className={cn(
                'h-5 w-5 transition-colors',
                isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
              )}
            />
            {isActive && (
              <motion.span
                layoutId={`tab-indicator-${item.href}`}
                className="absolute -inset-1 -z-10 rounded-full bg-[var(--brand-light)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </span>
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
};

const MobileBottomNav = ({ open, setOpen, onToggleMenu }) => {
  const leftItems = [
    { label: 'Dashboard', href: '/app/dashboard', icon: IconHome },
    { label: 'Pawns',     href: '/app/pawns',     icon: IconFileText },
  ];

  const rightItems = [
    { label: 'Customers', href: '/app/customers', icon: IconUsers },
    { label: 'Payments',  href: '/app/payments',  icon: IconReportMoney },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-default)] bg-[var(--bg-surface)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-5 items-end h-16 px-2">
        {leftItems.map((item) => <BottomNavItem key={item.label} item={item} />)}

        {/* Centre FAB */}
        <div className="flex items-end justify-center pb-1">
          <button
            type="button"
            onClick={onToggleMenu ?? (() => setOpen(!open))}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-[3.25rem] w-[3.25rem] shrink-0 -translate-y-[10px] items-center justify-center rounded-full border border-[var(--brand)] bg-[var(--brand)] text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <IconX className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <IconMenu2 className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {rightItems.map((item) => <BottomNavItem key={item.label} item={item} />)}

      </div>
    </nav>
  );
};

export default MobileBottomNav;