import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountById, getPawnTicketsByAccountId, getAccountStats, updatePawnTicketStatus } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconPlus, 
  IconEdit, 
  IconCheck, 
  IconCurrencyRupee, 
  IconFileText, 
  IconPhone, 
  IconMapPin, 
  IconTicket,
  IconEye,
  IconReceipt
} from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { cn } from '../lib/utils';
import ConfirmationModal from '../components/ConfirmationModal';
import { usePermission } from '../hooks/usePermission';

// ✅ Premium Bento StatCard
const StatCard = ({ title, value, className }) => (
  <div className={cn("relative overflow-hidden shadow-sm rounded-[2rem] bg-white dark:bg-[#121212] p-6 border border-zinc-200/60 dark:border-white/[0.05]", className)}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
    <p className="relative z-10 text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">{title}</p>
    <p className="relative z-10 text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{value}</p>
  </div>
);

// ✅ Premium Bento Skeleton
const CustomerDetailSkeleton = () => (
  <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 md:p-8 max-w-7xl mx-auto">
    <div className="animate-pulse space-y-6">
      <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] p-6 md:p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-zinc-200 dark:bg-white/5"></div>
          <div className="flex-1 space-y-4 pt-2">
            <div className="h-8 w-48 bg-zinc-200 dark:bg-white/5 rounded-xl"></div>
            <div className="h-5 w-32 bg-zinc-200 dark:bg-white/5 rounded-lg"></div>
            <div className="h-5 w-64 bg-zinc-200 dark:bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] p-6 h-32"></div>
        ))}
      </div>
    </div>
  </div>
);

