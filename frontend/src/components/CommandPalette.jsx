import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from './ui/Dialog'; // Your existing Dialog
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './ui/Command'; // The component we just made
import { 
  IconHome, 
  IconUsers, 
  IconFileText, 
  IconUserPlus, 
  IconPlus, 
  IconUserCog,
  IconShieldLock
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user to show/hide admin links

  // 1. Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // 2. Helper function to run a command (navigate and close)
  const runCommand = (command) => {
    setOpen(false);
    navigate(command);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => runCommand('/app/dashboard')}>
                <IconHome className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand('/app/customers')}>
                <IconUsers className="mr-2 h-4 w-4" />
                <span>All Customers</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand('/app/pawns')}>
                <IconFileText className="mr-2 h-4 w-4" />
                <span>All Pawn Tickets</span>
              </CommandItem>
            </CommandGroup>
            
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => runCommand('/app/customer/add')}>
                <IconUserPlus className="mr-2 h-4 w-4" />
                <span>New Customer</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand('/app/pawn/add')}>
                <IconPlus className="mr-2 h-4 w-4" />
                <span>New Pawn Ticket</span>
              </CommandItem>
            </CommandGroup>

            {/* Show Admin links only to 'owner' */}
            {user?.role === 'owner' && (
              <CommandGroup heading="Admin">
                <CommandItem onSelect={() => runCommand('/app/employees')}>
                  <IconUserCog className="mr-2 h-4 w-4" />
                  <span>Manage Employees</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand('/app/roles')}>
                  <IconShieldLock className="mr-2 h-4 w-4" />
                  <span>Manage Roles</span>
                </CommandItem>
              </CommandGroup>
            )}
            
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}