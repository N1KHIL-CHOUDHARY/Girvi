// React Query version of AllPawns.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getPawnTickets,
  deletePawnTicket,
  updatePawnTicketStatus,
  createPayment
} from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
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
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount_paid: "", payment_for: "interest" });

  const { isDarkMode } = useTheme();
  const { hasPermission } = usePermission();

  // Fetch pawns with React Query
  const {
    data,
    isLoading,
    isFetching
  } = useQuery({
    queryKey: ["pawns", page, search, status],
    queryFn: () => getPawnTickets(page, search, status),
    keepPreviousData: true
  });

  const pawns = data?.data?.tickets || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalPawnTickets = data?.data?.totalPawnTickets || 0;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePawnTicket,
    onSuccess: () => {
      toast.success("Pawn ticket deleted");
      queryClient.invalidateQueries(["pawns"]);
    },
    onError: () => toast.error("Failed to delete ticket")
  });

  // Settle mutation
  const settleMutation = useMutation({
    mutationFn: (id) => updatePawnTicketStatus(id, "settled"),
    onSuccess: () => {
      toast.success("Ticket settled");
      queryClient.invalidateQueries(["pawns"]);
    },
    onError: () => toast.error("Failed to settle ticket")
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success("Payment recorded");
      queryClient.invalidateQueries(["pawns"]);
      setIsPaymentOpen(false);
    },
    onError: () => toast.error("Failed to save payment")
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

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? "dark" : ""}`}>
      {/* Settle Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSettle}
        title="Settle Pawn Ticket"
        message="Are you sure this ticket is settled?"
        confirmText="Yes, Settle"
      />

      {/* Payment Modal */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold mb-4">Add Payment</h3>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount"
                value={paymentForm.amount_paid}
                onChange={(e) => setPaymentForm((p) => ({ ...p, amount_paid: e.target.value }))}
                className="w-full h-10 rounded-md border px-3 py-2"
              />

              <select
                value={paymentForm.payment_for}
                onChange={(e) => setPaymentForm((p) => ({ ...p, payment_for: e.target.value }))}
                className="w-full h-10 rounded-md border px-3 py-2"
              >
                <option value="interest">Interest</option>
                <option value="principal">Principal</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setIsPaymentOpen(false)} className="h-10 px-4">
                Cancel
              </button>
              <button onClick={handleCreatePayment} className="h-10 px-4 bg-indigo-600 text-white">
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Pawn Tickets</h1>

        <div className="flex w-full sm:w-auto gap-2">
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full md:w-64"
          />

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="border rounded-md h-10 px-3"
          >
            <option value="active">Active</option>
            <option value="settled">Settled</option>
            <option value="defaulted">Defaulted</option>
            <option value="all">All</option>
          </select>

          {hasPermission("can_create_tickets") && (
            <Link to="/app/pawn/add" className="h-10 flex items-center gap-2 px-4">
              <IconPlus /> New Ticket
            </Link>
          )}
        </div>
      </div>

      {/* Main */}
      <AnimatePresence mode="wait">
        {isLoading || isFetching ? (
          <PawnTableSkeleton />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {pawns.length === 0 ? (
              <div className="text-center py-10">No tickets found.</div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow">
                <Table>
                  <TableCaption>Showing {pawns.length} of {totalPawnTickets}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {pawns.map((pawn) => (
                      <TableRow key={pawn._id}>
                        <TableCell>{pawn.ticket_number}</TableCell>
                        <TableCell>{pawn.customer_id?.full_name}</TableCell>
                        <TableCell>{pawn.items[0]?.name}</TableCell>
                        <TableCell>₹{pawn.loan_amount}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${statusClass(pawn.status)}`}>
                            {pawn.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Link to={`/app/pawns/${pawn._id}`}>
                              <IconEye className="text-indigo-500" />
                            </Link>

                            <Link to={`/app/pawns/update/${pawn._id}`}>
                              <IconEdit className="text-blue-500" />
                            </Link>

                            <button onClick={() => deleteMutation.mutate(pawn._id)}>
                              <IconTrashFilled className="text-red-500" />
                            </button>

                            {pawn.status === "active" && (
                              <button onClick={() => openSettleModal(pawn._id)}>
                                <IconCheck className="text-green-600" />
                              </button>
                            )}

                            {pawn.status === "active" && (
                              <button onClick={() => openPaymentModal(pawn._id)}>₹</button>
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
              } text-black dark:text-white`}
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
              } text-black dark:text-white`}
            />
          </button>
        </div>
      )}
    </div>
  );
}