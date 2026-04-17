import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useAuth } from '/src/contexts/AuthContext.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getShopDetails, updateShopDetails, changePassword,
  updateUserPreferences, setStoredLanguage,
} from '/src/services/api.js';
import toast from 'react-hot-toast';
import { IconBuildingStore, IconLock, IconSettings } from '@tabler/icons-react';
import { Input } from '/src/components/ui/Input.jsx';
import { Label } from '/src/components/ui/Label.jsx';

/* ── Card ── */
function SettingsCard({ title, description, icon, children }) {
  return (
    <div className="pm-card" style={{ padding: '1.75rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-sm)',
          background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {React.cloneElement(icon, { size: 17, style: { color: 'var(--brand)' } })}
        </div>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            {title}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{description}</p>
        </div>
      </div>
      <div className="pm-divider" style={{ margin: '0 0 1.5rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const [shopName, setShopName] = useState('');
  const [noticePeriod, setNoticePeriod] = useState(30);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const { isLoading: isLoadingShop } = useQuery({
    queryKey: ['shopDetails'],
    queryFn: getShopDetails,
    enabled: user?.role === 'owner',
    onSuccess: ({ data }) => {
      setShopName(data?.shop_name ?? '');
      setNoticePeriod(data?.notice_period ?? 30);
    },
  });

  const shopMutation = useMutation({
    mutationFn: updateShopDetails,
    onSuccess: () => { toast.success(t('common.shopDetailsUpdated')); queryClient.invalidateQueries({ queryKey: ['shopDetails'] }); },
    onError: () => toast.error(t('errors.failedToUpdateShop')),
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success(t('common.passwordChanged'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: () => toast.error(t('errors.failedToChangePassword')),
  });

  const languageMutation = useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: (_, { language }) => {
      i18n.changeLanguage(language);
      setStoredLanguage(language);
      setUser((u) => u ? { ...u, language } : u);
      toast.success(t('common.languageUpdated'));
    },
    onError: () => toast.error(t('errors.failedToUpdatePreferences')),
  });

  const handlePasswordField = useCallback((field) => (e) =>
    setPasswordData((p) => ({ ...p, [field]: e.target.value })), []);

  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('errors.newPasswordsNoMatch')); return;
    }
    passwordMutation.mutate({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
  }, [passwordData, passwordMutation, t]);

  const handleShopSave = useCallback((e) => {
    e.preventDefault();
    shopMutation.mutate({ shop_name: shopName, notice_period: noticePeriod });
  }, [shopName, noticePeriod, shopMutation]);

  return (
    <div style={{ padding: 'var(--page-py) var(--page-px)', maxWidth: '42rem', margin: '0 auto' }}>
      <div className="pm-page-header">
        <h1 className="pm-section-title">{t('common.settings')}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Preferences */}
        <SettingsCard
          title={t('common.preferences')}
          description={t('common.preferencesDescription')}
          icon={<IconSettings />}
        >
          <div className="pm-form-group" style={{ marginBottom: 0 }}>
            <Label className="pm-label">{t('common.language')}</Label>
            <select
              value={user?.language ?? 'en'}
              onChange={(e) => languageMutation.mutate({ language: e.target.value })}
              className="pm-input pm-input-select"
              style={{ maxWidth: '16rem' }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
        </SettingsCard>

        {/* Security */}
        <SettingsCard
          title={t('common.security')}
          description={t('common.securityDescription')}
          icon={<IconLock />}
        >
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              [t('forms.currentPassword'), 'currentPassword'],
              [t('forms.newPassword'), 'newPassword'],
              [t('forms.confirmNewPassword'), 'confirmPassword'],
            ].map(([label, field]) => (
              <div className="pm-form-group" key={field} style={{ marginBottom: 0 }}>
                <Label className="pm-label">{label}</Label>
                <Input
                  type="password"
                  className="pm-input"
                  style={{ maxWidth: '24rem' }}
                  value={passwordData[field]}
                  onChange={handlePasswordField(field)}
                />
              </div>
            ))}
            <div>
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="pm-btn pm-btn-primary"
              >
                {passwordMutation.isPending ? t('buttons.saving') : t('buttons.changePassword')}
              </button>
            </div>
          </form>
        </SettingsCard>

        {/* Shop details — owner only */}
        {user?.role === 'owner' && (
          <SettingsCard
            title={t('common.shop')}
            description={t('common.shopDescription')}
            icon={<IconBuildingStore />}
          >
            <form onSubmit={handleShopSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="pm-form-group" style={{ marginBottom: 0 }}>
                <Label className="pm-label">{t('auth.shopName')}</Label>
                <Input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  disabled={isLoadingShop}
                  className="pm-input"
                  style={{ maxWidth: '24rem' }}
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={shopMutation.isPending || isLoadingShop}
                  className="pm-btn pm-btn-primary"
                >
                  {shopMutation.isPending ? t('buttons.saving') : t('buttons.saveShopDetails')}
                </button>
              </div>
            </form>
          </SettingsCard>
        )}
      </div>
    </div>
  );
}