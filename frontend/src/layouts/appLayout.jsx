import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';

import { Sidebar, SidebarBody, SidebarLink } from '@/components/sidebar';
import HybridNavigation from '@/components/HybridNavigation';

import { mainLinks, adminLinks, settingsLink } from '@/config/sidebarLinks';
import { IconLogout } from '@tabler/icons-react';

const BrandMark = ({ compact = false }) => (
  <div className="flex items-center gap-2.5">
    <div className={compact
      ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand)] text-[11px] font-bold tracking-[-0.02em] text-white'
      : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand)] text-xs font-bold tracking-[-0.03em] text-white'}
    >
      PM
    </div>
    <span className="text-[0.9375rem] font-bold tracking-[-0.02em] text-[var(--text-primary)]">PawnManager</span>
  </div>
);

const NavSection = ({ title, children, open }) => (
  <div className="mt-4">
    <div className="mb-2 h-px bg-[var(--border-default)]" />
    {title ? (
      <motion.p
        initial={false}
        animate={{ opacity: open ? 1 : 0, height: open ? 'auto' : 0 }}
        transition={{ duration: 0.15 }}
        className="mb-1 overflow-hidden whitespace-nowrap px-3 text-[0.6875rem] font-bold uppercase tracking-[0.07em] text-[var(--text-faint)]"
      >
        {title}
      </motion.p>
    ) : null}
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full flex-row overflow-hidden bg-[var(--bg-base)]">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-[var(--bg-surface)]">
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="mb-2 flex min-h-10 items-center px-3">
              <motion.span
                initial={false}
                animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <BrandMark />
              </motion.span>
              <motion.span
                initial={false}
                animate={{ opacity: open ? 0 : 1, width: open ? 0 : 'auto' }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <BrandMark compact />
              </motion.span>
            </div>
            <div className="mb-3 h-px bg-[var(--border-default)]" />
            <div className="flex flex-col gap-1">
              {mainLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  link={{
                    ...link,
                    icon: <link.icon size={18} />,
                  }}
                />
              ))}
            </div>
            {user?.role === 'owner' && (
              <NavSection title={t('nav.admin')} open={open}>
                {adminLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    link={{
                      ...link,
                      icon: <link.icon size={18} />,
                    }}
                  />
                ))}
              </NavSection>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="mb-2 h-px bg-[var(--border-default)]" />
            <SidebarLink
              link={{
                ...settingsLink,
                icon: <settingsLink.icon size={18} />,
              }}
            />

            <button
              type="button"
              onClick={() => { setOpen(false); logout(); }}
              className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 text-left text-sm font-medium text-[var(--danger-text)] transition-colors hover:bg-[var(--danger-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
            >
              <IconLogout size={18} className="shrink-0" />
              <motion.span
                initial={false}
                animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {t('auth.logout')}
              </motion.span>
            </button>
          </div>

        </SidebarBody>
      </Sidebar>

      <main
        className="flex-1 overscroll-contain overflow-y-auto px-4 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-[var(--page-px)] lg:pt-6 lg:pb-6"
      >
        <Outlet />
      </main>

      <header className="fixed inset-x-0 top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:hidden">
        <div className="h-14">
          <div className="flex h-full items-center">
            <BrandMark compact />
          </div>
        </div>
      </header>

      <HybridNavigation open={open} setOpen={setOpen} />
    </div>
  );
};

export default AppLayout;