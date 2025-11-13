import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAccount } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useTheme } from '../contexts/ThemeContext';
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
  const [formData, setFormData] = useState(initialState);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Define the mutation using TanStack Query
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await createAccount(payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Customer created successfully!');
      // 🔁 Refresh customer list if it exists in cache
      queryClient.invalidateQueries(['customers']);
      navigate('/app/customers');
      setFormData(initialState);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create customer');
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

    mutation.mutate(payload); // 🚀 triggers the POST request
  };

  return (
    <div className={`w-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Create New Customer
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Add a new customer to your shop's records.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer className="w-full">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Jane Smith"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </LabelInputContainer>

            <LabelInputContainer className="w-full">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                placeholder="9876543210"
                type="number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={cn(
                `flex h-10 w-full rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm
                 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200`
              )}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="line1">Address Line</Label>
            <Input
              id="line1"
              name="line1"
              placeholder="123 Main St"
              type="text"
              value={formData.line1}
              onChange={handleChange}
            />
          </LabelInputContainer>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="Chennai"
                type="text"
                value={formData.city}
                onChange={handleChange}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                placeholder="600001"
                type="text"
                value={formData.pincode}
                onChange={handleChange}
              />
            </LabelInputContainer>
          </div>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
              <Input
                id="aadhaar_number"
                name="aadhaar_number"
                placeholder="XXXX XXXX XXXX"
                type="text"
                value={formData.aadhaar_number}
                onChange={handleChange}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                name="pan_number"
                placeholder="ABCDE1234F"
                type="text"
                value={formData.pan_number}
                onChange={handleChange}
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-8">
            <FileUpload
              value={formData.customer_photo_url}
              onChange={(url) => setFormData(prev => ({ ...prev, customer_photo_url: url }))}
              label="Customer Photo"
            />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save Customer'}
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
