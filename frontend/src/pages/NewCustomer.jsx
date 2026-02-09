import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAccount } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';

// Define the initial state for the form
const initialState = {
  full_name: '',
  phone_number: '',
  gender: 'Male',
  line1: '',
  city: '',
  pincode: '',
  aadhaar_number: '',
  pan_number: '',
  customer_photo_url: '',
};

export default function NewCustomer() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Define the mutation using TanStack Query
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await createAccount(payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(t('customers.createdSuccess'));
    
      queryClient.invalidateQueries(['customers']);
      navigate('/app/customers');
      setFormData(initialState);
    },
    onError: (error) => {
      const message = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        t('errors.failedToCreateCustomer');
        
    
      toast.error(message.replace(/"/g, ''));
    },
  });

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      gender: formData.gender,
      address: {
        line1: formData.line1,
        city: formData.city,
        pincode: formData.pincode,
      },
      aadhaar_number: formData.aadhaar_number,
      pan_number: formData.pan_number,
      customer_photo_url: formData.customer_photo_url || undefined,
    };

    mutation.mutate(payload); 
  };

  return (
    <div className="w-full">
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 ">
        <h2 className="text-xl font-bold text-neutral-800 text-neutral-200">
          {t('common.createNewCustomer')}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 text-neutral-300">
          {t('common.addCustomerDescription')}
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer className="w-full">
              <Label htmlFor="full_name">{t('forms.fullName')}</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder={t('common.placeholderFullName')}
                type="text"
                autoComplete="name"
                enterKeyHint="next"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </LabelInputContainer>

            <LabelInputContainer className="w-full">
              <Label htmlFor="phone_number">{t('forms.phoneNumber')}</Label>
              <Input
                id="phone_number"
                name="phone_number"
                placeholder={t('common.placeholderPhone')}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                enterKeyHint="next"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-6 md:mb-4">
            <Label htmlFor="gender">{t('forms.gender')}</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={cn(
                `flex min-h-[44px] w-full  rounded-md border border-neutral-300 px-3 py-2 text-sm
border-neutral-300 text-black`
              )}
            >
              <option value="Male">{t('forms.male')}</option>
              <option value="Female">{t('forms.female')}</option>
              <option value="Other">{t('forms.other')}</option>
            </select>
          </LabelInputContainer>

          <LabelInputContainer className="mb-6 md:mb-4">
            <Label htmlFor="line1">{t('forms.addressLine')}</Label>
            <Input
              id="line1"
              name="line1"
              placeholder={t('common.placeholderAddress')}
              type="text"
              autoComplete="street-address"
              enterKeyHint="next"
              value={formData.line1}
              onChange={handleChange}
            />
          </LabelInputContainer>

          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="city">{t('forms.city')}</Label>
              <Input
                id="city"
                name="city"
                placeholder={t('common.placeholderCity')}
                type="text"
                autoComplete="address-level2"
                enterKeyHint="next"
                value={formData.city}
                onChange={handleChange}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pincode">{t('forms.pincode')}</Label>
              <Input
                id="pincode"
                name="pincode"
                placeholder={t('common.placeholderPincode')}
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                enterKeyHint="next"
                value={formData.pincode}
                onChange={handleChange}
              />
            </LabelInputContainer>
          </div>

          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="aadhaar_number">{t('forms.aadhaarNumber')}</Label>
              <Input
                id="aadhaar_number"
                name="aadhaar_number"
                placeholder={t('common.placeholderAadhaar')}
                type="text"
                inputMode="numeric"
                enterKeyHint="next"
                value={formData.aadhaar_number}
                onChange={handleChange}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pan_number">{t('forms.panNumber')}</Label>
              <Input
                id="pan_number"
                name="pan_number"
                placeholder={t('common.placeholderPan')}
                type="text"
                autoComplete="off"
                enterKeyHint="next"
                value={formData.pan_number}
                onChange={handleChange}
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-8 md:mb-8">
            <FileUpload
              value={formData.customer_photo_url}
              onChange={(url) => setFormData(prev => ({ ...prev, customer_photo_url: url }))}
              label={t('forms.customerPhoto')}
            />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] bg-neutral-800 from-neutral-900 to-neutral-900 shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('buttons.saving') : t('buttons.saveCustomer')}
            <BottomGradient />
          </button>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2 w-full', className)}>
    {children}
  </div>
);
