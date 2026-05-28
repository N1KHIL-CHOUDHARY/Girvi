import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAccountById, updateAccount } from '../services/api'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import FileUpload from '../components/FileUpload'
import { IconUser } from '@tabler/icons-react'

export default function UpdateCustomer() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState(null)

  const {
    data: customerData,
    isLoading: loadingCustomer,
    isError,
  } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await getAccountById(id)
      return res.data
    },
    onError: () => {
      toast.error(t('errors.failedToLoadCustomer'))
      navigate('/app/customers')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload) => updateAccount(id, payload),
    onSuccess: () => {
      toast.success(t('customers.updatedSuccess'))
      queryClient.invalidateQueries(['customers'])
      queryClient.invalidateQueries(['customer', id])
      navigate('/app/customers')
    },
    onError: (error) => {
      const message = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        t('errors.failedToUpdateCustomer')
        
      toast.error(message.replace(/"/g, ''))
    },
  })

  useEffect(() => {
    if (customerData) {
      setFormData({
        full_name: customerData.full_name,
        phone_number: customerData.phone_number,
        gender: customerData.gender || 'Male',
        line1: customerData.address?.line1 || '',
        city: customerData.address?.city || '',
        pincode: customerData.address?.pincode || '',
        aadhaar_number: customerData.aadhaar_number || '',
        pan_number: customerData.pan_number || '',
        customer_photo_url: customerData.customer_photo_url || '',
      })
    }
  }, [customerData])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData) return

    const payload = {
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      gender: formData.gender,
      address: {
        line1: formData.line1,
        city: formData.city,
        pincode: formData.pincode,
      },
      aadhaar_number: formData.aadhaar_number,
      pan_number: formData.pan_number,
      customer_photo_url: formData.customer_photo_url || undefined,
    }

    updateMutation.mutate(payload)
  }

  if (loadingCustomer || !formData) {
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
          <p className="text-rose-600 dark:text-rose-400 font-medium text-lg mb-4">{t('common.failedToLoadCustomer')}</p>
          <Link to="/app/customers" className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 px-6 text-sm font-medium text-zinc-900 dark:text-white transition-colors hover:bg-zinc-200 dark:hover:bg-white/10">
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
            <IconUser className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-white">
              {t('common.updateCustomer')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t('common.editingDetailsFor', { name: formData.full_name })}
            </p>
          </div>
        </div>

        <form className="relative z-10" onSubmit={handleSubmit}>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabelInputContainer>
              <Label htmlFor="full_name" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('forms.fullName')}</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                enterKeyHint="next"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="phone_number" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('forms.phoneNumber')}</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                enterKeyHint="next"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-6">
            <Label htmlFor="gender" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('forms.gender')}</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={cn(
                "min-h-[48px] w-full rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all appearance-none cursor-pointer"
              )}
            >
              <option value="Male">{t('forms.male')}</option>
              <option value="Female">{t('forms.female')}</option>
              <option value="Other">{t('forms.other')}</option>
            </select>
          </LabelInputContainer>

          <LabelInputContainer className="mb-6">
            <Label htmlFor="line1" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('forms.addressLine')}</Label>
            <Input
              id="line1"
              name="line1"
              type="text"
              autoComplete="street-address"
              enterKeyHint="next"
              value={formData.line1}
              onChange={handleChange}
              className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
            />
          </LabelInputContainer>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <LabelInputContainer>
              <Label htmlFor="city" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('forms.city')}</Label>
              <Input id="city" name="city" type="text" autoComplete="address-level2" enterKeyHint="next" value={formData.city} onChange={handleChange} className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pincode" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('forms.pincode')}</Label>
              <Input id="pincode" name="pincode" type="text" inputMode="numeric" autoComplete="postal-code" enterKeyHint="next" value={formData.pincode} onChange={handleChange} className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
          </div>

          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <LabelInputContainer>
              <Label htmlFor="aadhaar_number" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('forms.aadhaarNumber')}</Label>
              <Input id="aadhaar_number" name="aadhaar_number" type="text" inputMode="numeric" enterKeyHint="next" value={formData.aadhaar_number} onChange={handleChange} className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pan_number" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('forms.panNumber')}</Label>
              <Input id="pan_number" name="pan_number" type="text" autoComplete="off" enterKeyHint="next" value={formData.pan_number} onChange={handleChange} className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all" />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-10">
            <Label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">{t('forms.customerPhoto')}</Label>
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] p-4">
              <FileUpload
                value={formData.customer_photo_url}
                onChange={(url) => setFormData(prev => ({ ...prev, customer_photo_url: url }))}
                label={t('forms.customerPhoto')}
              />
            </div>
          </LabelInputContainer>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-white/[0.05]">
            <Link
              to="/app/customers"
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