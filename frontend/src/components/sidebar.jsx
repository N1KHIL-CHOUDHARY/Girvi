"use client";;
import { cn } from "../lib/utils";
import React, { useState, useRef, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { IconMenu2, IconX } from "@tabler/icons-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <MobileSidebar {...props} />
      <DesktopSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden  md:flex md:flex-col app-surface bg-app-surface w-[300px] shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "65px") : "300px",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}>
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3 app-surface bg-app-surface border-b border-app">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md border border-app bg-app-surface shadow-sm"
          aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <IconX size={22} /> : <IconMenu2 size={22} />}
        </button>
        <span className="text-sm text-app-secondary">
          Menu
        </span>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="drawer"
              className={cn(
                "fixed top-0 left-0 bottom-0 w-64 app-surface bg-app-surface shadow-lg z-50 p-4 flex flex-col",
                className
              )}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              {...props}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-app-primary">
                  Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md hover:bg-[var(--color-surface-muted)]"
                  aria-label="Close menu">
                  <IconX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

      

export const SidebarLink = ({
  link,
  className,
  ...props
}) => {
  const { open, animate, setOpen } = useSidebar();
  
  const handleClick = () => {
    // Close mobile menu when link is clicked; keep desktop open
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <Link
      to={link.href}
      onClick={handleClick}
      className={cn("flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-md transition-colors hover:bg-[var(--color-surface-muted)]", className)}
      {...props}>
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-app-primary text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block ">
        {link.label}
      </motion.span>
    </Link>
  );
};
