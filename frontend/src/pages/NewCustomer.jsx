import React, { useState } from 'react';
import { createCustomer } from '../services/api';
import toast from 'react-hot-toast';

export default function NewCustomer() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: 'Male',
    city: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      full_name: formData.full_name,
      phone: formData.phone,
      gender: formData.gender,
      address: {
        city: formData.city,
        pincode: formData.pincode,
      },
    };

    try {
      await createCustomer(payload);
      toast.success('Customer created successfully!');
      // Reset form
      setFormData({ full_name: '', phone: '', gender: 'Male', city: '', pincode: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create New Customer</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
        <label>Full Name</label>
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
        
        <label>Phone Number</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
        
        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        
        <label>City</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} />
        
        <label>Pincode</label>
        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} />
        
        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Saving...' : 'Save Customer'}
        </button>
      </form>
    </div>
  );
}