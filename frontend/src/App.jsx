import React, { useState } from 'react';
import { Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
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
import AllCustomers from './pages/AllCustomer';
import AllPawns from './pages/AllPawn';
import UpdateCustomer from './pages/UpdateCustomer';
import UpdatePawn from './pages/UpdatePawn';
import Settings from './pages/Setting';
import CustomerDetail from './pages/CustomerDetail';

// Import Components
import ProtectedRoute from './components/ProtectedRoute';

import { Sidebar, SidebarBody, SidebarLink } from './components/sidebar';

// Import Icons for our links
import {
  IconHome,
  IconUsers,
  IconFileText,
  IconUserPlus,
  IconPlus,
  IconUserCog,
  IconLogout,
  IconSettings, // IMPORT SETTINGS ICON
} from '@tabler/icons-react';

// --- This is the new AppLayout, based on your SidebarDemo ---
const AppLayout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false); // Manages sidebar open/close

  // These are your app's actual navigation links
  const links = [
    { label: 'Dashboard', href: '/app/dashboard', icon: <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: 'Customers', href: '/app/customers', icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: 'Pawn Tickets', href: '/app/pawns', icon: <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: 'New Customer', href: '/app/customer/add', icon: <IconUserPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: 'New Pawn Ticket', href: '/app/pawn/add', icon: <IconPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  ];
  
  const employeeLink = { label: 'Employees', href: '/app/employees', icon: <IconUserCog size={18} /> };
  
  const settingsLink = { // NEW LINK
    label: "Settings",
    href: "/app/settings",
    icon: <IconSettings size={18} />,
  };

  const logoutLink = {
    label: "Logout",
    href: "/login",
    icon: <IconLogout size={18} />,
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
        <SidebarBody className="justify-between gap-10 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800">
          
          <div className="flex flex-1 flex-col overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              {user?.role === 'owner' && (
                <SidebarLink link={employeeLink} />
              )}
            </div>
          </div>
          
          {/* Bottom Section: Theme, Profile, & Logout */}
          <div>
            <SidebarLink link={settingsLink} /> {/* ADDED SETTINGS LINK */}
            
            {/* We add the onClick handler to the SidebarLink for logout */}
            <div onClick={logout}>
              <SidebarLink link={logoutLink} />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      
      {/* Main Content Area: Replaces the dummy <Dashboard /> */}
      <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-neutral-950 overflow-y-auto">
        <Outlet />
      </main>
      
    </div>
  );
};

// --- Logo Components from your demo ---
export const Logo = () => {
  return (
    <div
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        PawnManager
      </motion.span>
    </div>
  );
};

export const LogoIcon = () => {
  return (
    <div
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </div>
  );
};

// --- Your Main App Router ---
function App() {
  return (
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
        <Route path="customer/add" element={<NewCustomer />} />
        <Route path="pawn/add" element={<NewPawn />} />
        <Route path='customers' element={<AllCustomers/>}/>
        <Route path='pawns' element={<AllPawns/>}/>
        <Route path='customer/:id' element={<CustomerDetail/>}/>;
        <Route path="customer/update/:id" element={<UpdateCustomer />} />
        <Route path="pawn/update/:id" element={<UpdatePawn />} />
        <Route path="settings" element={<Settings />} /> {/* ADDED ROUTE */}
        

      </Route>
      
    </Routes>
  );
}

export default App;