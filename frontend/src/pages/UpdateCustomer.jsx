import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountById, updateAccount } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import FileUpload from '../components/FileUpload';

export default function UpdateCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(null);

  // ✅ Fetch existing customer using React Query
  const {
    data: customerData,
    isLoading: loadingCustomer,
    isError,
  } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await getAccountById(id);
      return res.data;
    },
    onError: () => {
      toast.error('Failed to load customer data');
      navigate('/app/customers');
    },
  });

  // ✅ Mutation for updating customer
  const updateMutation = useMutation({
    mutationFn: (payload) => updateAccount(id, payload),
    onSuccess: () => {
      toast.success('Customer updated successfully!');
      // Refresh cached data
      queryClient.invalidateQueries(['customers']);
      queryClient.invalidateQueries(['customer', id]);
      navigate('/app/customers');
    },
    onError: (error) => {
      const message = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Failed to update customer';
        
    
      toast.error(message.replace(/"/g, ''));
    },
  });

  // Initialize form when data is fetched
  React.useEffect(() => {
    if (customerData) {
      setFormData({
        full_name: customerData.full_name,
        phone_number: customerData.phone_number,
        gender: customerData.gender || 'Male',
        line1: customerData.address?.line1 || '',
        city: customerData.address?.city || '',
        pincode: customerData.address?.pincode || '',
        aadhaar_number: customerData.aadhaar_number || '',
        pan_number: customerData.pan_number || '',
        customer_photo_url: customerData.customer_photo_url || '',
      });
    }
  }, [customerData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData) return;

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

    updateMutation.mutate(payload);
  };

  if (loadingCustomer || !formData) {
    return (
      <div className="text-center py-20 text-neutral-500 text-neutral-400">
        Loading customer data...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load customer. <br />
        <Link to="/app/customers" className="text-blue-500 underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 bg-neutral-900">
        <h2 className="text-xl font-bold text-neutral-800 text-neutral-200">
          Update Customer
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 text-neutral-300">
          Editing details for {formData.full_name}.
        </p>

        <form className="my-8 pb-32 md:pb-0" onSubmit={handleSubmit}>
          {/* Name + Phone */}
          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer className="w-full">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                enterKeyHint="next"
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

          {/* Gender */}
          <LabelInputContainer className="mb-6 md:mb-4">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={cn(
                `flex min-h-[44px] w-full rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm
border-neutral-700 bg-neutral-800 text-neutral-200`
              )}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </LabelInputContainer>

          {/* Address */}
          <LabelInputContainer className="mb-6 md:mb-4">
            <Label htmlFor="line1">Address Line</Label>
            <Input
              id="line1"
              name="line1"
              type="text"
              autoComplete="street-address"
              enterKeyHint="next"
              value={formData.line1}
              onChange={handleChange}
            />
          </LabelInputContainer>

          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" type="text" autoComplete="address-level2" enterKeyHint="next" value={formData.city} onChange={handleChange} />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" name="pincode" type="text" inputMode="numeric" autoComplete="postal-code" enterKeyHint="next" value={formData.pincode} onChange={handleChange} />
            </LabelInputContainer>
          </div>

          {/* Aadhaar + PAN */}
          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
              <Input id="aadhaar_number" name="aadhaar_number" type="text" inputMode="numeric" enterKeyHint="next" value={formData.aadhaar_number} onChange={handleChange} />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input id="pan_number" name="pan_number" type="text" autoComplete="off" enterKeyHint="next" value={formData.pan_number} onChange={handleChange} />
            </LabelInputContainer>
          </div>

          {/* Photo */}
          <LabelInputContainer className="mb-8">
            <FileUpload
              value={formData.customer_photo_url}
              onChange={(url) => setFormData(prev => ({ ...prev, customer_photo_url: url }))}
              label="Customer Photo"
            />
          </LabelInputContainer>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <Link
              to="/app/customers"
              className="group/btn relative block min-h-[44px] w-full md:w-auto rounded-md bg-gray-100 font-medium text-neutral-700 bg-neutral-800 text-neutral-200 text-center leading-[44px] md:leading-10"
            >
              Cancel
            </Link>
            <button
              className="group/btn relative block min-h-[44px] w-full md:w-auto rounded-md bg-gradient-to-br from-indigo-600 to-indigo-500 font-medium text-white shadow-lg"
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper Components
const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2 w-full', className)}>{children}</div>
);
