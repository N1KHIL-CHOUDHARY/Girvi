import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
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
  const leftItems = [
    { label: 'Dashboard', href: '/app/dashboard', icon: IconHome },
    { label: 'Pawns', href: '/app/pawns', icon: IconFileText },
  ];

  const rightItems = [
    { label: 'Customers', href: '/app/customers', icon: IconUsers },
    { label: 'Payments', href: '/app/payments', icon: IconReportMoney },
  ];

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center gap-1 min-h-[56px] px-1 transition-all duration-200',
            isActive 
              ? 'text-zinc-900 dark:text-white' 
              : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400'
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
            <span className="text-[10px] font-medium tracking-wide">
              {item.label}
            </span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-2xl border-t border-zinc-200/60 dark:border-white/[0.05] pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-5 items-center h-[72px] px-2">
        {leftItems.map((item) => <NavItem key={item.label} item={item} />)}

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onToggleMenu ?? (() => setOpen(!open))}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={cn(
              'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
              open 
                ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white' 
                : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900',
              '-translate-y-4 hover:scale-105 active:scale-95'
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={open ? 'close' : 'open'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {open ? <IconX className="h-6 w-6" /> : <IconMenu2 className="h-6 w-6" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        {rightItems.map((item) => <NavItem key={item.label} item={item} />)}
      </div>
    </nav>
  );
};

export default MobileBottomNav;