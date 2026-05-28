import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPawnTicketById, updatePawnTicket } from '../services/api'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { IconTicket } from '@tabler/icons-react'

export default function UpdatePawn() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState(null)
  const [customerName, setCustomerName] = useState('')

  const {
    data: pawnData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['pawnTicket', id],
    queryFn: async () => {
      const res = await getPawnTicketById(id)
      return res.data
    },
    onError: () => {
      toast.error(t('errors.failedToLoadCustomer'))
      navigate('/app/pawns')
    },
  })

  useEffect(() => {
    if (pawnData) {
      setCustomerName(pawnData.customer_id?.full_name || 'N/A')
      setFormData({
        customer_id: pawnData.customer_id?._id,
        ticket_number: pawnData.ticket_number,
        loan_amount: pawnData.loan_amount,
        interest_rate: pawnData.interest_rate,
        adv_amount: pawnData.adv_amount,
        pawned_date: new Date(pawnData.pawned_date).toISOString().split('T')[0],
        item_name: pawnData.items[0]?.name || '',
        item_weight: pawnData.items[0]?.weight_grams || '',
        item_purity: pawnData.items[0]?.purity || '',
        item_description: pawnData.items[0]?.description || '',
      })
    }
  }, [pawnData])

  const updateMutation = useMutation({
    mutationFn: (payload) => updatePawnTicket(id, payload),
    onSuccess: () => {
      toast.success(t('loans.updateSuccess'))
      queryClient.invalidateQueries(['pawnTickets'])
      queryClient.invalidateQueries(['pawnTicket', id])
      navigate('/app/pawns')
    },
    onError: (error) => {
      const message = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      t('loans.updateFailed')
      
      toast.error(message.replace(/"/g, ''))
    },
  })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData) return

    const payload = {
      customer_id: formData.customer_id,
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

    updateMutation.mutate(payload)
  }

  if (isLoading || !formData) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-10 text-center shadow-sm animate-pulse">
          <div className="h-6 bg-zinc-200 dark:bg-white/5 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-zinc-200 dark:bg-white/5 rounded w-1/4 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-10 text-center shadow-sm">
          <p className="text-rose-600 dark:text-rose-400 font-medium text-lg mb-4">{t('common.failedToLoadTicket')}</p>
          <Link to="/app/pawns" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 px-6 text-sm font-medium text-zinc-900 dark:text-white transition-colors hover:bg-zinc-200 dark:hover:bg-white/10">
            {t('buttons.goBack')}
          </Link>
        </div>
      </div>
    )
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
              {t('common.updatePawnTicket')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t('common.editingTicketFor', { ticket: formData.ticket_number, name: customerName })}
            </p>
          </div>
        </div>

        <form className="relative z-10" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-8">
            <Label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('common.customerLabel')}</Label>
            <Input type="text" value={customerName} disabled className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02] px-4 text-sm text-zinc-500 dark:text-zinc-500" />
          </LabelInputContainer>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabelInputContainer>
              <Label htmlFor="ticket_number" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.ticketNumberLabel')}</Label>
              <Input id="ticket_number" name="ticket_number" type="text" autoComplete="off" enterKeyHint="next" value={formData.ticket_number} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pawned_date" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.pawnedDate')}</Label>
              <Input id="pawned_date" name="pawned_date" type="date" enterKeyHint="next" value={formData.pawned_date} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
          </div>

          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <LabelInputContainer>
              <Label htmlFor="loan_amount" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.loanAmountLabel')}</Label>
              <Input id="loan_amount" name="loan_amount" type="number" inputMode="decimal" enterKeyHint="next" value={formData.loan_amount} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="interest_rate" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.interestRate')}</Label>
              <Input id="interest_rate" name="interest_rate" type="number" inputMode="decimal" enterKeyHint="next" value={formData.interest_rate} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="adv_amount" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.advanceAmount')}</Label>
              <Input id="adv_amount" name="adv_amount" type="number" inputMode="decimal" enterKeyHint="next" value={formData.adv_amount} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
          </div>

          <div className="my-10 h-px w-full bg-zinc-100 dark:bg-white/[0.05]" />

          <h3 className="mb-6 text-lg font-medium tracking-tight text-zinc-900 dark:text-white">
            {t('loans.itemDetails')}
          </h3>

          <LabelInputContainer className="mb-6">
            <Label htmlFor="item_name" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.itemName')}</Label>
            <Input id="item_name" name="item_name" type="text" autoComplete="off" enterKeyHint="next" value={formData.item_name} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
          </LabelInputContainer>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <LabelInputContainer>
              <Label htmlFor="item_weight" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.weightGrams')}</Label>
              <Input id="item_weight" name="item_weight" type="number" inputMode="decimal" enterKeyHint="next" value={formData.item_weight} onChange={handleChange} required className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="item_purity" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.purity')}</Label>
              <Input id="item_purity" name="item_purity" type="number" inputMode="numeric" enterKeyHint="next" value={formData.item_purity} onChange={handleChange} className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-10">
            <Label htmlFor="item_description" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.itemDescription')}</Label>
            <Input id="item_description" name="item_description" type="text" autoComplete="off" enterKeyHint="done" value={formData.item_description} onChange={handleChange} className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t('buttons.saving') : t('buttons.saveChanges')}
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