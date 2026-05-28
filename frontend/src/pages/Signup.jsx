import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { ThemeToggle } from '../components/ThemeToggle';

export default function Signup() {
  const { t, i18n } = useTranslation()
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    shop_name: '',
    email: '',
    password: '',
    language: 'en',
  })

  const firstNameRef = useRef(null)
  const emailRef = useRef(null)

  const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 768

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateStepOne = () => {
    const { firstname, lastname, shop_name } = formData
    if (!firstname.trim() || !lastname.trim() || !shop_name.trim()) {
      toast.error(t('auth.fillNameAndShop'))
      return false
    }
    return true
  }

  const goToStepTwo = () => {
    if (!validateStepOne()) return
    setStep(2)
  }

  useEffect(() => {
    if (!isMobileViewport()) return
    if (step === 1 && firstNameRef.current) {
      firstNameRef.current.focus()
    }
    if (step === 2 && emailRef.current) {
      emailRef.current.focus()
    }
  }, [step])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isMobileViewport() && step === 1) {
      goToStepTwo()
      return
    }

    setLoading(true)

    const payload = {
      full_name: `${formData.firstname} ${formData.lastname}`,
      shop_name: formData.shop_name,
      email: formData.email,
      password: formData.password,
      language: formData.language,
    }

    try {
      const result = await signup(payload)
      if (result.success) {
        toast.success(t('auth.signupSuccess'))
        navigate('/app/dashboard')
      } else {
        toast.error(result.message || t('auth.signupFailed'))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.signupFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 font-sans">
      <div className="relative overflow-hidden w-full max-w-lg rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-8 sm:p-10 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 mb-8 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            Create your account
          </p>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-white mb-2">
            Start managing your pawn shop in one smart system.
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign up quickly and bring your pawn ticket processes, customers, and payments together.
          </p>
        </div>

        <form className="relative z-10 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <LabelInputContainer>
              <Label htmlFor="firstname" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('auth.firstname')}</Label>
              <Input 
                ref={firstNameRef} 
                id="firstname" 
                name="firstname" 
                onChange={handleChange} 
                required 
                className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('auth.lastname')}</Label>
              <Input 
                id="lastname" 
                name="lastname" 
                onChange={handleChange} 
                required 
                className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer>
            <Label htmlFor="shop_name" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('auth.shopName')}</Label>
            <Input 
              id="shop_name" 
              name="shop_name" 
              onChange={handleChange} 
              required 
              className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
            />
          </LabelInputContainer>

          <div className="grid gap-4 md:grid-cols-2">
            <LabelInputContainer>
              <Label htmlFor="email" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('auth.emailAddress')}</Label>
              <Input 
                ref={emailRef} 
                id="email" 
                name="email" 
                type="email" 
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
                onChange={handleChange} 
                required 
                className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer>
            <Label htmlFor="language" className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('common.language')}</Label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => {
                const lang = e.target.value
                setFormData({ ...formData, language: lang })
                i18n.changeLanguage(lang)
              }}
              className="min-h-[48px] w-full rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all appearance-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </LabelInputContainer>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] rounded-xl bg-zinc-900 dark:bg-white px-6 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 shadow-sm"
            >
              {loading ? t('auth.creatingAccount') : t('auth.signupAction')}
            </button>
          </div>
        </form>

        <p className="relative z-10 mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-white/[0.05] pt-8">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-medium text-zinc-900 dark:text-white hover:underline transition-colors">
            {t('auth.login')}
          </Link>
        </p>
      </div>
      
    </div>
  )
}

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2.5 w-full', className)}>{children}</div>
)