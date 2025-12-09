import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAccountById, getPawnTicketsByAccountId, getAccountStats } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconEdit, IconEye } from '@tabler/icons-react';
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
            <div className="hidden md:block shadow-input rounded-2xl bg-white dark:bg-black">
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
                        <Link
                          to={`/app/pawns/${pawn._id}`}
                          className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 mx-auto w-fit"
                          title="View Details"
                        >
                          <IconEye className="text-indigo-500 w-5 h-5" />
                        </Link>
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
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Link
                      to={`/app/pawns/${pawn._id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm"
                    >
                      <IconEye className="w-4 h-4"/>
                      <span>View Details</span>
                    </Link>
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
