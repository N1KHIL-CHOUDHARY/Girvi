// FIXED React Query version of AllPawns.jsx
// Includes:
// - working pagination
// - correct goToPage()
// - proper loading state
// - cleaned logic
// - consistent API response usage
// - optimized re-fetching behavior

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getPawnTickets,
  deletePawnTicket,
  updatePawnTicketStatus,
  createPayment
} from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import { usePermission } from "../hooks/usePermission";
import toast from "react-hot-toast";

import { motion, AnimatePresence } from "motion/react";
import {
  IconCircleArrowLeftFilled,
  IconCircleArrowRightFilled,
  IconEye,
  IconTrashFilled,
  IconEdit,
  IconPlus,
  IconCheck
} from "@tabler/icons-react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";
import { Input } from "../components/ui/Input";
import PawnTableSkeleton from "../components/PawnTableSkeleton";
import ConfirmationModal from "../components/ConfirmationModal";
import { cn } from "../lib/utils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AllPawns() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount_paid: "", payment_for: "interest" });

  const { isDarkMode } = useTheme();
  const { hasPermission } = usePermission();

  // FETCH PAWN TICKETS
  const { data, isLoading } = useQuery({
    queryKey: ["pawns", page, search, status],
    queryFn: () => getPawnTickets(page, search, status),
    keepPreviousData: true,
    onError: (err) => {
      toast.error('Failed to load pawn tickets: ' + err.message);
    }
  });

  const pawns = data?.data?.tickets || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalPawnTickets = data?.data?.totalPawnTickets || 0;

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: deletePawnTicket,
    onSuccess: () => {
      toast.success("Pawn ticket deleted");
      // When a delete happens, refetch the current page
      queryClient.invalidateQueries(["pawns", page, search, status]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete ticket")
  });

  // SETTLE
  const settleMutation = useMutation({
    mutationFn: (id) => updatePawnTicketStatus(id, "settled"),
    onSuccess: () => {
      toast.success("Ticket settled");
      // Refetch all pawn queries as this might affect other views
      queryClient.invalidateQueries(["pawns"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to settle ticket")
  });

  // PAYMENT
  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success("Payment recorded");
      // Refetch all pawn queries as payments might affect ticket status/reports
      queryClient.invalidateQueries(["pawns"]);
      setIsPaymentOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to save payment")
  });

  const openSettleModal = (id) => {
    setSelectedTicketId(id);
    setIsModalOpen(true);
  };

  const handleConfirmSettle = () => {
    if (!selectedTicketId) return;
    settleMutation.mutate(selectedTicketId);
    setIsModalOpen(false);
  };

  const openDeleteModal = (id) => {
    setSelectedTicketId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedTicketId) return;
    deleteMutation.mutate(selectedTicketId);
    setIsDeleteOpen(false);
  };

  const openPaymentModal = (id) => {
    setSelectedTicketId(id);
    setPaymentForm({ amount_paid: "", payment_for: "interest" });
    setIsPaymentOpen(true);
  };

  const handleCreatePayment = () => {
    const ticket = pawns.find((p) => p._id === selectedTicketId);
    if (!ticket) return;

    const amount = Number(paymentForm.amount_paid);
    if (!amount || amount <= 0) return toast.error("Enter valid amount");

    paymentMutation.mutate({
      ticket_id: selectedTicketId,
      customer_id: ticket.customer_id?._id || ticket.customer_id,
      amount_paid: amount,
      payment_for: paymentForm.payment_for
    });
  };

  const statusClass = (status) =>
    ({
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      settled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      defaulted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200");

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? "dark" : ""} pt-20 md:pt-4`}>
      {/* Settle Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSettle}
        title="Settle Pawn Ticket"
        message="Are you sure this ticket is settled and the loan is closed?"
        confirmText="Yes, Settle"
      />
      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Pawn Ticket"
        message="This will permanently remove the pawn ticket. You can't undo this action."
        confirmText="Delete"
      />

      {/* Payment Modal (Styled to match context file) */}
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
                disabled={paymentMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayment}
                className="h-10 rounded-md px-4 bg-indigo-600 text-white disabled:opacity-60"
                disabled={paymentMutation.isLoading}
              >
                {paymentMutation.isLoading ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header (Styled to match context file) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
          Pawn Tickets
        </h1>
        <div className="flex w-full sm:w-auto gap-2">
          <Input
            type="text"
            placeholder="Search by Ticket # or Item..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full md:w-64"
          />
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className={cn(
                `flex h-10 w-full rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm
                 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                 pr-8 appearance-none`
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
              to="/app/pawn/add"
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-md font-medium whitespace-nowrap text-neutral-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <IconPlus className="text-neutral-800 dark:text-neutral-200" />
              <span>New Ticket</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
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
            key={status + page + search} // Animate when data changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {pawns.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                {search
                  ? `No ${status} tickets found matching "${search}".`
                  : `No ${status !== 'all' ? status : ''} pawn tickets found.`}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block shadow-input rounded-2xl bg-white dark:bg-black overflow-hidden">
                  <Table>
                    <TableCaption className="pb-4">
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
                      
                              {hasPermission('can_edit_tickets') && (
                                <Link
                                  to={`/app/pawns/update/${pawn._id}`}
                                  className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                  title="Edit Ticket"
                                >
                                  <IconEdit className="text-blue-500 w-5 h-5" />
                                </Link>
                              )}
                              {hasPermission('can_delete_tickets') && (
                                <button
                                  onClick={() => openDeleteModal(pawn._id)}
                                  disabled={deleteMutation.isLoading}
                                  className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                  title="Delete Ticket"
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
                                disabled={settleMutation.isLoading}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mark as Settled"
                              >
                                <IconCheck size={16} />
                                <span>Settle</span>
                              </button>
                              )}
                              {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                                <Link
                                to={`/app/pawns/${pawn._id}`}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-sm"
                              >
                                <span>₹</span>
                                <span>Payment</span>
                              </Link>
                              )}
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
                    Showing {pawns.length} of {totalPawnTickets} total tickets.
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
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                            <span className="font-medium">Customer:</span> {pawn.customer_id?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                            <span className="font-medium">Item:</span> {pawn.items[0]?.name}
                            {pawn.items.length > 1 && ` (+${pawn.items.length - 1} more)`}
                          </p>
                          <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mt-2">
                            ₹{pawn.loan_amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <Link
                          to={`/app/pawns/${pawn._id}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm"
                        >
                          <IconEye className="w-4 h-4"/>
                          <span>View</span>
                        </Link>
                        {hasPermission('can_edit_tickets') && (
                          <Link
                            to={`/app/pawns/update/${pawn._id}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                          >
                            <IconEdit className="w-4 h-4"/>
                            <span>Edit</span>
                          </Link>
                        )}
                        {hasPermission('can_delete_tickets') && (
                          <button
                            onClick={() => openDeleteModal(pawn._id)}
                            disabled={deleteMutation.isLoading}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm disabled:opacity-50"
                          >
                            <IconTrashFilled className="w-4 h-4"/>
                            <span>Delete</span>
                          </button>
                        )}
                        {hasPermission('can_view_reports') && (
                          <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/app/pdf/notice/${pawn._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm"
                          >
                            <span>PDF</span>
                          </a>
                        )}
                        {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                          <>
                            <button
                              onClick={() => openSettleModal(pawn._id)}
                              disabled={settleMutation.isLoading}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm disabled:opacity-50"
                            >
                      
                              Settle
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
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