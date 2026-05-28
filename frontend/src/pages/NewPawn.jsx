import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAccounts, createPawnTicket } from '../services/api.js'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils.js'
import { Input } from '../components/ui/Input.jsx'
import { IconTicket } from '@tabler/icons-react'

const initialState = {
  ticket_number: '',
  loan_amount: '',
  interest_rate: '3',
  adv_amount: '',
  item_name: '',
  item_weight: '',
  item_purity: '22',
  item_description: '',
  pawned_date: new Date().toISOString().split('T')[0],
}

export default function NewPawn() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState(initialState)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: customersData,
    isFetching: loadingCustomers,
  } = useQuery({
    queryKey: ['customers', customerSearch],
    queryFn: async () => {
      const res = await getAccounts(1, customerSearch)
      return res.data.customers || []
    },
    enabled: customerSearch.trim().length > 0,
    staleTime: 1000 * 60,
    onError: () => toast.error(t('errors.failedToSearchCustomers')),
  })

  const customers = customersData || []

  const createPawnMutation = useMutation({
    mutationFn: (payload) => createPawnTicket(payload),
    onSuccess: () => {
      toast.success(t('loans.createSuccess'))
      queryClient.invalidateQueries(['pawnTickets'])
      setFormData(initialState)
      setSelectedCustomer(null)
      setCustomerSearch('')
      navigate('/app/pawns')
    },
    onError: (error) => {
      const message = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        t('loans.createFailed')
        
      toast.error(message.replace(/"/g, ''))
    },
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (customerSearch.trim() === '') {
      setIsDropdownOpen(false)
      return
    }
    const timeout = setTimeout(() => {
      if (customers.length > 0) setIsDropdownOpen(true)
    }, 200)
    return () => clearTimeout(timeout)
  }, [customerSearch, customers])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => {
      const newFormData = { ...prev, [name]: value }

      if (name === 'loan_amount' || name === 'interest_rate') {
        const loan = parseFloat(name === 'loan_amount' ? value : newFormData.loan_amount)
        const rate = parseFloat(name === 'interest_rate' ? value : newFormData.interest_rate)

        if (loan > 0 && rate > 0) {
          const advance = (loan * rate) / 100
          newFormData.adv_amount = Math.round(advance).toString()
        } else {
          newFormData.adv_amount = ''
        }
      }
      return newFormData
    })
  }

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.full_name)
    setIsDropdownOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedCustomer) {
      toast.error(t('loans.pleaseSelectCustomer'))
      return
    }

    const payload = {
      customer_id: selectedCustomer._id,
      ticket_number: formData.ticket_number,
      loan_amount: parseFloat(formData.loan_amount),
      interest_rate: parseFloat(formData.interest_rate),
      adv_amount: parseFloat(formData.adv_amount),
      pawned_date: formData.pawned_date,
      items: [
        {
          name: formData.item_name,
          weight_grams: parseFloat(formData.item_weight),
          purity: parseFloat(formData.item_purity),
          description: formData.item_description,
        },
      ],
    }

    createPawnMutation.mutate(payload)
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 sm:p-6 md:p-10 font-sans">
      <div className="mx-auto w-full max-w-3xl relative overflow-hidden rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 sm:p-10 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 mb-10 flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05]">
            <IconTicket className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-white">
              {t('common.createNewPawnTicket')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t('common.createPawnDescription')}
            </p>
          </div>
        </div>

        <form className="relative z-10" onSubmit={handleSubmit}>
          <div className="relative mb-8" ref={dropdownRef}>
            <LabelInputContainer>
              <Label htmlFor="customer_search">{t('loans.searchCustomer')}</Label>
              <Input
                id="customer_search"
                type="text"
                placeholder={t('loans.searchCustomerPlaceholder')}
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  setSelectedCustomer(null)
                  setIsDropdownOpen(true)
                }}
                required
                autoComplete="off"
                enterKeyHint="search"
                className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
              />
            </LabelInputContainer>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto scroll-contain rounded-xl bg-white dark:bg-[#1A1A1A] shadow-xl border border-zinc-200 dark:border-white/[0.08] py-2">
                {loadingCustomers ? (
                  <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{t('loans.loading')}</div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <div
                      key={customer._id}
                      className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <p className="font-medium text-sm text-zinc-900 dark:text-white">{customer.full_name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{customer.phone_number}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{t('loans.noCustomersFound')}</div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabelInputContainer>
              <Label htmlFor="ticket_number">{t('loans.ticketNumberLabel')}</Label>
              <Input id="ticket_number" name="ticket_number" placeholder={t('common.placeholderTicket')} type="text" autoComplete="off" enterKeyHint="next" value={formData.ticket_number} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pawned_date">{t('loans.pawnedDate')}</Label>
              <Input id="pawned_date" name="pawned_date" type="date" enterKeyHint="next" value={formData.pawned_date} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
          </div>

          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <LabelInputContainer>
              <Label htmlFor="loan_amount">{t('loans.loanAmountLabel')}</Label>
              <Input id="loan_amount" name="loan_amount" placeholder={t('common.placeholderLoan')} type="number" inputMode="decimal" enterKeyHint="next" value={formData.loan_amount} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="interest_rate">{t('loans.interestRate')}</Label>
              <Input id="interest_rate" name="interest_rate" placeholder={t('common.placeholderInterest')} type="number" inputMode="decimal" enterKeyHint="next" value={formData.interest_rate} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="adv_amount">{t('loans.advanceAmount')}</Label>
              <Input id="adv_amount" name="adv_amount" placeholder={t('common.placeholderAdvance')} type="number" inputMode="decimal" enterKeyHint="next" value={formData.adv_amount} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
          </div>

          <div className="my-10 h-px w-full bg-zinc-100 dark:bg-white/[0.05]" />

          <h3 className="mb-6 text-lg font-medium tracking-tight text-zinc-900 dark:text-white">
            {t('loans.itemDetails')}
          </h3>

          <LabelInputContainer className="mb-6">
            <Label htmlFor="item_name">{t('loans.itemName')}</Label>
            <Input id="item_name" name="item_name" placeholder={t('common.placeholderItemName')} type="text" autoComplete="off" enterKeyHint="next" value={formData.item_name} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
          </LabelInputContainer>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <LabelInputContainer>
              <Label htmlFor="item_weight">{t('loans.weightGrams')}</Label>
              <Input id="item_weight" name="item_weight" placeholder={t('common.placeholderWeight')} type="number" inputMode="decimal" enterKeyHint="next" value={formData.item_weight} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="item_purity">{t('loans.purity')}</Label>
              <Input id="item_purity" name="item_purity" placeholder="22" type="number" inputMode="numeric" enterKeyHint="next" value={formData.item_purity} onChange={handleChange} className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-10">
            <Label htmlFor="item_description">{t('loans.itemDescription')}</Label>
            <Input id="item_description" name="item_description" placeholder={t('common.placeholderItemDesc')} type="text" autoComplete="off" enterKeyHint="done" value={formData.item_description} onChange={handleChange} className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
          </LabelInputContainer>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-white/[0.05]">
            <Link
              to="/app/pawns"
              className="flex items-center justify-center min-h-[48px] sm:w-auto rounded-xl bg-zinc-100 dark:bg-white/5 px-8 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-white/10"
            >
              {t('buttons.cancel')}
            </Link>
            <button
              className="flex items-center justify-center min-h-[48px] sm:w-auto rounded-xl bg-zinc-900 dark:bg-white px-8 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
              type="submit"
              disabled={createPawnMutation.isPending}
            >
              {createPawnMutation.isPending ? t('buttons.saving') : t('loans.savePawnTicket')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2.5 w-full', className)}>{children}</div>
)

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
    {children}
  </label>
)