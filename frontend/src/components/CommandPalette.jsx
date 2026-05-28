import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent } from './ui/Dialog'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './ui/Command'
import { 
  IconHome, 
  IconUsers, 
  IconFileText, 
  IconUserPlus, 
  IconPlus, 
  IconUserCog,
  IconShieldLock
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'

export default function CommandPalette() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command) => {
    setOpen(false)
    navigate(command)
  }

  const iconClass = "mr-3 h-5 w-5 text-zinc-400 dark:text-zinc-500 transition-colors group-aria-selected:text-zinc-900 dark:group-aria-selected:text-white"
  
  const itemClass = cn(
    "group flex items-center px-4 py-3 cursor-pointer rounded-xl transition-all duration-200",
    "text-sm font-medium text-zinc-600 dark:text-zinc-400",
    "aria-selected:bg-zinc-100 dark:aria-selected:bg-white/5 aria-selected:text-zinc-900 dark:aria-selected:text-white"
  )

  const GroupHeading = ({ children }) => (
    <span className="px-2 py-2 block text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
      {children}
    </span>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl rounded-3xl sm:rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.08] bg-white dark:bg-[#121212] sm:max-w-[600px] top-[20%] translate-y-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
        
        <Command className="relative z-10 bg-transparent">
          <CommandInput 
            placeholder={t('common.typeCommandOrSearch')} 
            className="h-14 sm:h-16 px-6 text-base md:text-lg border-b border-zinc-100 dark:border-white/[0.05] focus:ring-0 focus:border-none bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
          <CommandList className="max-h-[60vh] overflow-y-auto p-3 scroll-contain">
            <CommandEmpty className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {t('empty.noResultsFound')}
            </CommandEmpty>
            
            <CommandGroup heading={<GroupHeading>{t('common.navigation')}</GroupHeading>} className="mb-2">
              <CommandItem onSelect={() => runCommand('/app/dashboard')} className={itemClass}>
                <IconHome className={iconClass} />
                <span>{t('nav.dashboard')}</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand('/app/customers')} className={itemClass}>
                <IconUsers className={iconClass} />
                <span>{t('nav.allCustomers')}</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand('/app/pawns')} className={itemClass}>
                <IconFileText className={iconClass} />
                <span>{t('nav.allPawnTickets')}</span>
              </CommandItem>
            </CommandGroup>
            
            <CommandGroup heading={<GroupHeading>{t('common.actions')}</GroupHeading>} className="mb-2">
              <CommandItem onSelect={() => runCommand('/app/customer/add')} className={itemClass}>
                <IconUserPlus className={iconClass} />
                <span>{t('nav.newCustomer')}</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand('/app/pawn/add')} className={itemClass}>
                <IconPlus className={iconClass} />
                <span>{t('nav.newPawnTicket')}</span>
              </CommandItem>
            </CommandGroup>

            {user?.role === 'owner' && (
              <CommandGroup heading={<GroupHeading>{t('common.adminGroup')}</GroupHeading>}>
                <CommandItem onSelect={() => runCommand('/app/employees')} className={itemClass}>
                  <IconUserCog className={iconClass} />
                  <span>{t('nav.manageEmployees')}</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand('/app/roles')} className={itemClass}>
                  <IconShieldLock className={iconClass} />
                  <span>{t('nav.manageRoles')}</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}