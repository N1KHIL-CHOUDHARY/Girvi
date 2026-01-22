import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

import { Sidebar, SidebarBody, SidebarLink } from '@/components/sidebar';
import { Logo, LogoIcon } from '@/components/logo';

import { mainLinks, adminLinks, settingsLink } from '@/config/sidebarLinks';
import { IconLogout } from '@tabler/icons-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full flex-1 flex-col overflow-hidden md:flex-row h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 app-surface border-r border-app">
          {/* Top section */}
          <div className="flex flex-1 flex-col overflow-hidden shirnk-1">
            
        
            <div className="mt-8 flex flex-col gap-2">
              {mainLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  link={{
                    ...link,
                    icon: <link.icon className="h-5 w-5 shrink-0 text-app-primary" />,
                  }}
                />
              ))}

              {user?.role === 'owner' && (
                <>
                  <div className="my-2 h-px w-full bg-neutral-200" />
                  <motion.span
                    animate={{
                      display: open ? 'inline-block' : 'none',
                      opacity: open ? 1 : 0,
                    }}
                    className="px-3 text-xs font-semibold uppercase text-neutral-500"
                  >
                    Admin
                  </motion.span>

                  {adminLinks.map((link) => (
                    <SidebarLink
                      key={link.href}
                      link={{
                        ...link,
                        icon: <link.icon className="h-5 w-5 shrink-0 text-app-primary" />,
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Bottom section */}
          <div>
            <SidebarLink
              link={{
                ...settingsLink,
                icon: <settingsLink.icon className="h-5 w-5 shrink-0 text-app-primary" />,
              }}
            />

            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex items-center justify-start gap-2 w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              <IconLogout className="h-5 w-5 shrink-0  text-app-primary" />
              <motion.span
                animate={{
                  display: open ? 'inline-block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                className="text-sm text-app-primary"
              >
                Logout
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 overflow-y-auto bg-app-primary p-4 pt-16 md:p-6 md:pt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
