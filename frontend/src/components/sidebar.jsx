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
import { Link } from "react-router-dom";
import { IconMenu2, IconX } from "@tabler/icons-react";
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
   MOBILE SIDEBAR
========================= */
function MobileSidebar({ className, children, ...props }) {
  const { open, setOpen } = useSidebar();

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, setOpen]);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b app-surface bg-app-surface">
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="p-2 rounded-md border border-app bg-app-surface"
        >
          {open ? <IconX size={22} /> : <IconMenu2 size={22} />}
        </button>
        <span className="text-sm text-app-secondary">Menu</span>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.nav
              role="dialog"
              aria-modal="true"
              className={cn(
                "fixed top-0 left-0 bottom-0 w-64 p-4 z-50 shadow-lg app-surface bg-app-surface",
                className
              )}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              {...props}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-app-primary">
                  Navigation
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-md hover:bg-[var(--color-surface-muted)]"
                >
                  <IconX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">{children}</div>
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
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-[var(--color-surface-muted)]",
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
