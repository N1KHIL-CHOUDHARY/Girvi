import {
  IconLayoutDashboard,
  IconUsers,
  IconFileText,
  IconReportMoney,
  IconUserPlus,
  IconPlus,
  IconUserCog,
  IconShieldLock,
  IconSettings,
} from '@tabler/icons-react';

export const mainLinks = [
  { label: 'nav.dashboard',     href: '/app/dashboard',    icon: IconLayoutDashboard },
  { label: 'nav.customers',     href: '/app/customers',    icon: IconUsers },
  { label: 'nav.pawnTickets',   href: '/app/pawns',        icon: IconFileText },
  { label: 'nav.payments',      href: '/app/payments',     icon: IconReportMoney },
  { label: 'nav.newCustomer',   href: '/app/customer/add', icon: IconUserPlus },
  { label: 'nav.newPawnTicket', href: '/app/pawn/add',     icon: IconPlus },
];

export const adminLinks = [
  { label: 'nav.employees', href: '/app/employees', icon: IconUserCog },
  { label: 'nav.roles',     href: '/app/roles',     icon: IconShieldLock },
];

export const settingsLink = {
  label: 'nav.settings',
  href: '/app/settings',
  icon: IconSettings,
};