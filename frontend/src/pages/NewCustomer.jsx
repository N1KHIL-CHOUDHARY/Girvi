import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAccount } from '../services/api';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';

const initialState = {
  full_name: '', phone_number: '', gender: 'Male',
  line1: '', city: '', pincode: '',
  aadhaar_number: '', pan_number: '', customer_photo_url: '',
};

export default function NewCustomer() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async payload => (await createAccount(payload)).data,
    onSuccess: () => {
      toast.success(t('customers.createdSuccess'));
      queryClient.invalidateQueries(['customers']);
      navigate('/app/customers');
      setFormData(initialState);
    },
    onError: error => {
      const message = error.response?.data?.error || error.response?.data?.message || t('errors.failedToCreateCustomer');
      toast.error(message.replace(/"/g, ''));
    },
  });

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate({
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      gender: formData.gender,
      address: { line1: formData.line1, city: formData.city, pincode: formData.pincode },
      aadhaar_number: formData.aadhaar_number,
      pan_number: formData.pan_number,
      customer_photo_url: formData.customer_photo_url || undefined,
    });
  };

  return (
    <div style={{ padding: 'var(--page-py) var(--page-px)', maxWidth: '40rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="pm-section-title">{t('common.createNewCustomer')}</h1>
        <p className="pm-section-subtitle">{t('common.addCustomerDescription')}</p>
      </div>

      <div className="pm-form-section">
        <form onSubmit={handleSubmit}>

          {/* Name + Phone */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="full_name" className="pm-label">{t('forms.fullName')} *</Label>
              <Input id="full_name" name="full_name" type="text" className="pm-input"
                placeholder={t('common.placeholderFullName')} autoComplete="name" enterKeyHint="next"
                value={formData.full_name} onChange={handleChange} required />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="phone_number" className="pm-label">{t('forms.phoneNumber')} *</Label>
              <Input id="phone_number" name="phone_number" type="tel" inputMode="numeric" className="pm-input"
                placeholder={t('common.placeholderPhone')} autoComplete="tel" enterKeyHint="next"
                value={formData.phone_number} onChange={handleChange} required />
            </div>
          </div>

          {/* Gender */}
          <div className="pm-form-group">
            <Label htmlFor="gender" className="pm-label">{t('forms.gender')}</Label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange}
              className="pm-input pm-input-select">
              <option value="Male">{t('forms.male')}</option>
              <option value="Female">{t('forms.female')}</option>
              <option value="Other">{t('forms.other')}</option>
            </select>
          </div>

          {/* Address line */}
          <div className="pm-form-group">
            <Label htmlFor="line1" className="pm-label">{t('forms.addressLine')}</Label>
            <Input id="line1" name="line1" type="text" className="pm-input"
              placeholder={t('common.placeholderAddress')} autoComplete="street-address" enterKeyHint="next"
              value={formData.line1} onChange={handleChange} />
          </div>

          {/* City + Pincode */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="city" className="pm-label">{t('forms.city')}</Label>
              <Input id="city" name="city" type="text" className="pm-input"
                placeholder={t('common.placeholderCity')} autoComplete="address-level2" enterKeyHint="next"
                value={formData.city} onChange={handleChange} />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="pincode" className="pm-label">{t('forms.pincode')}</Label>
              <Input id="pincode" name="pincode" type="text" inputMode="numeric" className="pm-input"
                placeholder={t('common.placeholderPincode')} autoComplete="postal-code" enterKeyHint="next"
                value={formData.pincode} onChange={handleChange} />
            </div>
          </div>

          {/* Aadhaar + PAN */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="aadhaar_number" className="pm-label">{t('forms.aadhaarNumber')}</Label>
              <Input id="aadhaar_number" name="aadhaar_number" type="text" inputMode="numeric" className="pm-input"
                placeholder={t('common.placeholderAadhaar')} enterKeyHint="next"
                value={formData.aadhaar_number} onChange={handleChange} />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="pan_number" className="pm-label">{t('forms.panNumber')}</Label>
              <Input id="pan_number" name="pan_number" type="text" className="pm-input"
                placeholder={t('common.placeholderPan')} autoComplete="off" enterKeyHint="next"
                value={formData.pan_number} onChange={handleChange} />
            </div>
          </div>

          {/* Photo upload */}
          <div className="pm-form-group" style={{ marginBottom: '1.75rem' }}>
            <FileUpload
              value={formData.customer_photo_url}
              onChange={url => setFormData(prev => ({ ...prev, customer_photo_url: url }))}
              label={t('forms.customerPhoto')}
            />
          </div>

          <button type="submit" disabled={mutation.isPending}
            className="pm-btn pm-btn-primary pm-btn-full pm-btn-lg">
            {mutation.isPending ? t('buttons.saving') : t('buttons.saveCustomer')}
          </button>
        </form>
      </div>
    </div>
  );
}