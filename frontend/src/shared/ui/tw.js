import clsx from "clsx";

export const tw = {
  page: "mx-auto w-full max-w-7xl space-y-8",
  pageTitle: "text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl",
  pageSubtitle: "mt-1 text-sm text-gray-500",

  card: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm",
  cardFlush: "rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden",

  label: "mb-1.5 block text-xs font-medium text-gray-600",
  select:
    "min-h-[44px] w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:opacity-50",
  nativeInput:
    "min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:opacity-50",

  stat: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm",
  statLabel: "text-sm font-medium text-gray-500",
  statValue: "mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl",

  tableWrap: "hidden md:block overflow-x-auto",
  mobileList: "md:hidden space-y-4",
  mobileCard: "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm",

  overlay: "fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px]",
  modalSheet:
    "w-full max-w-md max-h-[85vh] overflow-y-auto scroll-contain rounded-t-2xl border border-gray-200 bg-white p-6 shadow-xl md:rounded-2xl",
  modalCenter: "flex items-end justify-center md:items-center",

  badgeActive: "inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700",
  badgeSettled: "inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700",
  badgeDefaulted: "inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700",
  badgeMuted: "inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700",

  btnBase:
    "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  btnMd: "min-h-[44px] px-4",
  btnSm: "min-h-[44px] px-3 text-xs",
  btnFull: "w-full",

  btnPrimary: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  btnSecondary:
    "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-indigo-500",
  btnSystem: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
  btnDanger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  btnGhost: "text-gray-600 hover:bg-gray-50 focus-visible:ring-gray-400",
};

export const buttonPrimary = clsx(tw.btnBase, tw.btnMd, tw.btnPrimary);
export const buttonPrimaryFull = clsx(tw.btnBase, tw.btnMd, tw.btnPrimary, tw.btnFull);
export const buttonSecondary = clsx(tw.btnBase, tw.btnMd, tw.btnSecondary);
export const buttonSystem = clsx(tw.btnBase, tw.btnMd, tw.btnSystem);
export const buttonSystemFull = clsx(tw.btnBase, tw.btnMd, tw.btnSystem, tw.btnFull);
export const buttonDanger = clsx(tw.btnBase, tw.btnMd, tw.btnDanger);
export const buttonGhost = clsx(tw.btnBase, tw.btnMd, tw.btnGhost);
