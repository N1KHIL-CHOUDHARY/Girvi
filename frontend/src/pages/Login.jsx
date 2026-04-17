import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/app/dashboard';

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
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
    <div style={{
      minHeight: '100dvh', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '1rem env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    }}>
      <div className="pm-card" style={{ width: '100%', maxWidth: '26rem', padding: '2.5rem 2rem' }}>

        {/* Brand mark */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius)',
            background: 'var(--brand)', marginBottom: '1.25rem',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.375rem', letterSpacing: '-0.02em' }}>
            {t('auth.welcomeBack')}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            {t('auth.logInToAccount')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="pm-form-group">
            <Label htmlFor="email" className="pm-label">{t('auth.emailAddress')}</Label>
            <Input
              id="email" name="email"
              placeholder="owner@citygold.com"
              type="email" inputMode="email"
              autoComplete="email" enterKeyHint="next"
              onChange={handleChange} required
              className="pm-input"
            />
          </div>

          {/* Password */}
          <div className="pm-form-group" style={{ marginBottom: '1.5rem' }}>
            <Label htmlFor="password" className="pm-label">{t('auth.password')}</Label>
            <Input
              id="password" name="password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password" enterKeyHint="done"
              onChange={handleChange} required
              className="pm-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pm-btn pm-btn-primary pm-btn-full pm-btn-lg"
          >
            {loading ? t('auth.loggingIn') : t('auth.loginAction')}
          </button>
        </form>

        <div className="pm-divider" style={{ margin: '1.5rem 0 1.25rem' }} />

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          {t('auth.noAccount')}{' '}
          <Link
            to="/signup"
            style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}
          >
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </div>
  );
}