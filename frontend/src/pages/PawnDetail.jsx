import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getPawnTicketById, getPaymentsForTicket, createPayment } from '../services/api';
import { IconArrowLeft, IconCurrencyRupee, IconCreditCardPay, IconClock, IconTicket, IconCalendar, IconUser, IconBoxSeam } from '@tabler/icons-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
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

  const {
    data: ticketRes,
    isLoading: isTicketLoading,
  } = useQuery({
    queryKey: ['pawn', id],
    queryFn: () => getPawnTicketById(id),
    enabled: !!id,
    onError: (err) => toast.error(err.message || t('loans.failedToLoadTicket')),
  });

  const {
    data: paymentsRes,
    isLoading: isPaymentsLoading,
  } = useQuery({
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
      setPaymentForm((prev) => ({
        ...prev,
        amount_paid: '',
        payment_for: 'interest',
      }));
    },
    onError: (err) => toast.error(err.message || t('loans.failedToSavePayment')),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount_paid);
    if (!amount || amount <= 0) {
      toast.error(t('loans.enterValidAmountShort'));
      return;
    }

    paymentMutation.mutate({
      ticket_id: id,
      amount_paid: amount,
      payment_for: paymentForm.payment_for,
      payment_date: paymentForm.payment_date,
    });
  };

  const statusClass = (status) =>
    ({
      active: "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      settled: "bg-zinc-100 text-zinc-600 border-zinc-200/60 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10",
      defaulted: "bg-rose-50/80 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
    }[status] || "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-white/5 dark:text-zinc-400");

  const Skeleton = () => (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 md:p-8 font-sans max-w-7xl mx-auto space-y-6">
      <div className="h-8 w-32 bg-zinc-200 dark:bg-white/5 rounded-lg animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="h-80 bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] animate-pulse"></div>
          <div className="h-48 bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] animate-pulse"></div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] animate-pulse"></div>
          <div className="h-96 bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  if (isTicketLoading) return <Skeleton />;

  if (!ticket) return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="text-center bg-white dark:bg-[#121212] p-8 rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05]">
        <p className="text-rose-600 dark:text-rose-400 font-medium text-lg">{t('loans.ticketNotFound')}</p>
        <Link to="/app/pawns" className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
          <IconArrowLeft className="h-4 w-4" /> {t('loans.backToPawns')}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <Link to="/app/pawns" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 transition-all">
            <IconArrowLeft className="h-4 w-4" /> {t('loans.backToPawns')}
          </Link>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Ticket Details & Items */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Ticket Overview Card */}
              <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-[#121212] border border-zinc-200/60 dark:border-white/[0.05] p-6 sm:p-8 shadow-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
                
                <div className="relative z-10 flex items-start justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05] flex items-center justify-center">
                      <IconTicket className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">{t('loans.ticketNumberLabel')}</p>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-white leading-none">{ticket.ticket_number}</p>
                    </div>
                  </div>
                  <span className={cn('px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-lg border shrink-0', statusClass(ticket.status))}>
                    {ticket.status}
                  </span>
                </div>

                <div className="relative z-10 space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.02]">
                    <IconUser className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Customer</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate">{ticket.customer_id?.full_name || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.02]">
                    <IconCalendar className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Pawned Date</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{formatDate(ticket.pawned_date)}</p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.02] p-4 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">{t('loans.originalLoan')}</span>
                    <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">₹{ticket.original_loan_amount ?? ticket.loan_amount}</span>
                  </div>
                  <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 p-4 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-600/70 dark:text-emerald-500/70 mb-2">{t('loans.currentBalance')}</span>
                    <span className="text-xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">₹{ticket.loan_amount}</span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-4 px-2">
                   <p className="text-xs text-zinc-500 dark:text-zinc-400"><span className="font-medium text-zinc-900 dark:text-zinc-300">{ticket.interest_rate}%</span> Interest Rate</p>
                   <p className="text-xs text-zinc-500 dark:text-zinc-400"><span className="font-medium text-zinc-900 dark:text-zinc-300">₹{ticket.adv_amount}</span> Advance</p>
                </div>
              </div>

              {/* Items Card */}
              <div className="rounded-[2rem] bg-white dark:bg-[#121212] border border-zinc-200/60 dark:border-white/[0.05] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-white/5 flex items-center justify-center">
                    <IconBoxSeam className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white">{t('common.itemsLabel')}</h3>
                </div>
                
                <div className="space-y-3">
                  {(ticket.items || []).map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-zinc-100 dark:border-white/[0.05] bg-zinc-50 dark:bg-white/[0.02] p-4">
                      <p className="font-medium text-zinc-900 dark:text-zinc-200 mb-1">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        <span>{item.weight_grams}g</span>
                        {item.purity && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span>{item.purity} Purity</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {!ticket.items?.length && (
                    <div className="text-center py-6 text-sm text-zinc-500">
                      {t('loans.noItemsListed')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Payments */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Add Payment Form */}
              {ticket.status === 'active' && (
                <div className="rounded-[2rem] bg-white dark:bg-[#121212] border border-zinc-200/60 dark:border-white/[0.05] p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <IconCreditCardPay className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">{t('loans.addPayment')}</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col space-y-2.5">
                      <label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.amount')}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          enterKeyHint="next"
                          value={paymentForm.amount_paid}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount_paid: e.target.value }))}
                          className="w-full min-h-[48px] pl-8 pr-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:outline-none transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2.5">
                      <label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.paymentType')}</label>
                      <select
                        value={paymentForm.payment_for}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_for: e.target.value }))}
                        className="w-full min-h-[48px] px-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="interest">{t('loans.interest')}</option>
                        <option value="principal">{t('loans.principal')}</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-2.5">
                      <label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('loans.paymentDate')}</label>
                      <input
                        type="date"
                        enterKeyHint="done"
                        value={paymentForm.payment_date}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                        className="w-full min-h-[48px] px-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:outline-none transition-all"
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end mt-2 border-t border-zinc-100 dark:border-white/[0.05] pt-6">
                      <button
                        type="submit"
                        disabled={paymentMutation.isPending}
                        className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white px-8 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 shadow-sm"
                      >
                        {paymentMutation.isPending ? t('buttons.saving') : t('loans.savePayment')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment History */}
              <div className="rounded-[2rem] bg-white dark:bg-[#121212] border border-zinc-200/60 dark:border-white/[0.05] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center">
                    <IconClock className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">{t('loans.paymentHistory')}</h3>
                </div>

                {isPaymentsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-50 dark:bg-white/[0.02] rounded-xl" />)}
                  </div>
                ) : !payments.length ? (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-100 dark:border-white/[0.05] rounded-[1.5rem]">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('loans.noPaymentsYet')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-zinc-200/60 dark:border-white/[0.05]">
                          <th className="py-4 font-mono text-[11px] uppercase tracking-widest text-zinc-500 font-normal">Date</th>
                          <th className="py-4 font-mono text-[11px] uppercase tracking-widest text-zinc-500 font-normal">Type</th>
                          <th className="py-4 font-mono text-[11px] uppercase tracking-widest text-zinc-500 font-normal">Amount</th>
                          <th className="py-4 font-mono text-[11px] uppercase tracking-widest text-zinc-500 font-normal">Collected By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                        {payments.map((payment) => (
                          <tr key={payment._id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 font-mono text-zinc-600 dark:text-zinc-400">{formatDate(payment.payment_date || payment.createdAt)}</td>
                            <td className="py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 dark:bg-white/5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 capitalize">
                                {payment.payment_for}
                              </span>
                            </td>
                            <td className="py-4 font-medium text-zinc-900 dark:text-white">₹{payment.amount_paid.toLocaleString('en-IN')}</td>
                            <td className="py-4 text-zinc-600 dark:text-zinc-400">{payment.created_by_user_id?.full_name || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}