export default function CustomerDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const { hasPermission } = usePermission();

  const { data: customer, isLoading: customerLoading, isError: customerError } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getAccountById(id).then(res => res.data),
    onError: () => toast.error(t('errors.failedToLoadCustomerDetails')),
  });

  const { data: pawns, isLoading: pawnLoading, isError: pawnError } = useQuery({
    queryKey: ['pawns', id],
    queryFn: () => getPawnTicketsByAccountId(id).then(res => res.data.tickets),
    onError: () => toast.error(t('errors.failedToLoadPawnTickets')),
  });

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['stats', id],
    queryFn: () => getAccountStats(id).then(res => res.data.stats),
    onError: () => toast.error(t('errors.failedToLoadStats')),
  });

  const settleMutation = useMutation({
    mutationFn: (ticketId) => updatePawnTicketStatus(ticketId, 'settled'),
    onSuccess: () => {
      toast.success(t('loans.ticketSettled'));
      queryClient.invalidateQueries(['pawns', id]);
      queryClient.invalidateQueries(['stats', id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.failedToSettleTicket'))
  });

  const openSettleModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  const handleConfirmSettle = () => {
    if (!selectedTicketId) return;
    settleMutation.mutate(selectedTicketId);
    setIsModalOpen(false);
  };

  const loading = customerLoading || pawnLoading || statsLoading;
  const error = customerError || pawnError || statsError;

  const statusClass = (status) =>
    ({
      active: "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      settled: "bg-zinc-100 text-zinc-600 border-zinc-200/60 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10",
      defaulted: "bg-rose-50/80 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
    }[status] || "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-white/5 dark:text-zinc-400");

  if (loading) return <CustomerDetailSkeleton />;
  if (error || !customer) return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="text-center bg-white dark:bg-[#121212] p-8 rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05]">
        <p className="text-rose-600 dark:text-rose-400 font-medium text-lg">{t('customers.failedToLoad')}</p>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">{t('customers.tryAgainLater')}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key="customer-detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ConfirmationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleConfirmSettle}
              title={t('loans.settlePawnTicket')}
              message={t('loans.settleConfirmMessage')}
              confirmText={t('loans.yesSettle')}
            />

            {/* Premium Profile Header */}
            <div className="relative overflow-hidden bg-white dark:bg-[#121212] rounded-[2rem] shadow-sm border border-zinc-200/60 dark:border-white/[0.05] p-6 md:p-8 mb-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 md:gap-8">
                <img
                  src={customer.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${customer.full_name}`}
                  alt={customer.full_name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] object-cover ring-1 ring-zinc-200 dark:ring-white/10"
                />
                
                <div className="flex-1 w-full pt-1">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
                    {customer.full_name}
                  </h1>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6">
                    <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center justify-center w-8 h-8 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-100 dark:border-white/[0.05]">
                        <IconPhone className="w-4 h-4 text-zinc-400" />
                      </div>
                      <span className="text-sm font-mono">{customer.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center justify-center w-8 h-8 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-100 dark:border-white/[0.05]">
                        <IconMapPin className="w-4 h-4 text-zinc-400" />
                      </div>
                      <span className="text-sm">
                        {customer.address?.city || 'Location not provided'}
                        {customer.address?.pincode && `, ${customer.address.pincode}`}
                      </span>
                    </div>
                  </div>

                  {hasPermission('can_edit_customers') && (
                    <Link
                      to={`/app/customer/update/${customer._id}`}
                      className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium shadow-sm"
                    >
                      <IconEdit className="w-4 h-4" />
                      <span>{t('common.editCustomer')}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Bento Grid Analytics */}
            <div className="mb-8">
              <h2 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white mb-4 px-2">
                {t('common.analytics')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard 
                  title={t('common.lifetimeLoans')} 
                  value={`₹${stats?.total_loan_value?.toLocaleString('en-IN') || 0}`}
                  className="col-span-2 md:col-span-1"
                />
                <StatCard 
                  title={t('common.activeLoans')} 
                  value={`₹${stats?.total_active_loan?.toLocaleString('en-IN') || 0}`} 
                />
                <StatCard 
                  title={t('common.activeTickets')} 
                  value={stats?.active_tickets || 0} 
                />
              </div>
            </div>

            {/* Tickets Header */}
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">
                {t('common.pawnTicketsList')}
              </h2>
              {hasPermission("can_create_tickets") && (
                <Link
                  to="/app/pawn/add"
                  className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium shadow-sm"
                >
                  <IconPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('loans.newTicket')}</span>
                </Link>
              )}
            </div>

            {pawns?.length ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block rounded-3xl border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] overflow-hidden shadow-sm mb-10">
                  <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                      <TableRow className="border-zinc-200/60 dark:border-white/[0.06] hover:bg-transparent">
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5 pl-6">{t('loans.ticketNumber')}</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">{t('loans.items')}</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">{t('loans.loanAmount')}</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">{t('loans.dateLabel')}</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">{t('loans.status')}</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5 text-right pr-6">{t('customers.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pawns.map((pawn) => (
                        <TableRow key={pawn._id} className="border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          <TableCell className="font-medium text-zinc-900 dark:text-white pl-6 py-5">
                            {pawn.ticket_number}
                          </TableCell>
                          <TableCell className="text-zinc-600 dark:text-zinc-400 py-5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{pawn.items[0]?.name}</span>
                              {pawn.items.length > 1 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 font-medium">
                                  +{pawn.items.length - 1}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-zinc-900 dark:text-white py-5">
                            ₹{pawn.loan_amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-zinc-600 dark:text-zinc-400 py-5 font-mono text-sm">
                            {new Date(pawn.pawned_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-5">
                            <span className={cn('px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md border shrink-0', statusClass(pawn.status))}>
                              {pawn.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6 py-5">
                            {/* Always visible actions */}
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/app/pawns/${pawn._id}`}
                                title="View Details"
                                className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                              >
                                <IconEye className="w-[18px] h-[18px]" />
                              </Link>
                              {hasPermission('can_edit_tickets') && (
                                <Link
                                  to={`/app/pawn/update/${pawn._id}`}
                                  title="Edit Ticket"
                                  className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                  <IconEdit className="w-[18px] h-[18px]" />
                                </Link>
                              )}
                              {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                                <>
                                  <button
                                    onClick={() => openSettleModal(pawn._id)}
                                    disabled={settleMutation.isLoading}
                                    title="Settle"
                                    className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                                  >
                                    <IconCheck className="w-[18px] h-[18px]" />
                                  </button>
                                  <Link
                                    to={`/app/pawns/${pawn._id}`}
                                    title="Record Payment"
                                    className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                  >
                                    <IconReceipt className="w-[18px] h-[18px]" />
                                  </Link>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Bento Card View */}
                <div className="md:hidden space-y-4 mb-10">
                  {pawns.map((pawn, index) => (
                    <motion.div
                      key={pawn._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex flex-col p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] overflow-hidden shadow-sm relative"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />

                      {/* Header */}
                      <div className="relative z-10 flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05] rounded-xl shadow-sm">
                            <IconTicket className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
                              Ticket No.
                            </p>
                            <p className="font-semibold text-zinc-900 dark:text-white">{pawn.ticket_number}</p>
                          </div>
                        </div>
                        <span className={cn('px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-lg border shrink-0', statusClass(pawn.status))}>
                          {pawn.status}
                        </span>
                      </div>

                      {/* Sub-cards */}
                      <div className="relative z-10 grid grid-cols-2 gap-3 mb-6 flex-grow">
                        <div className="rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.02] p-4 flex flex-col justify-center">
                          <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                            Pledged Items
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-snug">
                              {pawn.items[0]?.name || "N/A"}
                            </span>
                            {pawn.items.length > 1 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/50 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 font-medium">
                                +{pawn.items.length - 1}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 p-4 flex flex-col justify-center">
                          <span className="text-[10px] uppercase tracking-widest text-emerald-600/70 dark:text-emerald-500/70 mb-2">
                            Loan Amount
                          </span>
                          <span className="text-xl md:text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
                            ₹{pawn.loan_amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Action Dock */}
                      <div className="relative z-10 flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-white/[0.05]">
                        <Link
                          to={`/app/pawns/${pawn._id}`}
                          className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-medium"
                        >
                          <IconEye className="w-[18px] h-[18px]" />
                          <span>View Details</span>
                        </Link>
                        
                        {hasPermission('can_edit_tickets') && (
                          <Link
                            to={`/app/pawn/update/${pawn._id}`}
                            className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
                          >
                            <IconEdit className="w-[18px] h-[18px]" />
                          </Link>
                        )}
                        
                        {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                          <button
                            onClick={() => openSettleModal(pawn._id)}
                            disabled={settleMutation.isLoading}
                            className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shrink-0"
                          >
                            <IconCheck className="w-[18px] h-[18px]" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-50 dark:bg-white/5 rounded-2xl mb-4">
                  <IconTicket className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                </div>
                <p className="text-zinc-900 dark:text-white font-medium mb-1">{t('empty.noPawnTicketsYet')}</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">{t('empty.createFirstPawnTicket')}</p>
                {hasPermission("can_create_tickets") && (
                  <Link
                    to="/app/pawn/add"
                    className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium shadow-sm"
                  >
                    <IconPlus className="w-4 h-4" />
                    {t('empty.createPawnTicket')}
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}