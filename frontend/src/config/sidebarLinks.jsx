import {
    IconHome,
    IconUsers,
    IconFileText,
    IconUserPlus,
    IconPlus,
    IconUserCog,
    IconSettings,
    IconShieldLock,
    IconReportMoney,
  } from '@tabler/icons-react';
  
  export const mainLinks = [
    { label: 'Dashboard', href: '/app/dashboard', icon: IconHome },
    { label: 'Customers', href: '/app/customers', icon: IconUsers },
    { label: 'Pawn Tickets', href: '/app/pawns', icon: IconFileText },
    { label: 'Payments', href: '/app/payments', icon: IconReportMoney },
    { label: 'New Customer', href: '/app/customer/add', icon: IconUserPlus },
    { label: 'New Pawn Ticket', href: '/app/pawn/add', icon: IconPlus },
  ];
  
  export const adminLinks = [
    { label: 'Employees', href: '/app/employees', icon: IconUserCog },
    { label: 'Roles', href: '/app/roles', icon: IconShieldLock },
  ];
  
  export const settingsLink = {
    label: 'Settings',
    href: '/app/settings',
    icon: IconSettings,
  };
  