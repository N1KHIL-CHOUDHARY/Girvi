import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getShopDetails,
  updateShopDetails,
  changePassword,
  updateUserPreferences,
  setStoredLanguage,
} from '../services/api';
import toast from 'react-hot-toast';
import {
  IconBuildingStore,
  IconLock,
  IconSettings,
} from '@tabler/icons-react';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { ThemeToggle } from '../components/ThemeToggle';
import { cn } from '../lib/utils';

const SettingsCard = React.memo(({ title, description, icon, children }) => (
  <div className="relative overflow-hidden shadow-sm rounded-[2rem] bg-white dark:bg-[#121212] p-6 md:p-10 border border-zinc-200/60 dark:border-white/[0.05]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
    <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-16">
      <div className="flex-1 md:max-w-[280px]">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05]">
            {icon}
          </div>
          <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  </div>
))

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2.5 w-full', className)}>
    {children}
  </div>
)

export default function Settings() {
  const { t, i18n } = useTranslation();
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
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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

  const handlePasswordField = useCallback((field) => (e) =>
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value })), []);

  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('errors.newPasswordsNoMatch'));
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  }, [passwordData, passwordMutation, t]);

  const handleShopSave = useCallback((e) => {
    e.preventDefault();
    shopMutation.mutate({ shop_name: shopName, notice_period: noticePeriod });
  }, [shopName, noticePeriod, shopMutation]);

  const handleLanguageChange = useCallback((e) => {
    languageMutation.mutate({ language: e.target.value });
  }, [languageMutation]);

  const inputClassName = "min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all";
  const buttonClassName = "min-h-[44px] rounded-xl bg-zinc-900 dark:bg-white px-6 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50";

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-white">
            {t('common.settings')}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Manage your system preferences, security, and shop configuration.
          </p>
        </div>

        <SettingsCard
          title={t('common.preferences')}
          description="Manage your appearance and system language."
          icon={<IconSettings className="w-6 h-6 text-zinc-400" />}
        >
          <div className="space-y-6 bg-zinc-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-zinc-100 dark:border-white/[0.02]">
            <LabelInputContainer>
              <Label>{t('common.language')}</Label>
              <select
                value={user?.language ?? 'en'}
                onChange={handleLanguageChange}
                className={cn(inputClassName, "appearance-none cursor-pointer")}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
              </select>
            </LabelInputContainer>

            <LabelInputContainer>
              <Label>Appearance</Label>
              <ThemeToggle />
            </LabelInputContainer>
          </div>
        </SettingsCard>

        <SettingsCard
          title={t('common.security')}
          description={t('common.securityDescription')}
          icon={<IconLock className="w-6 h-6 text-zinc-400" />}
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-zinc-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-zinc-100 dark:border-white/[0.02]">
            <LabelInputContainer>
              <Label>{t('forms.currentPassword')}</Label>
              <Input type="password" value={passwordData.currentPassword} onChange={handlePasswordField('currentPassword')} className={inputClassName} />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label>{t('forms.newPassword')}</Label>
              <Input type="password" value={passwordData.newPassword} onChange={handlePasswordField('newPassword')} className={inputClassName} />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label>{t('forms.confirmNewPassword')}</Label>
              <Input type="password" value={passwordData.confirmPassword} onChange={handlePasswordField('confirmPassword')} className={inputClassName} />
            </LabelInputContainer>
            <button disabled={passwordMutation.isPending} className={cn(buttonClassName, 'w-full sm:w-auto')}>
              {passwordMutation.isPending ? t('buttons.saving') : t('buttons.changePassword')}
            </button>
          </form>
        </SettingsCard>

        {user?.role === 'owner' && (
          <SettingsCard
            title={t('common.shop')}
            description={t('common.shopDescription')}
            icon={<IconBuildingStore className="w-6 h-6 text-zinc-400" />}
          >
            <form onSubmit={handleShopSave} className="space-y-6 bg-zinc-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-zinc-100 dark:border-white/[0.02]">
              <LabelInputContainer>
                <Label>{t('auth.shopName')}</Label>
                <Input value={shopName} onChange={(e) => setShopName(e.target.value)} disabled={isLoadingShop} className={inputClassName} />
              </LabelInputContainer>
              <button disabled={shopMutation.isPending || isLoadingShop} className={cn(buttonClassName, 'w-full sm:w-auto')}>
                {shopMutation.isPending ? t('buttons.saving') : t('buttons.saveShopDetails')}
              </button>
            </form>
          </SettingsCard>
        )}
      </div>
    </div>
  );
}