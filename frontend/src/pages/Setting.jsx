import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useAuth } from '/src/contexts/AuthContext.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getShopDetails,
  updateShopDetails,
  changePassword,
  updateUserPreferences,
  setStoredLanguage
} from '/src/services/api.js';
import toast from 'react-hot-toast';
import {
  IconBuildingStore,
  IconLock,
  IconSettings,
  IconLanguage
} from '@tabler/icons-react';
import { Input } from '/src/components/ui/Input.jsx';
import { Label } from '/src/components/ui/Label.jsx';
import { cn } from '/src/lib/utils.js';

/* -------------------- UI HELPERS -------------------- */

const SettingsCard = ({ title, description, icon, children }) => (
  <div className="shadow-input rounded-2xl bg-white p-6 md:p-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-neutral-600">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
    </div>
    <div className="mt-6 space-y-6">{children}</div>
  </div>
);

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2 w-full', className)}>
    {children}
  </div>
);

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

/* -------------------- MAIN SETTINGS -------------------- */

export default function Settings() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const [shopName, setShopName] = useState('');
  const [noticePeriod, setNoticePeriod] = useState(30);
  const [language, setLanguage] = useState(user?.language || 'en');

  useEffect(() => {
    if (user?.language && user.language !== language) {
      setLanguage(user.language);
    }
  }, [user?.language]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  const { isLoading: isLoadingShop } = useQuery({
    queryKey: ['shopDetails'],
    queryFn: getShopDetails,
    enabled: user?.role === 'owner',
    onSuccess: (data) => {
      setShopName(data?.data?.shop_name || '');
      setNoticePeriod(data?.data?.notice_period || 30);
    }
  });


  const shopMutation = useMutation({
    mutationFn: updateShopDetails,
    onSuccess: () => {
      toast.success(t('common.shopDetailsUpdated'));
      queryClient.invalidateQueries(['shopDetails']);
    },
    onError: () => {
      toast.error(t('errors.failedToUpdateShop'));
    }
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success(t('common.passwordChanged'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: () => {
      toast.error(t('errors.failedToChangePassword'));
    }
  });

  const languageMutation = useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: (_, variables) => {
      const lang = variables?.language ?? variables;
      i18n.changeLanguage(lang);
      setStoredLanguage(lang);
      setUser((prev) => (prev ? { ...prev, language: lang } : prev));
      toast.success(t('common.languageUpdated'));
    },
    onError: () => {
      toast.error(t('errors.failedToUpdatePreferences'));
    }
  });


  const handleShopSave = (e) => {
    e.preventDefault();
    shopMutation.mutate({
      shop_name: shopName,
      notice_period: noticePeriod
    });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('errors.newPasswordsNoMatch'));
      return;
    }

    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    languageMutation.mutate({ language: lang });
  };

  

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-neutral-800">
        {t('common.settings')}
      </h1>

      
      <SettingsCard
        title={t('common.preferences')}
        description={t('common.preferencesDescription')}
        icon={<IconSettings size={24} className="text-black" />}
      >
        <LabelInputContainer>
          <Label>{t('common.language')}</Label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="min-h-[44px] rounded-md border px-3"
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
        icon={<IconLock size={24} className="text-black" />}
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <LabelInputContainer>
            <Label>{t('forms.currentPassword')}</Label>
            <Input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              required
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label>{t('forms.newPassword')}</Label>
            <Input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              required
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label>{t('forms.confirmNewPassword')}</Label>
            <Input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              required
            />
          </LabelInputContainer>

          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="group/btn relative h-10 w-full max-w-xs rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white"
          >
            {passwordMutation.isPending
              ? t('buttons.saving')
              : t('buttons.changePassword')}
            <BottomGradient />
          </button>
        </form>
      </SettingsCard>

      {user?.role === 'owner' && (
        <SettingsCard
          title={t('common.shop')}
          description={t('common.shopDescription')}
          icon={<IconBuildingStore size={24} className="text-black" />}
        >
          <form onSubmit={handleShopSave} className="space-y-4">
            <LabelInputContainer>
              <Label>{t('auth.shopName')}</Label>
              <Input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={t('common.shopNamePlaceholder')}
                disabled={isLoadingShop}
              />
            </LabelInputContainer>

            <button
              type="submit"
              disabled={shopMutation.isPending || isLoadingShop}
              className="group/btn relative h-10 w-full max-w-xs rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white"
            >
              {shopMutation.isPending
                ? t('buttons.saving')
                : t('buttons.saveShopDetails')}
              <BottomGradient />
            </button>
          </form>
        </SettingsCard>
      )}
    </div>
  );
}
