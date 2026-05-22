import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Signup() {
  const { t, i18n } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    shop_name: '',
    email: '',
    password: '',
    language: 'en',
  });

  const firstNameRef = useRef(null);
  const emailRef = useRef(null);

  const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStepOne = () => {
    const { firstname, lastname, shop_name } = formData;
    if (!firstname.trim() || !lastname.trim() || !shop_name.trim()) {
      toast.error(t('auth.fillNameAndShop'));
      return false;
    }
    return true;
  };

  const goToStepTwo = () => {
    if (!validateStepOne()) return;
    setStep(2);
  };

  useEffect(() => {
    if (!isMobileViewport()) return;
    if (step === 1 && firstNameRef.current) {
      firstNameRef.current.focus();
    }
    if (step === 2 && emailRef.current) {
      emailRef.current.focus();
    }
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isMobileViewport() && step === 1) {
      goToStepTwo();
      return;
    }

    setLoading(true);

    const payload = {
      full_name: `${formData.firstname} ${formData.lastname}`,
      shop_name: formData.shop_name,
      email: formData.email,
      password: formData.password,
      language: formData.language,
    };

    try {
      const result = await signup(payload);
      if (result.success) {
        toast.success(t('auth.signupSuccess'));
        navigate('/app/dashboard');
      } else {
        toast.error(result.message || t('auth.signupFailed'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-soft border border-slate-200">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Create your account</p>
          <h1 className="text-3xl font-semibold text-slate-900">Start managing your pawn shop in one smart system.</h1>
          <p className="text-sm text-slate-600">Sign up quickly and bring your pawn ticket processes, customers, and payments together.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <LabelInputContainer>
              <Label htmlFor="firstname">{t('auth.firstname')}</Label>
              <Input ref={firstNameRef} id="firstname" name="firstname" onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname">{t('auth.lastname')}</Label>
              <Input id="lastname" name="lastname" onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <LabelInputContainer>
            <Label htmlFor="shop_name">{t('auth.shopName')}</Label>
            <Input id="shop_name" name="shop_name" onChange={handleChange} required />
          </LabelInputContainer>

          <div className="grid gap-4 md:grid-cols-2">
            <LabelInputContainer>
              <Label htmlFor="email">{t('auth.emailAddress')}</Label>
              <Input ref={emailRef} id="email" name="email" type="email" onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" name="password" type="password" onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <LabelInputContainer>
            <Label htmlFor="language">{t('common.language')}</Label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => {
                const lang = e.target.value;
                setFormData({ ...formData, language: lang });
                i18n.changeLanguage(lang);
              }}
              className="min-h-[44px] w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </LabelInputContainer>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t('auth.creatingAccount') : t('auth.signupAction')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

const LabelInputContainer = ({ children }) => (
  <div className="flex flex-col gap-2">{children}</div>
);
