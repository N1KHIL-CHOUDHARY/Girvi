import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Signup() {
  const { t, i18n } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '', lastname: '', shop_name: '',
    email: '', password: '', language: 'en',
  });

  const firstNameRef = useRef(null);
  const emailRef = useRef(null);
  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateStep1 = () => {
    if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.shop_name.trim()) {
      toast.error(t('auth.fillNameAndShop')); return false;
    }
    return true;
  };

  const goToStep2 = () => { if (validateStep1()) setStep(2); };

  useEffect(() => {
    if (!isMobile()) return;
    if (step === 1) firstNameRef.current?.focus();
    if (step === 2) emailRef.current?.focus();
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isMobile() && step === 1) { goToStep2(); return; }
    setLoading(true);
    try {
      const result = await signup({
        full_name: `${formData.firstname} ${formData.lastname}`,
        shop_name: formData.shop_name,
        email: formData.email,
        password: formData.password,
        language: formData.language,
      });
      if (result.success) { toast.success(t('auth.signupSuccess')); navigate('/app/dashboard'); }
      else toast.error(result.message || t('auth.signupFailed'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.signupFailed'));
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
      <div className="pm-card" style={{ width: '100%', maxWidth: '28rem', padding: '2.5rem 2rem' }}>

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
            {t('auth.welcomeToPawnManager')}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            {t('auth.createAccountToStart')}
          </p>
        </div>

        {/* Mobile step indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          {[1, 2].map((s) => (
            <div key={s} style={{
              flex: 1, height: '3px', borderRadius: '9999px',
              background: s <= step ? 'var(--brand)' : 'var(--bg-muted)',
              marginRight: s < 2 ? '0.5rem' : 0,
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          <div style={{ display: step === 1 ? 'block' : 'none' }} className="signup-step1-desktop">
            <style>{`@media(min-width:769px){.signup-step1-desktop{display:block!important}.signup-step2-desktop{display:block!important}}`}</style>

            <div className="pm-form-group">
              <Label className="pm-label">{t('auth.firstname')}</Label>
              <Input name="firstname" className="pm-input" ref={firstNameRef}
                onChange={handleChange} enterKeyHint="next" required />
            </div>
            <div className="pm-form-group">
              <Label className="pm-label">{t('auth.lastname')}</Label>
              <Input name="lastname" className="pm-input" onChange={handleChange} enterKeyHint="next" required />
            </div>
            <div className="pm-form-group">
              <Label className="pm-label">{t('auth.shopName')}</Label>
              <Input name="shop_name" className="pm-input" onChange={handleChange} enterKeyHint="next" required />
            </div>
            <div className="pm-form-group">
              <Label className="pm-label">{t('common.language')}</Label>
              <select
                value={formData.language}
                onChange={(e) => { const l = e.target.value; setFormData({ ...formData, language: l }); i18n.changeLanguage(l); }}
                className="pm-input pm-input-select"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: step === 2 ? 'block' : 'none' }} className="signup-step2-desktop">
            <div className="pm-form-group">
              <Label className="pm-label">{t('auth.emailAddress')}</Label>
              <Input name="email" type="email" inputMode="email" className="pm-input"
                ref={emailRef} onChange={handleChange} autoComplete="email" enterKeyHint="next" required />
            </div>
            <div className="pm-form-group" style={{ marginBottom: '1.5rem' }}>
              <Label className="pm-label">{t('auth.password')}</Label>
              <Input name="password" type="password" className="pm-input"
                onChange={handleChange} autoComplete="new-password" enterKeyHint="done" required />
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="signup-mob-btns">
            <style>{`@media(min-width:769px){.signup-mob-btns{display:none!important}.signup-desk-btn{display:flex!important}}`}</style>
            {step === 1 ? (
              <button type="button" onClick={goToStep2} className="pm-btn pm-btn-primary pm-btn-full pm-btn-lg">
                {t('auth.next')}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="pm-btn pm-btn-secondary pm-btn-full"
                  style={{ fontSize: '0.8125rem' }}
                >
                  ← {t('auth.back', 'Back')}
                </button>
                <button type="submit" disabled={loading} className="pm-btn pm-btn-primary pm-btn-full pm-btn-lg">
                  {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                </button>
              </div>
            )}
          </div>

          {/* Desktop button */}
          <div className="signup-desk-btn" style={{ display: 'none', marginTop: '0.25rem' }}>
            <button type="submit" disabled={loading} className="pm-btn pm-btn-primary pm-btn-full pm-btn-lg">
              {loading ? t('auth.creatingAccount') : t('auth.signupAction')}
            </button>
          </div>
        </form>

        <div className="pm-divider" style={{ margin: '1.5rem 0 1.25rem' }} />

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}