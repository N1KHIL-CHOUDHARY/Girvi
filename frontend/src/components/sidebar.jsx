"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { X, Menu } from "lucide-react";

const SIDEBAR_EXPANDED = 300;
const SIDEBAR_COLLAPSED = 80;

const SidebarContext = createContext(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}

export function SidebarProvider({
  children,
  open: controlledOpen,
  setOpen: controlledSetOpen,
  animate = true,
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledSetOpen ?? setInternalOpen;

  const value = useMemo(
    () => ({ open, setOpen, animate }),
    [open, animate]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, open, setOpen, animate }) {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
}

export function SidebarBody(props) {
  return (
    <>
      <MobileSidebar {...props} />
      <DesktopSidebar {...props} />
    </>
  );
}

function DesktopSidebar({ className, children, ...props }) {
  const { open, setOpen, animate } = useSidebar();
  const { t } = useTranslation();
  const timeoutRef = useRef(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    setCanHover(mq.matches);

    const handler = (e) => setCanHover(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  const handleEnter = () => {
    if (!canHover) return;
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    if (!canHover) return;
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <motion.aside
      className={cn(
        'hidden lg:flex lg:flex-col shrink-0',
        'h-screen overflow-hidden',
        'bg-white dark:bg-[#121212] border-r border-zinc-200/60 dark:border-white/[0.05]',
        'px-4 py-6',
        'z-30',
        className
      )}
      animate={{
        width: animate ? (open ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED) : SIDEBAR_EXPANDED,
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...props}
    >
      {!canHover && (
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => setOpen(!open)}
            className="min-h-[48px] min-w-[48px] rounded-2xl p-2 text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
            aria-label={open ? t('nav.closeSidebar') : t('nav.openSidebar')}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      )}

      {children}
    </motion.aside>
  );
}

function MobileSidebar({ className, children, ...props }) {
  const { open, setOpen } = useSidebar();
  const { t } = useTranslation();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (open && prevPathRef.current !== location.pathname) {
      setOpen(false);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, open, setOpen]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);

    if (open) {
      window.addEventListener("keydown", onEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className="lg:hidden">
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.nav
              role="dialog"
              aria-modal="true"
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "max-h-[90dvh]",
                "bg-white dark:bg-[#121212] rounded-t-[2rem]",
                "border-t border-zinc-200/60 dark:border-white/[0.05] shadow-2xl",
                "flex flex-col",
                "p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
                className
              )}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              {...props}
            >
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setOpen(false)}
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-2xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  aria-label={t('nav.closeMenu')}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain pb-6">
                {children}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SidebarLink({ link, className, ...props }) {
  const { open, setOpen } = useSidebar();
  const { t } = useTranslation();

  const handleClick = () => {
    if (window.innerWidth < 1024) setOpen(false);
  };

  return (
    <Link
      to={link.href}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-4 px-4 min-h-[48px]',
        'rounded-2xl transition-all duration-200',
        'text-zinc-500 dark:text-zinc-400',
        'hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white',
        className
      )}
      {...props}
    >
      <span className="flex items-center justify-center shrink-0">
        {link.icon}
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
        {t(link.label)}
      </motion.span>
    </Link>
  );
}