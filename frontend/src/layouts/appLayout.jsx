import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';

import { Sidebar, SidebarBody, SidebarLink } from '@/components/sidebar';
import HybridNavigation from '@/components/HybridNavigation';

import { mainLinks, adminLinks, settingsLink } from '@/config/sidebarLinks';
import { IconLogout } from '@tabler/icons-react';



const AppLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full h-dvh overflow-hidden md:flex-row flex-col">

      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 app-surface border-r border-app">

          <div className="flex flex-1 flex-col overflow-hidden shrink">
            

           
        
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
                    initial={false}
                    animate={{
                      display: open ? 'inline-block' : 'none',
                      opacity: open ? 1 : 0,
                    }}
                    className="px-3 text-xs font-semibold uppercase text-neutral-500"
                  >
                    {t('nav.admin')}
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
              className="flex items-center justify-start gap-2 w-full rounded-md px-3 py-2.5 min-h-[44px] text-left transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              <IconLogout className="h-5 w-5 shrink-0  text-app-primary" />
              <motion.span
                initial={false}
                animate={{
                  display: open ? 'inline-block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                className="text-sm text-app-primary"
              >
                {t('auth.logout')}
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>

      {open && <div
           className="fixed inset-0 z-40 bg-black/30 md:hidden"
        onClick={() => setOpen(false)}
      />}

        <main
          className="
            flex-1
            px-4 sm:px-6
            overflow-y-auto overscroll-contain
            pt-[calc(4rem+env(safe-area-inset-top))]
            pb-[calc(5rem+env(safe-area-inset-bottom))]
            md:pt-4
            md:pb-6
          "
        >

        <Outlet />
      </main>

     
      <HybridNavigation open={open} setOpen={setOpen} />
    </div>
  );
};

export default AppLayout;
