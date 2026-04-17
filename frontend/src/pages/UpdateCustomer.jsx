import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountById, updateAccount } from '../services/api';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import FileUpload from '../components/FileUpload';

export default function UpdateCustomer() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(null);

  const { data: customerData, isLoading, isError } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => (await getAccountById(id)).data,
    onError: () => { toast.error(t('errors.failedToLoadCustomer')); navigate('/app/customers'); },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateAccount(id, payload),
    onSuccess: () => {
      toast.success(t('customers.updatedSuccess'));
      queryClient.invalidateQueries(['customers']);
      queryClient.invalidateQueries(['customer', id]);
      navigate('/app/customers');
    },
    onError: (error) => {
      const message = error.response?.data?.error || error.response?.data?.message || t('errors.failedToUpdateCustomer');
      toast.error(message.replace(/"/g, ''));
    },
  });

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

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData) return;
    updateMutation.mutate({
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      gender: formData.gender,
      address: { line1: formData.line1, city: formData.city, pincode: formData.pincode },
      aadhaar_number: formData.aadhaar_number,
      pan_number: formData.pan_number,
      customer_photo_url: formData.customer_photo_url || undefined,
    });
  };

  if (isLoading || !formData) {
    return (
      <div style={{ padding: 'var(--page-py) var(--page-px)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', paddingTop: '4rem' }}>{t('common.loadingCustomerData')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 'var(--page-py) var(--page-px)', textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--danger-text)', fontSize: '0.875rem', marginBottom: '1rem' }}>{t('common.failedToLoadCustomer')}</p>
        <Link to="/app/customers" className="pm-btn pm-btn-secondary">{t('buttons.goBack')}</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--page-py) var(--page-px)', maxWidth: '40rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="pm-section-title">{t('common.updateCustomer')}</h1>
        <p className="pm-section-subtitle">{t('common.editingDetailsFor', { name: formData.full_name })}</p>
      </div>

      <div className="pm-form-section">
        <form onSubmit={handleSubmit}>

          {/* Name + Phone */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="full_name" className="pm-label">{t('forms.fullName')} *</Label>
              <Input id="full_name" name="full_name" type="text" className="pm-input"
                autoComplete="name" enterKeyHint="next" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="phone_number" className="pm-label">{t('forms.phoneNumber')} *</Label>
              <Input id="phone_number" name="phone_number" type="tel" inputMode="numeric" className="pm-input"
                autoComplete="tel" enterKeyHint="next" value={formData.phone_number} onChange={handleChange} required />
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

          {/* Address */}
          <div className="pm-form-group">
            <Label htmlFor="line1" className="pm-label">{t('forms.addressLine')}</Label>
            <Input id="line1" name="line1" type="text" className="pm-input"
              autoComplete="street-address" enterKeyHint="next" value={formData.line1} onChange={handleChange} />
          </div>

          {/* City + Pincode */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="city" className="pm-label">{t('forms.city')}</Label>
              <Input id="city" name="city" type="text" className="pm-input"
                autoComplete="address-level2" enterKeyHint="next" value={formData.city} onChange={handleChange} />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="pincode" className="pm-label">{t('forms.pincode')}</Label>
              <Input id="pincode" name="pincode" type="text" inputMode="numeric" className="pm-input"
                autoComplete="postal-code" enterKeyHint="next" value={formData.pincode} onChange={handleChange} />
            </div>
          </div>

          {/* Aadhaar + PAN */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="aadhaar_number" className="pm-label">{t('forms.aadhaarNumber')}</Label>
              <Input id="aadhaar_number" name="aadhaar_number" type="text" inputMode="numeric" className="pm-input"
                enterKeyHint="next" value={formData.aadhaar_number} onChange={handleChange} />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="pan_number" className="pm-label">{t('forms.panNumber')}</Label>
              <Input id="pan_number" name="pan_number" type="text" className="pm-input"
                autoComplete="off" enterKeyHint="next" value={formData.pan_number} onChange={handleChange} />
            </div>
          </div>

          {/* Photo */}
          <div className="pm-form-group" style={{ marginBottom: '1.75rem' }}>
            <FileUpload
              value={formData.customer_photo_url}
              onChange={(url) => setFormData((p) => ({ ...p, customer_photo_url: url }))}
              label={t('forms.customerPhoto')}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/app/customers" className="pm-btn pm-btn-secondary pm-btn-lg" style={{ flex: 1 }}>
              {t('buttons.cancel')}
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="pm-btn pm-btn-primary pm-btn-lg"
              style={{ flex: 1 }}
            >
              {updateMutation.isPending ? t('buttons.saving') : t('buttons.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}