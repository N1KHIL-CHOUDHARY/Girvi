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
const SIDEBAR_COLLAPSED = 64;

/* =========================
   CONTEXT
========================= */
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

/* =========================
   ROOT
========================= */
export function Sidebar({ children, open, setOpen, animate }) {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
}

/* =========================
   BODY
========================= */
export function SidebarBody(props) {
  return (
    <>
      <MobileSidebar {...props} />
      <DesktopSidebar {...props} />
    </>
  );
}

/* =========================
   DESKTOP + TABLET SIDEBAR
========================= */
function DesktopSidebar({ className, children, ...props }) {
  const { open, setOpen, animate } = useSidebar();
  const { t } = useTranslation();
  const timeoutRef = useRef(null);
  const [canHover, setCanHover] = useState(false);

  // Detect hover capability
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
        'bg-white border-r border-slate-200',
        'px-3 py-4',
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
        <div className="flex items-center justify-end mb-2">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg text-slate-600 transition hover:bg-slate-100"
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

/* =========================
   MOBILE SIDEBAR (UNCHANGED)
========================= */
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
              className="fixed inset-0 bg-black/40 z-40"
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
                "min-h-[100dvh]",
                "bg-white rounded-t-3xl",
                "border-t border-slate-200 shadow-xl",
                "flex flex-col",
                "p-4 pt-6 pb-[calc(4rem+env(safe-area-inset-bottom))]",
                className
              )}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              {...props}
            >
              {/* Close button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md hover:bg-slate-100"
                  aria-label={t('nav.closeMenu')}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                {children}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================
   LINK
========================= */
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
        'flex items-center gap-3 px-3 min-h-[44px]',
        'rounded-xl transition-colors hover:bg-slate-50',
        className
      )}
      {...props}
    >
      {link.icon}

      <motion.span
        initial={false}
        animate={{
          opacity: open ? 1 : 0,
          width: open ? 'auto' : 0,
        }}
        transition={{ duration: 0.2 }}
        className="text-sm text-slate-900 whitespace-nowrap overflow-hidden"
      >
        {t(link.label)}
      </motion.span>
    </Link>
  );
}
