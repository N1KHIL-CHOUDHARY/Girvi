import React, { useEffect, useRef, useState } from 'react';
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
    language: 'en'
  });

  const firstNameRef = useRef(null);
  const emailRef = useRef(null);

  const isMobileViewport = () =>
    typeof window !== 'undefined' && window.innerWidth <= 768;

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
      language: formData.language
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
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold">
          {t('auth.welcomeToPawnManager')}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          {t('auth.createAccountToStart')}
        </p>

        <form className="mt-6" onSubmit={handleSubmit}>
          {/* Step indicator (mobile) */}
          <div className="mb-4 md:hidden flex justify-between text-xs text-neutral-500">
            <span>{t('auth.stepOf', { step })}</span>
            <span>
              {step === 1
                ? t('auth.basicDetails')
                : t('auth.accountSecurity')}
            </span>
          </div>

          {/* STEP 1 */}
          <div className={cn(step === 1 ? 'block' : 'hidden', 'md:block')}>
            <LabelInputContainer>
              <Label>{t('auth.firstname')}</Label>
              <Input
                name="firstname"
                onChange={handleChange}
                ref={firstNameRef}
                required
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label>{t('auth.lastname')}</Label>
              <Input name="lastname" onChange={handleChange} required />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label>{t('auth.shopName')}</Label>
              <Input name="shop_name" onChange={handleChange} required />
            </LabelInputContainer>

            {/* 🌐 LANGUAGE SELECT */}
            <LabelInputContainer>
              <Label>{t('common.language')}</Label>
              <select
                value={formData.language}
                onChange={(e) => {
                  const lang = e.target.value;
                  setFormData({ ...formData, language: lang });
                  i18n.changeLanguage(lang);
                }}
                className="min-h-[44px] rounded-md border px-3"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
              </select>
            </LabelInputContainer>
          </div>

          {/* STEP 2 */}
          <div className={cn(step === 2 ? 'block' : 'hidden', 'md:block')}>
            <LabelInputContainer>
              <Label>{t('auth.emailAddress')}</Label>
              <Input
                name="email"
                type="email"
                ref={emailRef}
                onChange={handleChange}
                required
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label>{t('auth.password')}</Label>
              <Input
                name="password"
                type="password"
                onChange={handleChange}
                required
              />
            </LabelInputContainer>
          </div>

          {/* MOBILE BUTTON */}
          <div className="md:hidden mt-4">
            {step === 1 ? (
              <button
                type="button"
                onClick={goToStepTwo}
                className="btn-primary w-full"
              >
                {t('auth.next')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading
                  ? t('auth.creatingAccount')
                  : t('auth.createAccount')}
              </button>
            )}
          </div>

          {/* DESKTOP BUTTON */}
          <div className="hidden md:block mt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading
                ? t('auth.creatingAccount')
                : t('auth.signupAction')}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-indigo-500 font-semibold">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

const LabelInputContainer = ({ children }) => (
  <div className="flex flex-col space-y-2 mb-4">{children}</div>
);
