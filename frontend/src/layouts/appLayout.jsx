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
    <div className="min-h-screen bg-[#f4faf5]">
      <div className="mx-auto flex min-h-screen w-full overflow-hidden flex-col lg:flex-row">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-8 bg-white">
            <div className="flex flex-1 flex-col overflow-hidden shrink">
              <div className="mt-8 flex flex-col gap-2">
                {mainLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    link={{
                      ...link,
                      icon: <link.icon className="h-5 w-5 shrink-0 text-slate-700" />,
                    }}
                  />
                ))}

                {user?.role === 'owner' && (
                  <>
                    <div className="my-2 h-px w-full bg-slate-200" />
                    <motion.span
                      initial={false}
                      animate={{ display: open ? 'inline-block' : 'none', opacity: open ? 1 : 0 }}
                      className="px-3 text-xs font-semibold uppercase text-slate-500"
                    >
                      Admin
                    </motion.span>

                    {adminLinks.map((link) => (
                      <SidebarLink
                        key={link.href}
                        link={{
                          ...link,
                          icon: <link.icon className="h-5 w-5 shrink-0 text-slate-700" />,
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
                  icon: <settingsLink.icon className="h-5 w-5 shrink-0 text-slate-700" />,
                }}
              />

              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex items-center justify-start gap-2 w-full rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-50"
              >
                <IconLogout className="h-5 w-5 shrink-0 text-slate-700" />
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
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
        )}

        <main className="flex-1 bg-[#f4faf5] px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto overscroll-contain md:pt-6 md:pb-8">
          <Outlet />
        </main>

        <HybridNavigation open={open} setOpen={setOpen} />
      </div>
    </div>
  );
};

export default AppLayout;
