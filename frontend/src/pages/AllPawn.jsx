import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getPawnTickets, deletePawnTicket, updatePawnTicketStatus, createPayment } from '../services/api';
import { usePermission } from '../hooks/usePermission';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';
import { motion, AnimatePresence } from 'motion/react';
import {
  IconCircleArrowLeftFilled, IconCircleArrowRightFilled,
  IconEye, IconTrashFilled, IconEdit, IconPlus, IconCheck,
} from '@tabler/icons-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/Input';
import PawnTableSkeleton from '../components/PawnTableSkeleton';
import ConfirmationModal from '../components/ConfirmationModal';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

const STATUS_TABS = ['active', 'settled', 'defaulted', 'all'];

const statusBadgeClass = s => ({ active: 'pm-badge-active', settled: 'pm-badge-settled', defaulted: 'pm-badge-defaulted' }[s] || 'pm-badge-neutral');

export default function AllPawns() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage]                   = useState(1);
  const [status, setStatus]               = useState('active');
  const [selectedTicketId, setSelected]   = useState(null);
  const [isSettleOpen, setIsSettleOpen]   = useState(false);
  const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm]     = useState({ amount_paid: '', payment_for: 'interest' });
  const [searchInput, setSearchInput]     = useState('');
  const debouncedSearch                    = useDebounce(searchInput, 400);
  const { hasPermission } = usePermission();

  const { data, isLoading } = useQuery({
    queryKey: ['pawns', page, debouncedSearch, status],
    queryFn: () => getPawnTickets(page, debouncedSearch, status),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, gcTime: 5 * 60 * 1000,
    onError: err => toast.error(t('loans.failedToLoad', { message: err.message })),
  });
  const pawns          = data?.data?.tickets       || [];
  const totalPages     = data?.data?.totalPages    || 1;
  const totalPawns     = data?.data?.totalPawnTickets || 0;

  const deleteMutation = useMutation({
    mutationFn: deletePawnTicket,
    onSuccess: () => { toast.success('Pawn ticket deleted'); queryClient.invalidateQueries(['pawns']); },
    onError: err => toast.error(err.response?.data?.message || t('loans.failedToDeleteTicket')),
  });
  const settleMutation = useMutation({
    mutationFn: id => updatePawnTicketStatus(id, 'settled'),
    onSuccess: () => { toast.success('Ticket settled'); queryClient.invalidateQueries(['pawns']); },
    onError: err => toast.error(err.response?.data?.message || t('loans.failedToSettle')),
  });
  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => { toast.success(t('loans.paymentRecorded')); queryClient.invalidateQueries(['pawns']); setIsPaymentOpen(false); },
    onError: err => toast.error(err.response?.data?.message || t('loans.failedToSavePayment')),
  });

  const handleCreatePayment = () => {
    const ticket = pawns.find(p => p._id === selectedTicketId);
    if (!ticket) return;
    const amount = Number(paymentForm.amount_paid);
    if (!amount || amount <= 0) return toast.error(t('loans.enterValidAmount'));
    paymentMutation.mutate({
      ticket_id: selectedTicketId,
      customer_id: ticket.customer_id?._id || ticket.customer_id,
      amount_paid: amount, payment_for: paymentForm.payment_for,
    });
  };

  const goToPage = n => { if (n >= 1 && n <= totalPages) setPage(n); };

  return (
    <div style={{ padding: 'var(--page-py) var(--page-px)', minHeight: '100dvh' }}>

      {/* Modals */}
      <ConfirmationModal isOpen={isSettleOpen} onClose={() => setIsSettleOpen(false)}
        onConfirm={() => { settleMutation.mutate(selectedTicketId); setIsSettleOpen(false); }}
        title={t('loans.settlePawnTicket')} message={t('loans.settleConfirmMessage')} confirmText={t('loans.yesSettle')} />
      <ConfirmationModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => { deleteMutation.mutate(selectedTicketId); setIsDeleteOpen(false); }}
        title={t('loans.deletePawnTicket')} message={t('loans.deleteTicketMessage')} confirmText={t('buttons.delete')} />

      {/* Payment modal */}
      {isPaymentOpen && (
        <div className="pm-modal-overlay">
          <div className="pm-modal">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>
              {t('loans.addPayment')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="pm-label">{t('loans.amount')}</label>
                <Input type="number" min="0" step="0.01" inputMode="decimal" enterKeyHint="next"
                  className="pm-input" placeholder="0.00"
                  value={paymentForm.amount_paid}
                  onChange={e => setPaymentForm(p => ({ ...p, amount_paid: e.target.value }))} />
              </div>
              <div>
                <label className="pm-label">{t('loans.paymentFor')}</label>
                <select className="pm-input pm-input-select"
                  value={paymentForm.payment_for}
                  onChange={e => setPaymentForm(p => ({ ...p, payment_for: e.target.value }))}>
                  <option value="interest">{t('loans.interest')}</option>
                  <option value="principal">{t('loans.principal')}</option>
                  <option value="both">{t('loans.both')}</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="pm-btn pm-btn-secondary" style={{ flex: 1 }} onClick={() => setIsPaymentOpen(false)}>
                {t('buttons.cancel')}
              </button>
              <button className="pm-btn pm-btn-primary" style={{ flex: 1 }} onClick={handleCreatePayment} disabled={paymentMutation.isLoading}>
                {paymentMutation.isLoading ? t('buttons.saving') : t('loans.savePayment')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="pm-page-header">
        <div className="pm-page-header-row">
          <div>
            <h1 className="pm-section-title">{t('loans.title')}</h1>
            {!isLoading && <p className="pm-section-subtitle">{t('loans.showingOfTickets', { shown: pawns.length, total: totalPawns })}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="pm-search-wrap">
              <svg className="pm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <Input type="text" placeholder={t('loans.searchTickets')} value={searchInput}
                onChange={e => { setSearchInput(e.target.value); setPage(1); }}
                className="pm-input pm-search-input" style={{ width: '14rem' }} />
            </div>
            {hasPermission('can_create_tickets') && (
              <Link to="/app/pawn/add" className="pm-btn pm-btn-primary">
                <IconPlus size={16} /> {t('loans.newTicket')}
              </Link>
            )}
          </div>
        </div>

        {/* Status tabs */}
        <div className="pm-tabs" style={{ marginTop: '1rem', width: 'fit-content' }}>
          {STATUS_TABS.map(s => (
            <button key={s} className={`pm-tab ${status === s ? 'active' : ''}`}
              onClick={() => { setStatus(s); setPage(1); }}>
              {s === 'all' ? t('loans.allTickets') : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PawnTableSkeleton />
          </motion.div>
        ) : pawns.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="pm-empty" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('loans.noTicketsFound')}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('loans.tryChangingFilter')}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Desktop table */}
            <div className="pm-table-wrap" data-desktop-table>
              <Table className="pm-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('loans.ticketNumber')}</TableHead>
                    <TableHead>{t('loans.customer')}</TableHead>
                    <TableHead>{t('loans.itemName')}</TableHead>
                    <TableHead>{t('loans.loanAmount')}</TableHead>
                    <TableHead>{t('loans.pawnedDate')}</TableHead>
                    <TableHead>{t('loans.status')}</TableHead>
                    <TableHead style={{ textAlign: 'center' }}>{t('customers.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pawns.map(pawn => (
                    <TableRow key={pawn._id}>
                      <TableCell className="pm-td-primary">{pawn.ticket_number}</TableCell>
                      <TableCell>{pawn.customer_id?.full_name || '—'}</TableCell>
                      <TableCell>{pawn.items[0]?.name}{pawn.items.length > 1 && ` +${pawn.items.length - 1}`}</TableCell>
                      <TableCell style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{pawn.loan_amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{new Date(pawn.pawned_date).toLocaleDateString()}</TableCell>
                      <TableCell><span className={`pm-badge ${statusBadgeClass(pawn.status)}`}>{pawn.status.charAt(0).toUpperCase() + pawn.status.slice(1)}</span></TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                          <Link to={`/app/pawns/${pawn._id}`} className="pm-btn pm-btn-ghost pm-btn-sm" title={t('customers.view')}>
                            <IconEye size={14} style={{ color: 'var(--brand)' }} />
                          </Link>
                          {hasPermission('can_edit_tickets') && (
                            <Link to={`/app/pawns/update/${pawn._id}`} className="pm-btn pm-btn-ghost pm-btn-sm">
                              <IconEdit size={14} style={{ color: 'var(--info)' }} />
                            </Link>
                          )}
                          {hasPermission('can_delete_tickets') && (
                            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => { setSelected(pawn._id); setIsDeleteOpen(true); }} disabled={deleteMutation.isLoading}>
                              <IconTrashFilled size={14} style={{ color: 'var(--danger)' }} />
                            </button>
                          )}
                          {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                            <button className="pm-btn pm-btn-sm" style={{ background: 'var(--success-light)', color: 'var(--success-text)', border: 'none' }}
                              onClick={() => { setSelected(pawn._id); setIsSettleOpen(true); }} disabled={settleMutation.isLoading}>
                              <IconCheck size={14} /> {t('loans.settle')}
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} data-mobile-cards>
              {pawns.map(pawn => (
                <motion.div key={pawn._id} initial={false} animate={{ opacity: 1 }} className="pm-mobile-card">
                  <div className="pm-mobile-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{pawn.ticket_number}</p>
                        <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{pawn.customer_id?.full_name || '—'}</p>
                      </div>
                      <span className={`pm-badge ${statusBadgeClass(pawn.status)}`}>
                        {pawn.status.charAt(0).toUpperCase() + pawn.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="pm-mobile-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ padding: '0.625rem', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)' }}>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--success-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Loan</p>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--success-text)' }}>₹{pawn.loan_amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div style={{ padding: '0.625rem', background: 'var(--info-light)', borderRadius: 'var(--radius-sm)' }}>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--info-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</p>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--info-text)' }}>{new Date(pawn.pawned_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{t('loans.itemName')}:</span>{' '}
                      {pawn.items[0]?.name}{pawn.items.length > 1 && ` (+${pawn.items.length - 1})`}
                    </p>
                  </div>
                  <div className="pm-mobile-card-footer" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <Link to={`/app/pawns/${pawn._id}`} className="pm-btn pm-btn-ghost pm-btn-sm" style={{ color: 'var(--brand)' }}>
                      <IconEye size={14} /> {t('customers.view')}
                    </Link>
                    {hasPermission('can_edit_tickets') && (
                      <Link to={`/app/pawns/update/${pawn._id}`} className="pm-btn pm-btn-ghost pm-btn-sm" style={{ color: 'var(--info-text)' }}>
                        <IconEdit size={14} /> {t('customers.edit')}
                      </Link>
                    )}
                    {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                      <button className="pm-btn pm-btn-sm" style={{ background: 'var(--success-light)', color: 'var(--success-text)', border: 'none' }}
                        onClick={() => { setSelected(pawn._id); setIsSettleOpen(true); }}>
                        <IconCheck size={14} /> {t('loans.settle')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="pm-pagination">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="pm-btn pm-btn-secondary pm-btn-sm">
            <IconCircleArrowLeftFilled size={16} /> {t('customers.previous')}
          </button>
          <span>{t('customers.pageOf', { page, total: totalPages })}</span>
          <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} className="pm-btn pm-btn-secondary pm-btn-sm">
            {t('customers.next')} <IconCircleArrowRightFilled size={16} />
          </button>
        </div>
      )}
    </div>
  );
}