"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

/* =========================
   CONSTANTS
========================= */
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

/* =========================
   PROVIDER
========================= */
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
   ROOT WRAPPER
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
   DESKTOP SIDEBAR
========================= */
function DesktopSidebar({ className, children, ...props }) {
  const { open, setOpen, animate } = useSidebar();
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <motion.aside
      className={cn(
        "hidden md:flex md:flex-col h-full shrink-0 px-4 py-4 app-surface bg-app-surface",
        className
      )}
      animate={{
        width: animate
          ? open
            ? SIDEBAR_EXPANDED
            : SIDEBAR_COLLAPSED
          : SIDEBAR_EXPANDED,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...props}
    >
      {children}
    </motion.aside>
  );
}

/* =========================
   MOBILE SIDEBAR (Bottom Sheet)
========================= */
function MobileSidebar({ className, children, ...props }) {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  // Close sidebar on route change
  useEffect(() => {
    if (open && prevPathRef.current !== location.pathname) {
      setOpen(false);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, open, setOpen]);

  // Handle ESC key and prevent body scroll
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    
    if (open) {
      window.addEventListener("keydown", onEsc);
      // Prevent body scroll when sidebar is open on mobile
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
    <div className="md:hidden">
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Bottom sheet */}
            <motion.nav
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "h-[85vh] max-h-[90vh]",
                "bg-white rounded-t-3xl",
                "border-t border-slate-200 shadow-xl",
                "flex flex-col",
                "p-4 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))]",
                className
              )}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              {...props}
              >
              {/* Content area */}
              <div className="flex-1 overflow-y-auto scroll-contain">{children}</div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================
   SIDEBAR LINK
========================= */
export function SidebarLink({ link, className, ...props }) {
  const { open, setOpen } = useSidebar();

  const handleClick = () => {
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <Link
      to={link.href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-md transition-colors hover:bg-[var(--color-surface-muted)]",
        className
      )}
      {...props}
    >
      {link.icon}

      <motion.span
        initial={false}
        animate={{
          opacity: open ? 1 : 0,
          width: open ? "auto" : 0,
        }}
        transition={{ duration: 0.2 }}
        className="text-sm text-app-primary whitespace-nowrap overflow-hidden"
      >
        {link.label}
      </motion.span>
    </Link>
  );
}
