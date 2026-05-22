import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/sidebar';
import HybridNavigation from '@/components/HybridNavigation';
import { mainLinks, adminLinks, settingsLink } from '@/config/sidebarLinks';
import { IconLogout } from '@tabler/icons-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <div className="flex h-full w-full overflow-hidden">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-8 bg-white">
            <div className="flex flex-1 shrink flex-col overflow-hidden">
              <div className="mt-8 flex flex-col gap-2">
                {mainLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    link={{
                      ...link,
                      icon: <link.icon className="h-5 w-5 shrink-0 text-gray-600" />,
                    }}
                  />
                ))}

                {user?.role === 'owner' && (
                  <>
                    <div className="my-2 h-px w-full bg-gray-200" />
                    <motion.span
                      initial={false}
                      animate={{ display: open ? 'inline-block' : 'none', opacity: open ? 1 : 0 }}
                      className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      Admin
                    </motion.span>

                    {adminLinks.map((link) => (
                      <SidebarLink
                        key={link.href}
                        link={{
                          ...link,
                          icon: <link.icon className="h-5 w-5 shrink-0 text-gray-600" />,
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
                  icon: <settingsLink.icon className="h-5 w-5 shrink-0 text-gray-600" />,
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex min-h-[44px] w-full items-center justify-start gap-2 rounded-xl px-3 text-left text-gray-700 transition hover:bg-gray-50"
              >
                <IconLogout className="h-5 w-5 shrink-0 text-gray-600" />
                <motion.span
                  initial={false}
                  animate={{ display: open ? 'inline-block' : 'none', opacity: open ? 1 : 0 }}
                  className="text-sm"
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
            className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gray-50 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>

        <HybridNavigation open={open} setOpen={setOpen} />
      </div>
    </div>
  );
};

export default AppLayout;
