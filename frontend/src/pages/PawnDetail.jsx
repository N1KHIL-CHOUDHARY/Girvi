import { useState, useMemo } from 'react';
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
    onError: (err) => toast.error(err.message || 'Failed to load ticket'),
  });

  const {
    data: paymentsRes,
    isLoading: isPaymentsLoading,
  } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => getPaymentsForTicket(id),
    enabled: !!id,
    onError: (err) => toast.error(err.message || 'Failed to load payments'),
  });

  const ticket = ticketRes?.data;
  const payments = paymentsRes?.data || [];

  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success('Payment recorded');
      queryClient.invalidateQueries(['pawn', id]);
      queryClient.invalidateQueries(['payments', id]);
      setPaymentForm((prev) => ({
        ...prev,
        amount_paid: '',
        payment_for: 'interest',
      }));
    },
    onError: (err) => toast.error(err.message || 'Failed to save payment'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount_paid);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    paymentMutation.mutate({
      ticket_id: id,
      amount_paid: amount,
      payment_for: paymentForm.payment_for,
      payment_date: paymentForm.payment_date,
    });
  };

  const statusBadge = useMemo(() => {
    const status = ticket?.status || '';
    const base = 'px-3 py-1 rounded-full text-xs font-semibold';
    if (status === 'settled') return `${base} bg-blue-100 text-blue-800`;
    if (status === 'defaulted') return `${base} bg-red-100 text-red-800`;
    return `${base} bg-green-100 text-green-800`;
  }, [ticket?.status]);

  return (
    <div className="min-h-screen">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/app/pawns" className="inline-flex items-center text-sm text-blue-600 hover:underline">
          <IconArrowLeft className="h-4 w-4 mr-1" /> Back to Pawns
        </Link>
      </div>

      {isTicketLoading ? (
        <div className="text-sm text-neutral-500">Loading ticket...</div>
      ) : !ticket ? (
        <div className="text-sm text-red-600">Ticket not found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: Ticket info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-neutral-500">Ticket</p>
                  <p className="text-lg font-semibold text-neutral-900 ">{ticket.ticket_number}</p>
                </div>
                <span className={statusBadge}>{ticket.status}</span>
              </div>
              <div className="space-y-2 text-sm text-neutral-700 ">
                <p><span className="text-neutral-500">Customer:</span> {ticket.customer_id?.full_name || 'Unknown'}</p>
                <p><span className="text-neutral-500">Pawned Date:</span> {formatDate(ticket.pawned_date)}</p>
                <p><span className="text-neutral-500">Interest Rate:</span> {ticket.interest_rate}%</p>
                <p><span className="text-neutral-500">Advance:</span> ₹{ticket.adv_amount}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Original Loan</p>
                  <p className="text-lg font-semibold text-neutral-900 flex flex-row items-center gap-1">
                    <IconCurrencyRupee className="h-4 w-4" /> {ticket.original_loan_amount ?? ticket.loan_amount}
                  </p>
                </div>
                <div className="rounded-xl bg-green-100 p-3">
                  <p className="text-xs text-neutral-500">Current Balance</p>
                  <p className="text-lg font-semibold text-green-800 flex items-center gap-1">
                    <IconCurrencyRupee className="h-4 w-4" /> {ticket.loan_amount}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm  ">
              <p className="text-sm font-semibold text-neutral-900 mb-2">Items</p>
              <div className="space-y-3">
                {(ticket.items || []).map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-neutral-200 p-3 text-sm ">
                    <p className="font-semibold text-neutral-900 ">{item.name}</p>
                    <p className="text-neutral-600 ">{item.type}</p>
                    <p className="text-neutral-600">{item.weight_grams} g · {item.purity || 'N/A'} purity</p>
                  </div>
                ))}
                {!ticket.items?.length && (
                  <p className="text-sm text-neutral-500">No items listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Payment form and history */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <IconCreditCardPay className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-neutral-900 ">Add Payment</h3>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    enterKeyHint="next"
                    value={paymentForm.amount_paid}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount_paid: e.target.value }))}
                    className="w-full min-h-[44px] rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 "
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">Payment Type</label>
                  <select
                    value={paymentForm.payment_for}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_for: e.target.value }))}
                    className="w-full min-h-[44px] rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 "
                  >
                    <option value="interest">Interest</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">Payment Date</label>
                  <input
                    type="date"
                    enterKeyHint="done"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                    className="w-full min-h-[44px] rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 "
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={paymentMutation.isLoading}
                    className="inline-flex items-center min-h-[44px] rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {paymentMutation.isLoading ? 'Saving...' : 'Save Payment'}
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm border-neutral-800 bg-neutral-900">
              <div className="flex items-center gap-2 mb-4">
                <IconClock className="h-5 w-5 text-neutral-500" />
                <h3 className="text-base font-semibold text-neutral-900 text-neutral-100">Payment History</h3>
              </div>
              {isPaymentsLoading ? (
                <p className="text-sm text-neutral-500">Loading payments...</p>
              ) : !payments.length ? (
                <p className="text-sm text-neutral-500">No payments yet.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-neutral-500 border-b border-neutral-200 border-neutral-800">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id} className="border-b border-neutral-100 border-neutral-800">
                          <td className="py-2 pr-4">{formatDate(payment.payment_date || payment.createdAt)}</td>
                          <td className="py-2 pr-4 capitalize">{payment.payment_for}</td>
                          <td className="py-2 pr-4">₹{payment.amount_paid}</td>
                          <td className="py-2 pr-4">{payment.created_by_user_id?.full_name || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

