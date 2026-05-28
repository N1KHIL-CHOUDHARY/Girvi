import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';

import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/sidebar';
import HybridNavigation from '@/components/HybridNavigation';
import { mainLinks, adminLinks, settingsLink } from '@/config/sidebarLinks';
import { IconLogout } from '@tabler/icons-react';
import { cn } from '../lib/utils';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#FAFAF9] dark:bg-[#0A0A0A] font-sans">
      <div className="flex h-full w-full overflow-hidden">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-8 bg-white dark:bg-[#121212]">
            <div className="flex flex-1 shrink flex-col overflow-hidden">
              <div className="mt-8 flex flex-col gap-2">
                {mainLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    link={{
                      ...link,
                      icon: <link.icon className="h-5 w-5 shrink-0" />,
                    }}
                  />
                ))}

                {user?.role === 'owner' && (
                  <>
                    <div className="my-4 h-px w-full bg-zinc-200/60 dark:bg-white/[0.05]" />
                    <motion.span
                      initial={false}
                      animate={{ display: open ? 'inline-block' : 'none', opacity: open ? 1 : 0 }}
                      className="px-4 mb-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"
                    >
                      Admin
                    </motion.span>

                    {adminLinks.map((link) => (
                      <SidebarLink
                        key={link.href}
                        link={{
                          ...link,
                          icon: <link.icon className="h-5 w-5 shrink-0" />,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SidebarLink
                link={{
                  ...settingsLink,
                  icon: <settingsLink.icon className="h-5 w-5 shrink-0" />,
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className={cn(
                  'flex items-center gap-4 px-4 min-h-[48px] w-full text-left',
                  'rounded-2xl transition-all duration-200',
                  'text-zinc-500 dark:text-zinc-400',
                  'hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400'
                )}
              >
                <span className="flex items-center justify-center shrink-0">
                  <IconLogout className="h-5 w-5" />
                </span>
                <motion.span
                  initial={false}
                  animate={{
                    opacity: open ? 1 : 0,
                    width: open ? 'auto' : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap text-sm font-medium"
                >
                  Logout
                </motion.span>
              </button>
            </div>
          </SidebarBody>
        </Sidebar>

        {open && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#FAFAF9] dark:bg-[#0A0A0A]">
          <Outlet />
        </main>

        <HybridNavigation open={open} setOpen={setOpen} />
      </div>
    </div>
  );
};

export default AppLayout;