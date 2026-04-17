import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPawnTicketById, updatePawnTicket } from '../services/api';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function UpdatePawn() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(null);
  const [customerName, setCustomerName] = useState('');

  const { data: pawnData, isLoading, isError } = useQuery({
    queryKey: ['pawnTicket', id],
    queryFn: async () => (await getPawnTicketById(id)).data,
    onError: () => { toast.error(t('errors.failedToLoadCustomer')); navigate('/app/pawns'); },
  });

  useEffect(() => {
    if (pawnData) {
      setCustomerName(pawnData.customer_id?.full_name || 'N/A');
      setFormData({
        customer_id: pawnData.customer_id?._id,
        ticket_number: pawnData.ticket_number,
        loan_amount: pawnData.loan_amount,
        interest_rate: pawnData.interest_rate,
        adv_amount: pawnData.adv_amount,
        pawned_date: new Date(pawnData.pawned_date).toISOString().split('T')[0],
        item_name: pawnData.items[0]?.name || '',
        item_weight: pawnData.items[0]?.weight_grams || '',
        item_purity: pawnData.items[0]?.purity || '',
        item_description: pawnData.items[0]?.description || '',
      });
    }
  }, [pawnData]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updatePawnTicket(id, payload),
    onSuccess: () => {
      toast.success(t('loans.updateSuccess'));
      queryClient.invalidateQueries(['pawnTickets']);
      queryClient.invalidateQueries(['pawnTicket', id]);
      navigate('/app/pawns');
    },
    onError: (error) => {
      const message = error.response?.data?.error || error.response?.data?.message || t('loans.updateFailed');
      toast.error(message.replace(/"/g, ''));
    },
  });

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData) return;
    updateMutation.mutate({
      customer_id: formData.customer_id,
      ticket_number: formData.ticket_number,
      loan_amount: parseFloat(formData.loan_amount),
      interest_rate: parseFloat(formData.interest_rate),
      adv_amount: parseFloat(formData.adv_amount),
      pawned_date: formData.pawned_date,
      items: [{
        name: formData.item_name,
        weight_grams: parseFloat(formData.item_weight),
        purity: parseFloat(formData.item_purity),
        description: formData.item_description,
      }],
    });
  };

  if (isLoading || !formData) {
    return (
      <div style={{ padding: 'var(--page-py) var(--page-px)', textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('common.loadingTicketData')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 'var(--page-py) var(--page-px)', textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--danger-text)', fontSize: '0.875rem', marginBottom: '1rem' }}>{t('common.failedToLoadTicket')}</p>
        <Link to="/app/pawns" className="pm-btn pm-btn-secondary">{t('buttons.goBack')}</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--page-py) var(--page-px)', maxWidth: '40rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="pm-section-title">{t('common.updatePawnTicket')}</h1>
        <p className="pm-section-subtitle">
          {t('common.editingTicketFor', { ticket: formData.ticket_number, name: customerName })}
        </p>
      </div>

      <div className="pm-form-section">
        <form onSubmit={handleSubmit}>

          {/* Customer (read-only) */}
          <div className="pm-form-group">
            <Label className="pm-label">{t('common.customerLabel')}</Label>
            <Input type="text" value={customerName} disabled className="pm-input"
              style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          </div>

          {/* Ticket + Date */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="ticket_number" className="pm-label">{t('loans.ticketNumberLabel')} *</Label>
              <Input id="ticket_number" name="ticket_number" type="text" className="pm-input"
                autoComplete="off" enterKeyHint="next" value={formData.ticket_number} onChange={handleChange} required />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="pawned_date" className="pm-label">{t('loans.pawnedDate')} *</Label>
              <Input id="pawned_date" name="pawned_date" type="date" className="pm-input"
                value={formData.pawned_date} onChange={handleChange} required />
            </div>
          </div>

          {/* Loan + Interest + Advance */}
          <div className="pm-form-row pm-form-row-3">
            <div className="pm-form-group">
              <Label htmlFor="loan_amount" className="pm-label">{t('loans.loanAmountLabel')} *</Label>
              <Input id="loan_amount" name="loan_amount" type="number" inputMode="decimal" className="pm-input"
                enterKeyHint="next" value={formData.loan_amount} onChange={handleChange} required />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="interest_rate" className="pm-label">{t('loans.interestRate')} *</Label>
              <Input id="interest_rate" name="interest_rate" type="number" inputMode="decimal" className="pm-input"
                enterKeyHint="next" value={formData.interest_rate} onChange={handleChange} required />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="adv_amount" className="pm-label">{t('loans.advanceAmount')} *</Label>
              <Input id="adv_amount" name="adv_amount" type="number" inputMode="decimal" className="pm-input"
                enterKeyHint="next" value={formData.adv_amount} onChange={handleChange} required />
            </div>
          </div>

          <div className="pm-divider" />

          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            {t('loans.itemDetails')}
          </h3>

          {/* Item name */}
          <div className="pm-form-group">
            <Label htmlFor="item_name" className="pm-label">{t('loans.itemName')} *</Label>
            <Input id="item_name" name="item_name" type="text" className="pm-input"
              autoComplete="off" enterKeyHint="next" value={formData.item_name} onChange={handleChange} required />
          </div>

          {/* Weight + Purity */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="item_weight" className="pm-label">{t('loans.weightGrams')} *</Label>
              <Input id="item_weight" name="item_weight" type="number" inputMode="decimal" className="pm-input"
                enterKeyHint="next" value={formData.item_weight} onChange={handleChange} required />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="item_purity" className="pm-label">{t('loans.purity')}</Label>
              <Input id="item_purity" name="item_purity" type="number" inputMode="numeric" className="pm-input"
                placeholder="22" enterKeyHint="next" value={formData.item_purity} onChange={handleChange} />
            </div>
          </div>

          {/* Description */}
          <div className="pm-form-group" style={{ marginBottom: '1.75rem' }}>
            <Label htmlFor="item_description" className="pm-label">{t('loans.itemDescription')}</Label>
            <Input id="item_description" name="item_description" type="text" className="pm-input"
              autoComplete="off" enterKeyHint="done" value={formData.item_description} onChange={handleChange} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/app/pawns" className="pm-btn pm-btn-secondary pm-btn-lg" style={{ flex: 1 }}>
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