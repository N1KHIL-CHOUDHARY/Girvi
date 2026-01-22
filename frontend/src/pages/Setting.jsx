import React, { useState, useEffect } from 'react';
import { useAuth } from '/src/contexts/AuthContext.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShopDetails, updateShopDetails, changePassword } from '/src/services/api.js';
import toast from 'react-hot-toast';
import { IconBuildingStore, IconLock, IconSettings } from '@tabler/icons-react';
import { Input } from '/src/components/ui/Input.jsx';
import { Label } from '/src/components/ui/Label.jsx';
import { cn } from '/src/lib/utils.js';

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
  <div className={cn('flex flex-col space-y-2 w-full', className)}>{children}</div>
);

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [shopName, setShopName] = useState('');
  const [noticePeriod, setNoticePeriod] = useState(30);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: shopData, isLoading: isLoadingShop } = useQuery({
    queryKey: ['shopDetails'],
    queryFn: getShopDetails,
    enabled: user?.role === 'owner',
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

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    },
  });

  const handleShopSave = (e) => {
    e.preventDefault();
    shopMutation.mutate({ shop_name: shopName, notice_period: noticePeriod });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handlePasswordFormChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-neutral-800">
        Settings
      </h1>

      <SettingsCard
        title="Preferences"
        description="Manage your app preferences."
        icon={<IconSettings size={24} className="text-black" />}
      >
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
        title="Security"
        description="Manage your account security."
        icon={<IconLock size={24} className="text-black" />}
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <LabelInputContainer>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordFormChange}
              required
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordFormChange}
              required
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordFormChange}
              required
            />
          </LabelInputContainer>
          <button
            className="group/btn relative block h-10 w-full max-w-xs rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
            type="submit"
            disabled={passwordMutation.isPending}
          >
            {passwordMutation.isPending ? 'Saving...' : 'Change Password'}
            <BottomGradient />
          </button>
        </form>
      </SettingsCard>

      {user?.role === 'owner' && (
        <SettingsCard
          title="Shop"
          description="Manage your shop's details."
          icon={<IconBuildingStore size={24} className="text-black" />}
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
              className="group/btn relative block h-10 w-full max-w-xs rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
              type="submit"
              disabled={shopMutation.isPending || isLoadingShop}
            >
              {shopMutation.isPending ? 'Saving...' : 'Save Shop Details'}
              <BottomGradient />
            </button>
          </form>
        </SettingsCard>
      )}
    </div>
  );
}