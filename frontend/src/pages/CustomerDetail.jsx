import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountById, getPawnTicketsByAccountId, getAccountStats, updatePawnTicketStatus } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconEdit, IconCheck, IconCurrencyRupee, IconFileText } from '@tabler/icons-react';
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

// ✅ StatCard
const StatCard = ({ title, value }) => (
  <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black">
    <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
    <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{value}</p>
  </div>
);

// ✅ Skeleton
const CustomerDetailSkeleton = () => (
  <div className="p-4 md:p-6 min-h-screen animate-pulse">
    <div className="shadow-input rounded-2xl bg-white p-6 md:p-8 dark:bg-black mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-neutral-800"></div>
        <div className="flex-1 text-center md:text-left">
          <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-800 rounded-md mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-800 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-neutral-800 rounded-md"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function CustomerDetail() {
  const { id } = useParams();
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const { hasPermission } = usePermission();

  // ✅ Define queries
  const {
    data: customer,
    isLoading: customerLoading,
    isError: customerError,
  } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getAccountById(id).then(res => res.data),
    onError: () => toast.error('Failed to load customer details.'),
  });

  const {
    data: pawns,
    isLoading: pawnLoading,
    isError: pawnError,
  } = useQuery({
    queryKey: ['pawns', id],
    queryFn: () => getPawnTicketsByAccountId(id).then(res => res.data.tickets),
    onError: () => toast.error('Failed to load pawn tickets.'),
  });

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ['stats', id],
    queryFn: () => getAccountStats(id).then(res => res.data.stats),
    onError: () => toast.error('Failed to load stats.'),
  });

  // SETTLE mutation
  const settleMutation = useMutation({
    mutationFn: (ticketId) => updatePawnTicketStatus(ticketId, 'settled'),
    onSuccess: () => {
      toast.success('Ticket settled');
      queryClient.invalidateQueries(['pawns', id]);
      queryClient.invalidateQueries(['stats', id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to settle ticket')
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


  const statusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'settled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'defaulted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) return <CustomerDetailSkeleton />;
  if (error || !customer) return <div>Failed to load customer data.</div>;

  return (
    <AnimatePresence>
      <motion.div
        key="customer-detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
        className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''} pt-20 md:pt-4`}
      >
        {/* Settle Modal */}
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSettle}
          title="Settle Pawn Ticket"
          message="Are you sure this ticket is settled and the loan is closed?"
          confirmText="Yes, Settle"
        />
        {/* Customer Info */}
        <div className="shadow-input rounded-2xl bg-white p-6 md:p-8 dark:bg-black mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={customer.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${customer.full_name}`}
              alt={customer.full_name}
              className="w-32 h-32 rounded-full object-cover border-4 border-neutral-200 dark:border-neutral-700"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">{customer.full_name}</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">{customer.phone_number}</p>
              <p className="text-neutral-600 dark:text-neutral-400">
                {customer.address?.line1} {customer.address?.city}, {customer.address?.pincode}
              </p>
              <div className="mt-4">
                <Link
                  to={`/app/customer/update/${customer._id}`}
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  <IconEdit size={16} className="text-black dark:text-white" />
                  <span>Edit Customer</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
          Customer Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Loan Value (Lifetime)" value={`₹${stats?.total_loan_value?.toLocaleString('en-IN') || 0}`} />
          <StatCard title="Total Active Loan" value={`₹${stats?.total_active_loan?.toLocaleString('en-IN') || 0}`} />
          <StatCard title="Active Pawn Tickets" value={stats?.active_tickets || 0} />
        </div>

        {/* Pawn History */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            Pawn Ticket History
          </h2>
          <Link
            to="/app/pawn/add"
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-md font-medium text-neutral-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <IconPlus className="text-black dark:text-white" />
            <span>New Ticket</span>
          </Link>
        </div>

        {pawns?.length ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block shadow-input rounded-2xl bg-white dark:bg-black text-base">
              <Table>
                <TableCaption>A list of all pawn tickets for {customer.full_name}.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Item(s)</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pawns.map((pawn) => (
                    <TableRow key={pawn._id}>
                      <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">{pawn.ticket_number}</TableCell>
                      <TableCell className="text-neutral-600 dark:text-neutral-400">{pawn.items[0]?.name}{pawn.items.length > 1 && ` (+${pawn.items.length - 1})`}</TableCell>
                      <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">{`₹${pawn.loan_amount.toLocaleString('en-IN')}`}</TableCell>
                      <TableCell className="text-neutral-600 dark:text-neutral-400">{new Date(pawn.pawned_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusClass(pawn.status))}>
                          {pawn.status.charAt(0).toUpperCase() + pawn.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/app/pawn/update/${pawn._id}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <IconEdit size={16} />
                            <span>Edit</span>
                          </Link>
                          {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                            <button
                              onClick={() => openSettleModal(pawn._id)}
                              disabled={settleMutation.isLoading}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark as Settled"
                            >
                              <IconCheck size={16} />
                              <span>Settle</span>
                            </button>
                          )}
                          <Link
                            to={`/app/pawns/${pawn._id}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                          >
                            <IconCurrencyRupee size={16} />
                            <span>Payment</span>
                          </Link>
                          
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                A list of all pawn tickets for {customer.full_name}.
              </p>
              {pawns.map((pawn) => (
                <motion.div
                  key={pawn._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="shadow-input rounded-xl bg-white dark:bg-black p-4 border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">
                          {pawn.ticket_number}
                        </h3>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            statusClass(pawn.status)
                          )}
                        >
                          {pawn.status.charAt(0).toUpperCase() + pawn.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                        <p>
                          <span className="font-medium">Item:</span> {pawn.items[0]?.name}
                          {pawn.items.length > 1 && ` (+${pawn.items.length - 1} more)`}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span> {new Date(pawn.pawned_date).toLocaleDateString()}
                        </p>
                        <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mt-2">
                          ₹{pawn.loan_amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Link
                      to={`/app/pawns/update/${pawn._id}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                    >
                      <IconEdit className="w-4 h-4"/>
                      <span>Edit</span>
                    </Link>
                    {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                      <>
                        <button
                          onClick={() => openSettleModal(pawn._id)}
                          disabled={settleMutation.isLoading}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IconCheck className="w-4 h-4"/>
                          <span>Settle</span>
                        </button>
                        <Link
                          to={`/app/pawns/${pawn._id}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-sm"
                        >
                          <span>₹</span>
                          <span>Payment</span>
                        </Link>
                      </>
                    )}
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/app/pdf/notice/${pawn._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm"
                    >
                      <span>PDF</span>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-neutral-500 dark:text-neutral-400 shadow-input rounded-2xl bg-white dark:bg-black">
            This customer has no pawn tickets.
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
