import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPawnTickets, deletePawnTicket, updatePawnTicketStatus } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import toast from 'react-hot-toast';

import { motion, AnimatePresence } from 'motion/react'; 
import {
  IconCircleArrowLeftFilled,
  IconCircleArrowRightFilled,
  IconEye,
  IconTrashFilled,
  IconEdit,
  IconPlus,
  IconCheck,
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
import { Input } from "../components/ui/Input";
import PawnTableSkeleton from "../components/PawnTableSkeleton";
import ConfirmationModal from '../components/ConfirmationModal';
import { cn } from '../lib/utils';
import { createPayment, getPaymentsForTicket } from '../services/api';

export default function AllPawns() {
  const [pawns, setPawns] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPawnTickets, setTotalPawnTickets] = useState(0);

  const [status, setStatus] = useState('active'); // This is correct

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount_paid: '', payment_for: 'interest' });
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  useEffect(() => {
    const fetchPawns = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // --- 2. FIX: Pass the 'status' to the API call ---
        const res = await getPawnTickets(page, search, status); 

        if (Array.isArray(res.data.tickets)) {
          setPawns(res.data.tickets); // This data is now pre-filtered
          setTotalPages(res.data.totalPages);
          setTotalPawnTickets(res.data.totalPawnTickets);
          setPage(res.data.currentPage);
        } else {
          toast.error('Could not find pawn data.');
          setPawns([]);
        }
      } catch (err) {
        toast.error('Failed to load pawn tickets: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPawns();
  }, [page, search, status]); // <-- 3. Add 'status' to the dependency array

  // Reset page when status or search changes
  useEffect(() => {
    setPage(1);
  }, [status, search]); // <-- Combined into one

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this ticket?')) {
      try {
        await deletePawnTicket(id);
        setPawns((prev) => prev.filter((p) => p._id !== id));
        toast.success('Pawn ticket deleted successfully.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete ticket.');
      }
    }
  };

  const openSettleModal = (id) => {
    setSelectedTicketId(id);
    setIsModalOpen(true);
  };

  const handleConfirmSettle = async () => {
    if (!selectedTicketId) return;

    try {
      await updatePawnTicketStatus(selectedTicketId, 'settled');
      toast.success('Ticket marked as settled.');
      // Update UI locally
      setPawns(pawns.map(p =>
        p._id === selectedTicketId ? { ...p, status: 'settled' } : p
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to settle ticket.');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    // setPage(1); // This is now handled by the useEffect above
  };

  const openPaymentModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setPaymentForm({ amount_paid: '', payment_for: 'interest' });
    setIsPaymentOpen(true);
  };

  const handleCreatePayment = async () => {
    if (!selectedTicketId) return;
    const ticket = pawns.find(p => p._id === selectedTicketId);
    if (!ticket) return;

    const amount = Number(paymentForm.amount_paid);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }

    try {
      setIsCreatingPayment(true);
      await createPayment({
        ticket_id: selectedTicketId,
        customer_id: ticket.customer_id?._id || ticket.customer_id,
        amount_paid: amount,
        payment_for: paymentForm.payment_for
      });
      toast.success('Payment recorded.');
      setIsPaymentOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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

  // --- 4. FIX: We no longer need 'filteredPawns' ---
  // const filteredPawns = ... (DELETE THIS)

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSettle}
        title="Settle Pawn Ticket"
        message="Are you sure this ticket is settled and the loan is closed?"
        confirmText="Yes, Settle"
      />

      {/* Add Payment Modal */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Add Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.amount_paid}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount_paid: e.target.value }))}
                  className="w-full h-10 rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">Payment For</label>
                <select
                  value={paymentForm.payment_for}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_for: e.target.value }))}
                  className="w-full h-10 rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="interest">Interest</option>
                  <option value="principal">Principal</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="h-10 rounded-md px-4 text-neutral-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                disabled={isCreatingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayment}
                className="h-10 rounded-md px-4 bg-indigo-600 text-white disabled:opacity-60"
                disabled={isCreatingPayment}
              >
                {isCreatingPayment ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
          Pawn Tickets
        </h1>
        <div className="flex w-full sm:w-auto gap-2">
          <Input
            type="text"
            placeholder="Search by Ticket # or Item..."
            value={search}
            onChange={handleSearch}
            className="w-full md:w-64"
          />
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              // --- 5. FIX: Use themed classes from Input ---
              className={cn(
                `flex h-10 w-full rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm
                 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                 pr-8 appearance-none` // pr-8 for arrow space
              )}
            >
              <option value="active">Active</option>
              <option value="settled">Settled</option>
              <option value="defaulted">Defaulted</option>
              <option value="all">All Statuses</option>
            </select>
          </div>
          {hasPermission('can_create_tickets') && (
            <Link
              to="/app/pawns/add" // <-- 6. FIX: Use 'pawns' (plural)
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-md font-medium whitespace-nowrap text-neutral-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <IconPlus className="text-neutral-800 dark:text-neutral-200" />
              <span>New Ticket</span>
            </Link>
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="shadow-input rounded-2xl bg-white p-4 dark:bg-black"
          >
            <PawnTableSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key={status} // Animate when filter changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* --- 7. FIX: Use 'pawns.length' (the direct API data) --- */}
            {pawns.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                {search
                  ? `No ${status} tickets found matching "${search}".`
                  : `No ${status !== 'all' ? status : ''} pawn tickets found.`}
              </div>
            ) : (
              <div className="shadow-input rounded-2xl bg-white dark:bg-black overflow-hidden">
                <Table>
                  <TableCaption className="pb-4">
                    {/* 8. FIX: Use 'pawns.length' */}
                    Showing {pawns.length} of {totalPawnTickets} total tickets.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Item(s)</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* --- 9. FIX: Map over 'pawns' --- */}
                    {pawns.map((pawn) => (
                      <TableRow key={pawn._id}>
                        <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">
                          {pawn.ticket_number}
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          {pawn.customer_id?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          {pawn.items[0]?.name}
                          {pawn.items.length > 1 && ` (+${pawn.items.length - 1})`}
                        </TableCell>
                        <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">
                          ₹{pawn.loan_amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              statusClass(pawn.status)
                            )}
                          >
                            {pawn.status.charAt(0).toUpperCase() + pawn.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            {/* --- 10. FIX: Add link to singular pawn detail page --- */}
                            <Link
                              to={`/app/pawns/${pawn._id}`}
                              className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                            >
                              <IconEye className="text-indigo-500 w-5 h-5" />
                            </Link>
                            {hasPermission('can_edit_tickets') && (
                              <Link
                                to={`/app/pawns/update/${pawn._id}`}
                                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                              >
                                <IconEdit className="text-blue-500 w-5 h-5" />
                              </Link>
                            )}

                            {hasPermission('can_delete_tickets') && (
                              <button
                                onClick={() => handleDelete(pawn._id)}
                                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                              >
                                <IconTrashFilled className="text-red-500 w-5 h-5" />
                              </button>
                            )}

                            {hasPermission('can_view_reports') && (
                              <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/app/pdf/notice/${pawn._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                title="Open Notice PDF"
                              >
                                PDF
                              </a>
                            )}
                            {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                              <button
                                onClick={() => openSettleModal(pawn._id)}
                                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                title="Mark as Settled"
                              >
                                <IconCheck className="text-green-600 dark:text-green-500 w-5 h-5" />
                              </button>
                            )}

                            {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                              <button
                                onClick={() => openPaymentModal(pawn._id)}
                                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                title="Add Payment"
                              >
                                ₹
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PAGINATION --- */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-md disabled:opacity-50"
          >
            <IconCircleArrowLeftFilled
              className={`h-10 w-10 ${
                page === 1
                  ? 'text-gray-400 dark:text-neutral-700'
                  : 'text-neutral-800 dark:text-neutral-200'
              }`}
            />
          </button>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-md disabled:opacity-50"
          >
            <IconCircleArrowRightFilled
              className={`h-10 w-10 ${
                page === totalPages
                  ? 'text-gray-400 dark:text-neutral-700'
                  : 'text-neutral-800 dark:text-neutral-200'
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}