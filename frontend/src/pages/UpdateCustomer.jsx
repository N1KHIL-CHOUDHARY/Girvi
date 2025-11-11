import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAccountById, updateAccount } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useTheme } from '../contexts/ThemeContext';

export default function UpdateCustomer() {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null); // Start as null to show loading
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Fetch the existing customer data
    const fetchCustomer = async () => {
      try {
        const res = await getAccountById(id);
        const data = res.data;
        // Set the form state with the fetched data
        setFormData({
          full_name: data.full_name,
          phone_number: data.phone_number,
          gender: data.gender || 'Male',
          line1: data.address?.line1 || '',
          city: data.address?.city || '',
          pincode: data.address?.pincode || '',
          aadhaar_number: data.aadhaar_number || '',
          pan_number: data.pan_number || '',
          customer_photo_url: data.customer_photo_url || '',
        });
      } catch (error) {
        toast.error("Failed to load customer data");
        navigate('/app/accounts'); // Go back if customer not found
      }
    };
    fetchCustomer();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create the payload from the form state
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

    try {
      await updateAccount(id, payload); // Use the updateAccount API
      toast.success('Customer updated successfully!');
      navigate('/app/customers'); // Go back to the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  // Show loading skeleton while fetching data
  if (!formData) {
    return (
      <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
        Loading customer data...
      </div>
    );
  }

  return (
    <div className={`w-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Update Customer
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Editing details for {formData.full_name}.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer className="w-full">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer className="w-full">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input id="phone_number" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} required />
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
            <Input id="line1" name="line1" type="text" value={formData.line1} onChange={handleChange} />
          </LabelInputContainer>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" type="text" value={formData.city} onChange={handleChange} />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" name="pincode" type="text" value={formData.pincode} onChange={handleChange} />
            </LabelInputContainer>
          </div>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
              <Input id="aadhaar_number" name="aadhaar_number" type="text" value={formData.aadhaar_number} onChange={handleChange} />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input id="pan_number" name="pan_number" type="text" value={formData.pan_number} onChange={handleChange} />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-8">
            <Label htmlFor="customer_photo_url">Customer Photo URL</Label>
            <Input id="customer_photo_url" name="customer_photo_url" type="text" value={formData.customer_photo_url} onChange={handleChange} />
          </LabelInputContainer>

          <div className="flex gap-4">
            <Link
              to="/app/accounts"
              className="group/btn relative block h-10 w-full rounded-md bg-gray-100 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 text-center leading-10"
            >
              Cancel
            </Link>
            <button
              className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-indigo-600 to-indigo-500 font-medium text-white shadow-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper components (copy/pasted from your other pages)
const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>
    {children}
  </div>
);