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
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { X, Menu } from "lucide-react";

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 64;

function useMediaQuery(query) {
  const getMatches = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;
  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mediaQueryList = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", onChange);
    return () => mediaQueryList.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

const SidebarContext = createContext(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
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
  const value = useMemo(() => ({ open, setOpen, animate }), [open, animate, setOpen]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function Sidebar({ children, open, setOpen, animate }) {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
}

export function SidebarBody(props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      {!isDesktop && <MobileSidebar {...props} />}
      {isDesktop && <DesktopSidebar {...props} />}
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

  useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);

  const handleEnter = () => {
    if (!canHover) return;
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    if (!canHover) return;
    timeoutRef.current = setTimeout(() => setOpen(false), 180);
  };

  return (
    <motion.aside
      className={cn(
        "z-30 hidden h-dvh shrink-0 overflow-hidden border-r border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-4 lg:flex lg:flex-col",
        className
      )}
      animate={{
        width: animate ? (open ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED) : SIDEBAR_EXPANDED,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...props}
    >
      {!canHover && (
        <div className="mb-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
            aria-label={open ? t("nav.closeSidebar") : t("nav.openSidebar")}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
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
    if (open && prevPathRef.current !== location.pathname) setOpen(false);
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
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px]"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label={t("nav.closeMenu")}
            />
            <motion.nav
              role="dialog"
              aria-modal="true"
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50 flex max-h-[85dvh] flex-col overflow-y-auto rounded-t-[var(--radius-xl)] border-t border-[var(--border-default)] bg-[var(--bg-surface)] px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-4 shadow-[var(--shadow-md)]",
                className
              )}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              {...props}
            >
              <span className="mx-auto mb-5 h-1 w-10 rounded-full bg-[var(--border-strong)]" />
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                  aria-label={t("nav.closeMenu")}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
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
    <NavLink
      to={link.href}
      end={link.href === "/app/dashboard"}
      onClick={handleClick}
      className={({ isActive }) =>
        cn(
          "group flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm font-medium no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]",
          isActive
            ? "bg-[var(--brand-light)] text-[var(--brand)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
          className
        )
      }
      {...props}
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex shrink-0 items-center transition-colors",
              isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
            )}
          >
            {link.icon}
          </span>
          <motion.span
            initial={false}
            animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {t(link.label)}
          </motion.span>
        </>
      )}
    </NavLink>
  );
}