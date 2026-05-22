import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useAuth } from '/src/contexts/AuthContext.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getShopDetails,
  updateShopDetails,
  changePassword,
  updateUserPreferences,
  setStoredLanguage,
} from '/src/services/api.js';
import toast from 'react-hot-toast';
import {
  IconBuildingStore,
  IconLock,
  IconSettings,
} from '@tabler/icons-react';
import { Input } from '/src/components/ui/Input.jsx';
import { Label } from '/src/components/ui/Label.jsx';
import { cn } from '/src/lib/utils.js';

import { tw, buttonPrimary } from '../shared/ui/tw';

const SettingsCard = React.memo(({ title, description, icon, children }) => (
  <div className={tw.card}>
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center text-gray-600">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <div className="mt-6 space-y-6">{children}</div>
  </div>
));

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2 w-full', className)}>
    {children}
  </div>
);

export default function Settings() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const [shopName, setShopName] = useState('');
  const [noticePeriod, setNoticePeriod] = useState(30);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
    onSuccess: () => {
      toast.success(t('common.shopDetailsUpdated'));
      queryClient.invalidateQueries({ queryKey: ['shopDetails'] });
    },
    onError: () => toast.error(t('errors.failedToUpdateShop')),
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success(t('common.passwordChanged'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: () => toast.error(t('errors.failedToChangePassword')),
  });

  const languageMutation = useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: (_, { language }) => {
      i18n.changeLanguage(language);
      setStoredLanguage(language);
      setUser((u) => (u ? { ...u, language } : u));
      toast.success(t('common.languageUpdated'));
    },
    onError: () => toast.error(t('errors.failedToUpdatePreferences')),
  });

  const handlePasswordField = useCallback(
    (field) => (e) =>
      setPasswordData((prev) => ({ ...prev, [field]: e.target.value })),
    []
  );

  const handlePasswordSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error(t('errors.newPasswordsNoMatch'));
        return;
      }
      passwordMutation.mutate({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
    },
    [passwordData, passwordMutation, t]
  );

  const handleShopSave = useCallback(
    (e) => {
      e.preventDefault();
      shopMutation.mutate({
        shop_name: shopName,
        notice_period: noticePeriod,
      });
    },
    [shopName, noticePeriod, shopMutation]
  );

  const handleLanguageChange = useCallback(
    (e) => {
      languageMutation.mutate({ language: e.target.value });
    },
    [languageMutation]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className={tw.pageTitle}>{t('common.settings')}</h1>

      <SettingsCard
        title={t('common.preferences')}
        description={t('common.preferencesDescription')}
        icon={<IconSettings size={24} />}
      >
        <LabelInputContainer>
          <Label>{t('common.language')}</Label>
          <select
            value={user?.language ?? 'en'}
            onChange={handleLanguageChange}
            className={tw.select}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="ta">தமிழ்</option>
          </select>
        </LabelInputContainer>
      </SettingsCard>

      <SettingsCard
        title={t('common.security')}
        description={t('common.securityDescription')}
        icon={<IconLock size={24} />}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <LabelInputContainer>
            <Label>{t('forms.currentPassword')}</Label>
            <Input type="password" onChange={handlePasswordField('currentPassword')} />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label>{t('forms.newPassword')}</Label>
            <Input type="password" onChange={handlePasswordField('newPassword')} />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label>{t('forms.confirmNewPassword')}</Label>
            <Input type="password" onChange={handlePasswordField('confirmPassword')} />
          </LabelInputContainer>

          <button
            disabled={passwordMutation.isPending}
            className={cn(buttonPrimary, 'w-full max-w-xs')}
          >
            {passwordMutation.isPending
              ? t('buttons.saving')
              : t('buttons.changePassword')}
          </button>
        </form>
      </SettingsCard>

      {user?.role === 'owner' && (
        <SettingsCard
          title={t('common.shop')}
          description={t('common.shopDescription')}
          icon={<IconBuildingStore size={24} />}
        >
          <form onSubmit={handleShopSave} className="space-y-4">
            <LabelInputContainer>
              <Label>{t('auth.shopName')}</Label>
              <Input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                disabled={isLoadingShop}
              />
            </LabelInputContainer>

            <button
              disabled={shopMutation.isPending || isLoadingShop}
              className={cn(buttonPrimary, 'w-full max-w-xs')}
            >
              {shopMutation.isPending
                ? t('buttons.saving')
                : t('buttons.saveShopDetails')}
            </button>
          </form>
        </SettingsCard>
      )}
    </div>
  );
}
