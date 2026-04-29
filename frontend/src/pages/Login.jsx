import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData);
      if (result.success) {
        toast.success(t('auth.loginSuccess'));
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || t('auth.loginFailed'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#f4faf5] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-md rounded-[2rem] bg-white p-8 shadow-soft border border-slate-200">
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">{t('auth.welcomeBack')}</h2>
          <p className="text-sm text-slate-600">{t('auth.logInToAccount')}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <LabelInputContainer>
            <Label htmlFor="email">{t('auth.emailAddress')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="owner@citygold.com"
              autoComplete="email"
              onChange={handleChange}
              required
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              onChange={handleChange}
              required
            />
          </LabelInputContainer>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t('auth.loggingIn') : t('auth.loginAction')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800">
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </div>
  );
}

const LabelInputContainer = ({ children, className }) => {
  return <div className={cn('flex flex-col space-y-2', className)}>{children}</div>;
};