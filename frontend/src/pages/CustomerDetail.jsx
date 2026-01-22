import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountById, getPawnTicketsByAccountId, getAccountStats, updatePawnTicketStatus } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconEdit, IconCheck, IconCurrencyRupee, IconFileText, IconPhone, IconMapPin, IconChevronRight, IconTicket } from '@tabler/icons-react';
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

// ✅ Enhanced StatCard for mobile
const StatCard = ({ title, value, className }) => (
  <div className={cn("shadow-sm rounded-2xl bg-white p-4 border border-gray-100", className)}>
    <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

// ✅ Enhanced Skeleton
const CustomerDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50 md:bg-white">
    <div className="p-4 md:p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl bg-gray-200"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 md:h-8 w-40 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
          </div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 h-20 shadow-sm">
            <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function CustomerDetail() {
  const { id } = useParams();
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
        return 'bg-green-100 text-green-700';
      case 'settled':
        return 'bg-blue-100 text-blue-700';
      case 'defaulted':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <CustomerDetailSkeleton />;
  if (error || !customer) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-red-600 font-semibold text-lg">Failed to load customer data</p>
        <p className="text-gray-500 text-sm mt-2">Please try again later</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white pb-6">
      <AnimatePresence>
        <motion.div
          key="customer-detail"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          className="p-4 md:p-6"
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

          {/* Customer Info - Redesigned for mobile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-start gap-4 md:gap-6">
              <img
                src={customer.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${customer.full_name}`}
                alt={customer.full_name}
                className="w-20 h-20 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-gray-100"
              />
              <div className="flex-1 w-full">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{customer.full_name}</h1>
                
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <IconPhone className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm md:text-base font-medium">{customer.phone_number}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-gray-700">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <IconMapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm md:text-base">
                      {customer.address?.line1} {customer.address?.city}, {customer.address?.pincode}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/app/customer/update/${customer._id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all active:scale-95 shadow-sm text-sm md:text-base"
                >
                  <IconEdit className="w-4 h-4" />
                  <span>Edit Customer</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Analytics - Enhanced mobile grid */}
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 px-1">
              Analytics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard 
                title="Lifetime Loans" 
                value={`₹${stats?.total_loan_value?.toLocaleString('en-IN') || 0}`}
                className="col-span-2 md:col-span-1"
              />
              <StatCard 
                title="Active Loans" 
                value={`₹${stats?.total_active_loan?.toLocaleString('en-IN') || 0}`} 
              />
              <StatCard 
                title="Active Tickets" 
                value={stats?.active_tickets || 0} 
              />
            </div>
          </div>

          {/* Pawn History - Enhanced header */}
          <div className="flex justify-between items-center mb-3 md:mb-4 px-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Pawn Tickets
            </h2>
            <Link
              to="/app/pawn/add"
              className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
            >
              <IconPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Ticket</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>

          {pawns?.length ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block shadow-input rounded-2xl bg-white text-base">
                <Table>
                  <TableCaption className="pb-1.5 text-neutral-700">
                    A list of all pawn tickets for {customer.full_name}.
                  </TableCaption>
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
                        <TableCell className="font-medium text-neutral-800">{pawn.ticket_number}</TableCell>
                        <TableCell className="text-neutral-600">
                          {pawn.items[0]?.name}{pawn.items.length > 1 && ` (+${pawn.items.length - 1})`}
                        </TableCell>
                        <TableCell className="font-medium text-neutral-800">
                          {`₹${pawn.loan_amount.toLocaleString('en-IN')}`}
                        </TableCell>
                        <TableCell className="text-neutral-600">
                          {new Date(pawn.pawned_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusClass(pawn.status))}>
                            {pawn.status.charAt(0).toUpperCase() + pawn.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/app/pawn/update/${pawn._id}`}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              <IconEdit size={16} />
                              <span>Edit</span>
                            </Link>
                            {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                              <button
                                onClick={() => openSettleModal(pawn._id)}
                                disabled={settleMutation.isLoading}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mark as Settled"
                              >
                                <IconCheck size={16} />
                                <span>Settle</span>
                              </button>
                            )}
                            <Link
                              to={`/app/pawns/${pawn._id}`}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
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

              {/* Mobile Card View - Completely Redesigned */}
              <div className="md:hidden space-y-3">
                {pawns.map((pawn, index) => (
                  <motion.div
                    key={pawn._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
                  >
                    {/* Header with Ticket Number and Status */}
                    <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <IconTicket className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Ticket Number</p>
                            <p className="font-bold text-base text-gray-900">{pawn.ticket_number}</p>
                          </div>
                        </div>
                        <span className={cn('px-3 py-1.5 text-xs font-semibold rounded-full', statusClass(pawn.status))}>
                          {pawn.status.charAt(0).toUpperCase() + pawn.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-3">
                      {/* Item Details */}
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <IconFileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium mb-0.5">Items</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {pawn.items[0]?.name}
                            {pawn.items.length > 1 && (
                              <span className="text-gray-500 font-normal ml-1">
                                +{pawn.items.length - 1} more
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Amount and Date */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                          <p className="text-xs text-emerald-600 font-medium mb-1">Loan Amount</p>
                          <p className="text-lg font-bold text-emerald-700">
                            ₹{pawn.loan_amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <p className="text-xs text-blue-600 font-medium mb-1">Date</p>
                          <p className="text-sm font-semibold text-blue-700">
                            {new Date(pawn.pawned_date).toLocaleDateString('en-IN', { 
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Link
                          to={`/app/pawn/update/${pawn._id}`}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 font-semibold text-sm shadow-sm"
                        >
                          <IconEdit className="w-4 h-4" />
                          <span>Edit</span>
                        </Link>
                        
                        {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                          <button
                            onClick={() => openSettleModal(pawn._id)}
                            disabled={settleMutation.isLoading}
                            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-sm"
                          >
                            <IconCheck className="w-4 h-4" />
                            <span>Settle</span>
                          </button>
                        )}
                      </div>

                      {/* Payment Link */}
                      <Link
                        to={`/app/pawns/${pawn._id}`}
                        className="block w-full py-2.5 text-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-semibold text-sm border border-emerald-200"
                      >
                        View Payments & Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <IconTicket className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-semibold text-lg mb-1">No pawn tickets yet</p>
              <p className="text-gray-500 text-sm mb-6">Create the first pawn ticket for this customer</p>
              <Link
                to="/app/pawn/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-95 font-semibold shadow-sm"
              >
                <IconPlus className="w-5 h-5" />
                Create Pawn Ticket
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}