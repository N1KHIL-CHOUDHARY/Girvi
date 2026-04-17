import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, createPawnTicket } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';

const initialState = {
  ticket_number: '', loan_amount: '', interest_rate: '3', adv_amount: '',
  item_name: '', item_weight: '', item_purity: '22', item_description: '',
  pawned_date: new Date().toISOString().split('T')[0],
};

export default function NewPawn() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialState);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch]   = useState('');
  const [isDropdownOpen, setIsDropdownOpen]   = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const { data: customersData, isFetching: loadingCustomers } = useQuery({
    queryKey: ['customers', customerSearch],
    queryFn: async () => (await getAccounts(1, customerSearch)).data.customers || [],
    enabled: customerSearch.trim().length > 0,
    staleTime: 60 * 1000,
    onError: () => toast.error(t('errors.failedToSearchCustomers')),
  });
  const customers = customersData || [];

  const createPawnMutation = useMutation({
    mutationFn: payload => createPawnTicket(payload),
    onSuccess: () => {
      toast.success(t('loans.createSuccess'));
      queryClient.invalidateQueries(['pawnTickets']);
      setFormData(initialState);
      setSelectedCustomer(null);
      setCustomerSearch('');
      navigate('/app/pawns');
    },
    onError: error => {
      const message = error.response?.data?.error || error.response?.data?.message || t('loans.createFailed');
      toast.error(message.replace(/"/g, ''));
    },
  });

  useEffect(() => {
    const handleOut = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, []);

  useEffect(() => {
    if (customerSearch.trim() === '') { setIsDropdownOpen(false); return; }
    const t = setTimeout(() => { if (customers.length > 0) setIsDropdownOpen(true); }, 200);
    return () => clearTimeout(t);
  }, [customerSearch, customers]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'loan_amount' || name === 'interest_rate') {
        const loan = parseFloat(name === 'loan_amount' ? value : next.loan_amount);
        const rate = parseFloat(name === 'interest_rate' ? value : next.interest_rate);
        next.adv_amount = (loan > 0 && rate > 0) ? String(Math.round((loan * rate) / 100)) : '';
      }
      return next;
    });
  };

  const handleSelectCustomer = c => { setSelectedCustomer(c); setCustomerSearch(c.full_name); setIsDropdownOpen(false); };

  const handleSubmit = e => {
    e.preventDefault();
    if (!selectedCustomer) { toast.error(t('loans.pleaseSelectCustomer')); return; }
    createPawnMutation.mutate({
      customer_id:   selectedCustomer._id,
      ticket_number: formData.ticket_number,
      loan_amount:   parseFloat(formData.loan_amount),
      interest_rate: parseFloat(formData.interest_rate),
      adv_amount:    parseFloat(formData.adv_amount),
      pawned_date:   formData.pawned_date,
      items: [{
        name: formData.item_name,
        weight_grams: parseFloat(formData.item_weight),
        purity:       parseFloat(formData.item_purity),
        description:  formData.item_description,
      }],
    });
  };

  return (
    <div style={{ padding: 'var(--page-py) var(--page-px)', maxWidth: '40rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="pm-section-title">{t('common.createNewPawnTicket')}</h1>
        <p className="pm-section-subtitle">{t('common.createPawnDescription')}</p>
      </div>

      <div className="pm-form-section">
        <form onSubmit={handleSubmit} style={{ paddingBottom: '2rem' }}>

          {/* Customer search */}
          <div className="pm-form-group" style={{ position: 'relative' }} ref={dropdownRef}>
            <Label htmlFor="customer_search" className="pm-label">{t('loans.searchCustomer')}</Label>
            <div className="pm-search-wrap">
              <svg className="pm-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <Input
                id="customer_search" type="text"
                placeholder={t('loans.searchCustomerPlaceholder')}
                value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomer(null); setIsDropdownOpen(true); }}
                required autoComplete="off" enterKeyHint="search"
                className="pm-input pm-search-input"
              />
            </div>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute', zIndex: 50, width: '100%', top: '100%', marginTop: '4px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
                maxHeight: '14rem', overflowY: 'auto',
              }}>
                {loadingCustomers ? (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {t('loans.loading')}
                  </div>
                ) : customers.length > 0 ? customers.map(c => (
                  <div key={c._id}
                    onClick={() => handleSelectCustomer(c)}
                    style={{
                      padding: '0.75rem 1rem', cursor: 'pointer',
                      borderBottom: '1px solid var(--border-default)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{c.full_name}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone_number}</p>
                  </div>
                )) : (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {t('loans.noCustomersFound')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ticket number + date */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="ticket_number" className="pm-label">{t('loans.ticketNumberLabel')}</Label>
              <Input id="ticket_number" name="ticket_number" type="text" className="pm-input"
                placeholder={t('common.placeholderTicket')} autoComplete="off" enterKeyHint="next"
                value={formData.ticket_number} onChange={handleChange} required />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="pawned_date" className="pm-label">{t('loans.pawnedDate')}</Label>
              <Input id="pawned_date" name="pawned_date" type="date" className="pm-input"
                value={formData.pawned_date} onChange={handleChange} required />
            </div>
          </div>

          {/* Loan + interest + advance */}
          <div className="pm-form-row pm-form-row-3">
            <div className="pm-form-group">
              <Label htmlFor="loan_amount" className="pm-label">{t('loans.loanAmountLabel')}</Label>
              <Input id="loan_amount" name="loan_amount" type="number" inputMode="decimal" className="pm-input"
                placeholder="0" enterKeyHint="next" value={formData.loan_amount} onChange={handleChange} required />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="interest_rate" className="pm-label">{t('loans.interestRate')}</Label>
              <Input id="interest_rate" name="interest_rate" type="number" inputMode="decimal" className="pm-input"
                placeholder="3" enterKeyHint="next" value={formData.interest_rate} onChange={handleChange} required />
            </div>
            <div className="pm-form-group">
              <Label htmlFor="adv_amount" className="pm-label">{t('loans.advanceAmount')}</Label>
              <Input id="adv_amount" name="adv_amount" type="number" inputMode="decimal" className="pm-input"
                placeholder="0" enterKeyHint="next" value={formData.adv_amount} onChange={handleChange} required />
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
              placeholder={t('common.placeholderItemName')} autoComplete="off" enterKeyHint="next"
              value={formData.item_name} onChange={handleChange} required />
          </div>

          {/* Weight + Purity */}
          <div className="pm-form-row pm-form-row-2">
            <div className="pm-form-group">
              <Label htmlFor="item_weight" className="pm-label">{t('loans.weightGrams')}</Label>
              <Input id="item_weight" name="item_weight" type="number" inputMode="decimal" className="pm-input"
                placeholder="0" enterKeyHint="next" value={formData.item_weight} onChange={handleChange} required />
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
              placeholder={t('common.placeholderItemDesc')} autoComplete="off" enterKeyHint="done"
              value={formData.item_description} onChange={handleChange} />
          </div>

          <button type="submit" disabled={createPawnMutation.isPending}
            className="pm-btn pm-btn-primary pm-btn-full pm-btn-lg">
            {createPawnMutation.isPending ? t('buttons.saving') : t('loans.savePawnTicket')}
          </button>
        </form>
      </div>
    </div>
  );
}