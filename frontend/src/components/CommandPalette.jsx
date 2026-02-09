import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          <CommandInput placeholder={t('common.typeCommandOrSearch')} />
          <CommandList>
            <CommandEmpty>{t('empty.noResultsFound')}</CommandEmpty>
            
            <CommandGroup heading={t('common.navigation')}>
              <CommandItem onSelect={() => runCommand('/app/dashboard')}>
                <IconHome className="mr-2 h-4 w-4 text-app-primary" />
                <span>{t('nav.dashboard')}</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand('/app/customers')}>
                <IconUsers className="mr-2 h-4 w-4 text-app-primary" />
                <span>{t('nav.allCustomers')}</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand('/app/pawns')}>
                <IconFileText className="mr-2 h-4 w-4 text-app-primary" />
                <span>{t('nav.allPawnTickets')}</span>
              </CommandItem>
            </CommandGroup>
            
            <CommandGroup heading={t('common.actions')}>
              <CommandItem onSelect={() => runCommand('/app/customer/add')}>
                <IconUserPlus className="mr-2 h-4 w-4 text-app-primary" />
                <span>{t('nav.newCustomer')}</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand('/app/pawn/add')}>
                <IconPlus className="mr-2 h-4 w-4 text-app-primary" />
                <span>{t('nav.newPawnTicket')}</span>
              </CommandItem>
            </CommandGroup>

            {/* Show Admin links only to 'owner' */}
            {user?.role === 'owner' && (
              <CommandGroup heading={t('common.adminGroup')}>
                <CommandItem onSelect={() => runCommand('/app/employees')}>
                  <IconUserCog className="mr-2 h-4 w-4 text-app-primary" />
                  <span>{t('nav.manageEmployees')}</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand('/app/roles')}>
                  <IconShieldLock className="mr-2 h-4 w-4 text-app-primary" />
                  <span>{t('nav.manageRoles')}</span>
                </CommandItem>
              </CommandGroup>
            )}
            
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}