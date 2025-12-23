import React, { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { cn } from './lib/utils';
import { motion } from 'framer-motion';

import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Landingpage from './pages/LandingPage';
import NewCustomer from './pages/NewCustomer';
import NewPawn from './pages/NewPawn';
import AllCustomers from './pages/AllCustomer'; // Corrected import
import AllPawns from './pages/AllPawn';     // Corrected import
import Payments from './pages/Payments';
import UpdateCustomer from './pages/UpdateCustomer';
import UpdatePawn from './pages/UpdatePawn';
import Settings from './pages/Setting';
import CustomerDetail from './pages/CustomerDetail';
import Employees from './pages/Employee';
import Roles from './pages/Roles';
import NotFound from './pages/NotFound';
import PawnDetail from './pages/PawnDetail';
import PermissionGuard from './components/PermissionGuard';


import { Logo, LogoIcon } from './components/logo';
import ProtectedRoute from './components/ProtectedRoute';
import { Sidebar, SidebarBody, SidebarLink } from './components/sidebar';
import CommandPalette from './components/CommandPalette';

import {
  IconHome,
  IconUsers,
  IconFileText,
  IconUserPlus,
  IconPlus,
  IconUserCog,
  IconLogout,
  IconSettings,
  IconShieldLock,
  IconReportMoney 
} from '@tabler/icons-react';


const AppLayout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false); 

  const links = [
    { label: 'Dashboard', href: '/app/dashboard', icon: <IconHome className="h-5 w-5 shrink-0 text-app-primary" /> },
    { label: 'Customers', href: '/app/customers', icon: <IconUsers className="h-5 w-5 shrink-0 text-app-primary" /> },
    { label: 'Pawn Tickets', href: '/app/pawns', icon: <IconFileText className="h-5 w-5 shrink-0 text-app-primary" /> },
    { label: 'Payments', href: '/app/payments', icon: <IconReportMoney className="h-5 w-5 shrink-0 text-app-primary" /> },
    { label: 'New Customer', href: '/app/customer/add', icon: <IconUserPlus className="h-5 w-5 shrink-0 text-app-primary" /> },
    { label: 'New Pawn Ticket', href: '/app/pawn/add', icon: <IconPlus className="h-5 w-5 shrink-0 text-app-primary" /> },
  ];
  
  const adminLinks = [
    { label: 'Employees', href: '/app/employees', icon: <IconUserCog className="h-5 w-5 shrink-0 text-app-primary" /> },
    { label: 'Roles', href: '/app/roles', icon: <IconShieldLock className="h-5 w-5 shrink-0 text-app-primary" /> }
  ];
  
  const settingsLink = {
    label: "Settings",
    href: "/app/settings",
    icon: <IconSettings className="h-5 w-5 shrink-0 text-app-primary" />,
  };

  const logoutLink = {
    label: "Logout",
    href: "/login",
    icon: <IconLogout className="h-5 w-5 shrink-0 text-app-primary" />,
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden md:flex-row",
        "h-screen", 
        isDarkMode ? 'dark' : ''
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 app-surface border-r border-app">
          
          <div className="flex flex-1 flex-col overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              
              {user?.role === 'owner' && (
                <>
                  <div className="my-2 h-px w-full bg-neutral-200 dark:bg-neutral-800" />
                  <motion.span
                    animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
                    className="px-3 text-xs font-semibold uppercase text-neutral-500"
                  >
                    Admin
                  </motion.span>
                  {adminLinks.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </>
              )}
            </div>
          </div>
          
          <div>
           
            <SidebarLink link={settingsLink} />
            
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-md transition-colors w-full text-left hover:bg-[var(--color-surface-muted)]"
            >
              {logoutLink.icon}
              <motion.span
                animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
                className="text-app-primary text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                {logoutLink.label}
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
      
      <main className="flex-1 p-4 md:p-6 bg-app-primary overflow-y-auto pt-16 md:pt-4">
        <Outlet />
      </main>
      
    </div>
  );
};




function App() {
  return (
    <>
      
      <CommandPalette />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Landingpage/>} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<AllCustomers />} />
          <Route path="pawns" element={<AllPawns />} />
          <Route path="pawns/:id" element={<PawnDetail />} />
          <Route
            path="payments"
            element={
              <PermissionGuard requiredPermission="can_view_reports">
                <Payments />
              </PermissionGuard>
            }
          />
          <Route
            path="customer/add"
            element={
              <PermissionGuard requiredPermission="can_create_customers">
                <NewCustomer />
              </PermissionGuard>
            }
          />
          <Route path="customer/:id" element={<CustomerDetail />} />
          <Route
            path="customer/update/:id"
            element={
              <PermissionGuard requiredPermission="can_edit_customers">
                <UpdateCustomer />
              </PermissionGuard>
            }
          />
          <Route
            path="pawn/add"
            element={
              <PermissionGuard requiredPermission="can_create_tickets">
                <NewPawn />
              </PermissionGuard>
            }
          />
          <Route
            path="pawn/update/:id"
            element={
              <PermissionGuard requiredPermission="can_edit_tickets">
                <UpdatePawn />
              </PermissionGuard>
            }
          />
          <Route path="settings" element={<Settings />} /> 
          <Route
            path="employees"
            element={
              <PermissionGuard requiredPermission="can_manage_employees">
                <Employees />
              </PermissionGuard>
            }
          />
          <Route
            path="roles"
            element={
              <PermissionGuard requiredPermission="can_manage_roles">
                <Roles />
              </PermissionGuard>
            }
          />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </> 
  );
}

export default App;