import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccountById, updateAccount } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useTheme } from '../contexts/ThemeContext';

export default function UpdateCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await getAccountById(id);
        const data = res.data;
        setFormData({
          full_name: data.full_name,
          phone: data.phone_number,
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
        navigate('/app/accounts');
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

    const payload = {
      full_name: formData.full_name,
      phone_number: formData.phone,
      gender: formData.gender,
      address: {
        line1: formData.line1,
        city: formData.city,
        pincode: formData.pincode,
      },
      aadhaar_number: formData.aadhaar_number,
      pan_number: formData.pan_number,
      customer_photo: formData.customer_photo_url || undefined,
    };

    try {
      await updateAccount(id, payload);
      toast.success('Customer updated successfully!');
      navigate('/app/accounts');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return <div>Loading...</div>; // You can replace this with a skeleton
  }

  return (
    <div className={`w-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Update Customer
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Edit the details for {formData.full_name}.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          {/* ... (Your form from NewCustomer.jsx goes here) ... */}
          {/* (I'm using a simplified form for brevity, you can copy yours) */}
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer className="w-full">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer className="w-full">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
            </LabelInputContainer>
          </div>
          {/* (Add all other fields: address, pan, aadhaar, etc.) */}

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-blue-600 to-blue-500 font-medium text-white"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
            <BottomGradient />
          </button>
        </form>
      </div>
    </div>
  );
}

// (You need to paste the BottomGradient and LabelInputContainer components here
// just like in your NewCustomer.jsx file)

const BottomGradient = () => ( <>...</> );
const LabelInputContainer = ({ children, className }) => ( <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div> );