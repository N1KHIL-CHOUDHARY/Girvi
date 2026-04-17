import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getPawnTicketById, getPaymentsForTicket, createPayment } from '../services/api';
import { IconArrowLeft, IconCurrencyRupee, IconCreditCardPay, IconClock } from '@tabler/icons-react';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

export default function PawnDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_for: 'interest',
    payment_date: new Date().toISOString().split('T')[0],
  });

  const { data: ticketRes, isLoading: isTicketLoading } = useQuery({
    queryKey: ['pawn', id],
    queryFn: () => getPawnTicketById(id),
    enabled: !!id,
    onError: (err) => toast.error(err.message || t('loans.failedToLoadTicket')),
  });

  const { data: paymentsRes, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => getPaymentsForTicket(id),
    enabled: !!id,
    onError: (err) => toast.error(err.message || t('loans.failedToLoadPayments')),
  });

  const ticket = ticketRes?.data;
  const payments = paymentsRes?.data || [];

  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success(t('loans.paymentRecorded'));
      queryClient.invalidateQueries(['pawn', id]);
      queryClient.invalidateQueries(['payments', id]);
      setPaymentForm((prev) => ({ ...prev, amount_paid: '', payment_for: 'interest' }));
    },
    onError: (err) => toast.error(err.message || t('loans.failedToSavePayment')),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount_paid);
    if (!amount || amount <= 0) { toast.error(t('loans.enterValidAmountShort')); return; }
    paymentMutation.mutate({ ticket_id: id, ...paymentForm, amount_paid: amount });
  };

  const statusClass = useMemo(() => {
    const s = ticket?.status || '';
    if (s === 'settled') return 'pm-badge pm-badge-settled';
    if (s === 'defaulted') return 'pm-badge pm-badge-defaulted';
    return 'pm-badge pm-badge-active';
  }, [ticket?.status]);

  return (
    <div style={{ padding: 'var(--page-py) var(--page-px)' }}>
      {/* Back link */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/app/pawns"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.875rem', color: 'var(--brand)', fontWeight: 500, textDecoration: 'none',
          }}
        >
          <IconArrowLeft size={15} />
          {t('loans.backToPawns')}
        </Link>
      </div>

      {isTicketLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {t('loans.loadingTicket')}
        </div>
      ) : !ticket ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger-text)', fontSize: '0.875rem' }}>
          {t('loans.ticketNotFound')}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <style>{`@media(min-width:1024px){.pd-grid{grid-template-columns:1fr 2fr!important}}`}</style>

          <div className="pd-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {/* ── Left column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Ticket summary */}
              <div className="pm-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {t('loans.ticketNumberLabel')}
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                      {ticket.ticket_number}
                    </p>
                  </div>
                  <span className={statusClass}>{ticket.status}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <p><span style={{ color: 'var(--text-muted)' }}>Customer: </span>{ticket.customer_id?.full_name || '—'}</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>Pawned: </span>{formatDate(ticket.pawned_date)}</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>Interest: </span>{ticket.interest_rate}%</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>Advance: </span>₹{ticket.adv_amount}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.875rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('loans.originalLoan')}
                    </p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <IconCurrencyRupee size={15} />
                      {ticket.original_loan_amount ?? ticket.loan_amount}
                    </p>
                  </div>
                  <div style={{ background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', padding: '0.875rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--success-text)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('loans.currentBalance')}
                    </p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <IconCurrencyRupee size={15} />
                      {ticket.loan_amount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="pm-card">
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>
                  {t('common.itemsLabel')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {(ticket.items || []).map((item, idx) => (
                    <div key={idx} style={{
                      border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem', fontSize: '0.875rem',
                    }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{item.weight_grams}g · {item.purity || 'N/A'} purity</p>
                    </div>
                  ))}
                  {!ticket.items?.length && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('loans.noItemsListed')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Payment form */}
              <div className="pm-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                  <IconCreditCardPay size={18} style={{ color: 'var(--brand)' }} />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t('loans.addPayment')}
                  </h3>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <style>{`@media(min-width:640px){.pay-form-grid{grid-template-columns:1fr 1fr 1fr!important}}`}</style>
                    <div className="pay-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                      <div className="pm-form-group" style={{ marginBottom: 0 }}>
                        <label className="pm-label">{t('loans.amount')}</label>
                        <input
                          type="number" min="0" step="0.01" inputMode="decimal"
                          value={paymentForm.amount_paid}
                          onChange={(e) => setPaymentForm((p) => ({ ...p, amount_paid: e.target.value }))}
                          className="pm-input"
                          placeholder={t('loans.enterAmount')}
                        />
                      </div>
                      <div className="pm-form-group" style={{ marginBottom: 0 }}>
                        <label className="pm-label">{t('loans.paymentType')}</label>
                        <select
                          value={paymentForm.payment_for}
                          onChange={(e) => setPaymentForm((p) => ({ ...p, payment_for: e.target.value }))}
                          className="pm-input pm-input-select"
                        >
                          <option value="interest">{t('loans.interest')}</option>
                          <option value="principal">{t('loans.principal')}</option>
                        </select>
                      </div>
                      <div className="pm-form-group" style={{ marginBottom: 0 }}>
                        <label className="pm-label">{t('loans.paymentDate')}</label>
                        <input
                          type="date"
                          value={paymentForm.payment_date}
                          onChange={(e) => setPaymentForm((p) => ({ ...p, payment_date: e.target.value }))}
                          className="pm-input"
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={paymentMutation.isLoading}
                        className="pm-btn pm-btn-primary pm-btn-lg"
                      >
                        {paymentMutation.isLoading ? t('buttons.saving') : t('loans.savePayment')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Payment history */}
              <div className="pm-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                  <IconClock size={18} style={{ color: 'var(--text-muted)' }} />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t('loans.paymentHistory')}
                  </h3>
                </div>

                {isPaymentsLoading ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('loans.loadingPayments')}</p>
                ) : !payments.length ? (
                  <div className="pm-empty" style={{ padding: '2rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('loans.noPaymentsYet')}</p>
                  </div>
                ) : (
                  <div className="pm-table-wrap">
                    <table className="pm-table">
                      <thead>
                        <tr>
                          <th>{t('loans.date')}</th>
                          <th>{t('loans.type')}</th>
                          <th>{t('loans.amount')}</th>
                          <th>{t('loans.user')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment._id}>
                            <td>{formatDate(payment.payment_date || payment.createdAt)}</td>
                            <td style={{ textTransform: 'capitalize' }}>{payment.payment_for}</td>
                            <td className="pm-td-primary">₹{payment.amount_paid}</td>
                            <td>{payment.created_by_user_id?.full_name || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}