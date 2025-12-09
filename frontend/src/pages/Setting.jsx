import React, { useState, useEffect } from 'react';
import { useTheme } from '/src/contexts/ThemeContext.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShopDetails, updateShopDetails } from '/src/services/api.js';
import toast from 'react-hot-toast';
import { IconDeviceDesktop, IconSun, IconMoon, IconBuildingStore, IconLock, IconBellRinging, IconSettings } from '@tabler/icons-react';
import { Input } from '/src/components/ui/Input.jsx';
import { Label } from '/src/components/ui/Label.jsx';
import { cn } from '/src/lib/utils.js';

const SettingsCard = ({ title, description, icon, children }) => (
  <div className="shadow-input rounded-2xl bg-white p-6 md:p-8 dark:bg-black">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>
    </div>
    <div className="mt-6 space-y-6">{children}</div>
  </div>
);

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const options = [
    { name: 'Light', value: 'light', icon: <IconSun size={16} className="text-black dark:text-white" /> },
    { name: 'Dark', value: 'dark', icon: <IconMoon size={16} className="text-black dark:text-white" /> },
    { name: 'System', value: 'system', icon: <IconDeviceDesktop size={16} className="text-black dark:text-white" /> },
  ];

  return (
    <div>
      <Label>Theme</Label>
      <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-gray-100 dark:bg-neutral-800 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              theme === option.value
                ? 'bg-white shadow-sm dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-900/50'
            )}
          >
            {option.icon}
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2 w-full', className)}>{children}</div>
);

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

export default function Settings() {
  const queryClient = useQueryClient();
  const [shopName, setShopName] = useState('');
  const [noticePeriod, setNoticePeriod] = useState(30);

  const { data: shopData, isLoading: isLoadingShop } = useQuery({
    queryKey: ['shopDetails'],
    queryFn: getShopDetails,
    onSuccess: (data) => {
      setShopName(data?.data?.shop_name || '');
      setNoticePeriod(data?.data?.notice_period || 30);
    },
  });

  const shopMutation = useMutation({
    mutationFn: updateShopDetails,
    onSuccess: () => {
      toast.success('Shop details updated!');
      queryClient.invalidateQueries(['shopDetails']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update shop.');
    },
  });

  const handleShopSave = (e) => {
    e.preventDefault();
    shopMutation.mutate({ shop_name: shopName, notice_period: noticePeriod });
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
        Settings
      </h1>

      <SettingsCard
        title="Preferences"
        description="Manage your theme and app preferences."
        icon={<IconSettings size={24} className="text-black dark:text-white" />}
      >
        <ThemeToggle />
        <LabelInputContainer>
          <Label htmlFor="noticePeriod">Default Notice Period (Days)</Label>
          <Input
            id="noticePeriod"
            name="noticePeriod"
            type="number"
            value={noticePeriod}
            onChange={(e) => setNoticePeriod(e.target.value)}
            placeholder="e.g., 30"
          />
        </LabelInputContainer>
      </SettingsCard>

      <SettingsCard
        title="Shop"
        description="Manage your shop's details."
        icon={<IconBuildingStore size={24} className="text-black dark:text-white" />}
      >
        <form onSubmit={handleShopSave} className="space-y-4">
          <LabelInputContainer>
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              name="shopName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Your Shop Name"
              disabled={isLoadingShop}
            />
          </LabelInputContainer>
          <button
            className="group/btn relative block h-10 w-full max-w-xs rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={shopMutation.isPending || isLoadingShop}
          >
            {shopMutation.isPending ? 'Saving...' : 'Save Shop Details'}
            <BottomGradient />
          </button>
        </form>
      </SettingsCard>
    </div>
  );
}