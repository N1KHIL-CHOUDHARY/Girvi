import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'

export default function Login() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/app/dashboard'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await login(formData)
      if (result.success) {
        toast.success(t('auth.loginSuccess'))
        navigate(from, { replace: true })
      } else {
        toast.error(result.message || t('auth.loginFailed'))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 font-sans">
      <div className="relative overflow-hidden w-full max-w-md rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-8 sm:p-10 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-white mb-2">
            {t('auth.welcomeBack')}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('auth.logInToAccount')}
          </p>
        </div>

        <form className="relative z-10 space-y-6" onSubmit={handleSubmit}>
          <LabelInputContainer>
            <Label htmlFor="email" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('auth.emailAddress')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="owner@citygold.com"
              autoComplete="email"
              onChange={handleChange}
              required
              className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('auth.password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              onChange={handleChange}
              required
              className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
            />
          </LabelInputContainer>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] rounded-xl bg-zinc-900 dark:bg-white px-6 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 shadow-sm"
            >
              {loading ? t('auth.loggingIn') : t('auth.loginAction')}
            </button>
          </div>
        </form>

        <p className="relative z-10 mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-white/[0.05] pt-8">
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="font-medium text-zinc-900 dark:text-white hover:underline transition-colors">
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </div>
  )
}

const LabelInputContainer = ({ children, className }) => {
  return <div className={cn('flex flex-col space-y-2.5 w-full', className)}>{children}</div>
}