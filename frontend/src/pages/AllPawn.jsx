
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  getPawnTickets,
  deletePawnTicket,
  updatePawnTicketStatus,
  createPayment
} from "../services/api";
import { usePermission } from "../hooks/usePermission";
import toast from "react-hot-toast";

import {useDebounce} from '../hooks/useDebounce';

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

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export default function AllPawns() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
 
  const [status, setStatus] = useState("active");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount_paid: "", payment_for: "interest" });


  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [isFilterOpen, setIsFilterOpen] = useState(false);


  const { hasPermission } = usePermission();

  const { data, isLoading } = useQuery({
    queryKey: ["pawns", page, debouncedSearch, status],
    queryFn: () => getPawnTickets(page, debouncedSearch, status),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    onError: (err) => {
      toast.error(t('loans.failedToLoad', { message: err.message }));
    },
  });

  const pawns = data?.data?.tickets || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalPawnTickets = data?.data?.totalPawnTickets || 0;

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: deletePawnTicket,
    onSuccess: () => {
      toast.success("Pawn ticket deleted");
      queryClient.invalidateQueries(["pawns", page, searchInput, status]);
    },
    onError: (err) => toast.error(err.response?.data?.message || t("loans.failedToDeleteTicket"))
  });

  // SETTLE
  const settleMutation = useMutation({
    mutationFn: (id) => updatePawnTicketStatus(id, "settled"),
    onSuccess: () => {
      toast.success("Ticket settled");
      queryClient.invalidateQueries(["pawns"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || t("loans.failedToSettle"))
  });

  // PAYMENT
  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success(t("loans.paymentRecorded"));
      // Refetch all pawn queries as payments might affect ticket status/reports
      queryClient.invalidateQueries(["pawns"]);
      setIsPaymentOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || t("loans.failedToSavePayment"))
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
    if (!amount || amount <= 0) return toast.error(t("loans.enterValidAmount"));

    paymentMutation.mutate({
      ticket_id: selectedTicketId,
      customer_id: ticket.customer_id?._id || ticket.customer_id,
      amount_paid: amount,
      payment_for: paymentForm.payment_for
    });
  };

  const statusClass = (status) =>
    ({
      active: "bg-green-100 text-green-800",
      settled: "bg-blue-100 text-blue-800",
      defaulted: "bg-red-100 text-red-800"
    }[status] || "bg-gray-100 text-gray-800");

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="min-h-[100dvh]">
      {/* Settle Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSettle}
        title={t("loans.settlePawnTicket")}
        message={t("loans.settleConfirmMessage")}
        confirmText={t("loans.yesSettle")}
      />
      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("loans.deletePawnTicket")}
        message={t("loans.deleteTicketMessage")}
        confirmText={t("buttons.delete")}
      />

      {/* Payment Modal (Styled to match context file) */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto scroll-contain rounded-t-2xl md:rounded-2xl bg-white p-6 pb-32 md:pb-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">{t("loans.addPayment")}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-neutral-700 mb-1">{t("loans.amount")}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  enterKeyHint="next"
                  value={paymentForm.amount_paid}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount_paid: e.target.value }))}
                  className="w-full min-h-[44px] rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 mb-1">{t("loans.paymentFor")}</label>
                <select
                  value={paymentForm.payment_for}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_for: e.target.value }))}
                  className="w-full min-h-[44px] rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="interest">{t("loans.interest")}</option>
                  <option value="principal">{t("loans.principal")}</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex flex-col md:flex-row justify-end gap-2">
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="min-h-[44px] w-full md:w-auto rounded-md px-4 text-neutral-800 hover:bg-gray-100"
                disabled={paymentMutation.isLoading}
              >
                {t("buttons.cancel")}
              </button>
              <button
                onClick={handleCreatePayment}
                className="min-h-[44px] w-full md:w-auto rounded-md px-4 bg-indigo-600 text-white disabled:opacity-60"
                disabled={paymentMutation.isLoading}
              >
                {paymentMutation.isLoading ? t("buttons.saving") : t("loans.savePayment")}
              </button>
            </div>
          </div>
        </div>
      )}

      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800">
          {t("loans.pawnTickets")}
        </h1>
        <div className="flex w-full sm:w-auto gap-2">
  <Input
    type="text"
    placeholder="Search by Ticket # or Item..."
    value={searchInput}
    onChange={(e) => {
      setPage(1);
      setSearchInput(e.target.value);
    }}
    className="w-full md:w-64"
  />

  {/* Desktop dropdown stays same */}
  <div className="relative hidden md:block">
    <select
      value={status}
      onChange={(e) => {
        setPage(1);
        setStatus(e.target.value);
      }}
      className="flex h-10 w-full rounded-md border border-neutral-300 bg-gray-50 px-3 pr-8 appearance-none"
    >
      <option value="active">Active</option>
      <option value="settled">Settled</option>
      <option value="defaulted">Defaulted</option>
      <option value="all">All Statuses</option>
    </select>
  </div>

  {/* 🔥 Mobile filter button */}
  <button
    onClick={() => setIsFilterOpen(true)}
    className="md:hidden min-h-[44px] px-4 rounded-md border bg-white text-sm"
  >
    Filter
  </button>

  {hasPermission("can_create_tickets") && (
    <Link
      to="/app/pawn/add"
      className="flex items-center justify-center gap-2 h-10 px-4 rounded-md font-medium whitespace-nowrap text-neutral-800 hover:bg-gray-100"
    >
      <IconPlus />
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
            initial={false}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="shadow-input rounded-2xl bg-white p-4 min-h-[320px]"
          >
            <PawnTableSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key={status + page + searchInput}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {pawns.length === 0 ? (
              <div className="text-center py-10 text-neutral-500">
                {searchInput
                  ? `No ${status} tickets found matching "${searchInput}".`
                  : `No ${status !== 'all' ? status : ''} pawn tickets found.`}
              </div>
            ) : (
              <>
                <div className="hidden md:block shadow-input rounded-2xl bg-white overflow-hidden">
                  <Table>
                    <TableCaption className="pb-4">
                      {t("loans.showingOfTickets", { shown: pawns.length, total: totalPawnTickets })}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("loans.ticketNumber")}</TableHead>
                        <TableHead>{t("loans.customer")}</TableHead>
                        <TableHead>{t("loans.items")}</TableHead>
                        <TableHead>{t("loans.loanAmount")}</TableHead>
                        <TableHead>{t("loans.status")}</TableHead>
                        <TableHead className="text-center">{t("customers.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pawns.map((pawn) => (
                        <TableRow key={pawn._id}>
                          <TableCell className="font-medium text-neutral-800">
                            {pawn.ticket_number}
                          </TableCell>
                          <TableCell className="text-neutral-600">
                            {pawn.customer_id?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-neutral-600">
                            {pawn.items[0]?.name}
                            {pawn.items.length > 1 && ` (+${pawn.items.length - 1})`}
                          </TableCell>
                          <TableCell className="font-medium text-neutral-800">
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
                                  className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                                  title={t("loans.editTicket")}
                                >
                                  <IconEdit className="text-blue-500 w-5 h-5" />
                                </Link>
                              )}
                              {hasPermission('can_delete_tickets') && (
                                <button
                                  onClick={() => openDeleteModal(pawn._id)}
                                  disabled={deleteMutation.isLoading}
                                  className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                                  title={t("common.delete")}
                                >
                                  <IconTrashFilled className="text-red-500 w-5 h-5" />
                                </button>
                              )}
                              
                              {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                                <button
                                onClick={() => openSettleModal(pawn._id)}
                                disabled={settleMutation.isLoading}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={t("loans.markSettled")}
                              >
                                <IconCheck size={16} />
                                <span>{t("loans.settle")}</span>
                              </button>
                              )}
                              {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                                <Link
                                to={`/app/pawns/${pawn._id}`}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-sm"
                              >
                                <span>₹</span>
                                <span>{t("loans.payment")}</span>
                              </Link>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                
                <div className="md:hidden space-y-4">
                  <p className="text-sm text-neutral-600 mb-4">
                    {t("loans.showingOfTickets", { shown: pawns.length, total: totalPawnTickets })}
                  </p>
                  {pawns.map((pawn) => (
                    <motion.div
                      key={pawn._id}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      className="shadow-input rounded-xl bg-white p-4 border border-neutral-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-neutral-800">
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
                          <p className="text-sm text-neutral-600 mb-1">
                            <span className="font-medium">{t("loans.customer")}:</span> {pawn.customer_id?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-neutral-600 mb-1">
                            <span className="font-medium">{t("loans.itemName")}:</span> {pawn.items[0]?.name}
                            {pawn.items.length > 1 && ` (+${pawn.items.length - 1} more)`}
                          </p>
                          <p className="text-base font-semibold text-neutral-800 mt-2">
                            ₹{pawn.loan_amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-200">
                        <Link
                          to={`/app/pawns/${pawn._id}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm"
                        >
                          <IconEye className="w-4 h-4"/>
                          <span>{t("customers.view")}</span>
                        </Link>
                        {hasPermission('can_edit_tickets') && (
                          <Link
                            to={`/app/pawns/update/${pawn._id}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm"
                          >
                            <IconEdit className="w-4 h-4"/>
                            <span>{t("customers.edit")}</span>
                          </Link>
                        )}
                        {hasPermission('can_delete_tickets') && (
                          <button
                            onClick={() => openDeleteModal(pawn._id)}
                            disabled={deleteMutation.isLoading}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm disabled:opacity-50"
                          >
                            <IconTrashFilled className="w-4 h-4"/>
                            <span>{t("customers.delete")}</span>
                          </button>
                        )}
                        
                        {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                          <>
                            <button
                              onClick={() => openSettleModal(pawn._id)}
                              disabled={settleMutation.isLoading}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-sm disabled:opacity-50"
                            >
                      
                              {t("loans.settle")}
                            </button>
                            <Link
                              to={`/app/pawns/${pawn._id}`}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-sm"
                            >
                              <span>₹</span>
                              <span>{t("loans.payment")}</span>
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
                  ? 'text-gray-400'
                  : 'text-neutral-800'
              }`}
            />
          </button>
          <span className="text-sm text-neutral-600">
            {t("customers.pageOf", { page, total: totalPages })}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-md disabled:opacity-50"
          >
            <IconCircleArrowRightFilled
              className={`h-10 w-10 ${
                page === totalPages
                  ? 'text-gray-400'
                  : 'text-neutral-800'
              }`}
            />
          </button>
        </div>
      )}
        {isFilterOpen && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:hidden">
    <div className="w-full bg-white rounded-t-2xl p-4 pb-[env(safe-area-inset-bottom)]">
      <h3 className="text-lg font-semibold mb-3">Filter by status</h3>

      {["active", "settled", "defaulted", "all"].map((s) => (
        <button
          key={s}
          onClick={() => {
            setStatus(s);
            setPage(1);
            setIsFilterOpen(false);
          }}
          className={cn(
            "w-full min-h-[44px] rounded-md border px-3 text-left mb-2",
            status === s && "bg-indigo-50 border-indigo-500"
          )}
        >
          {s === "all" ? "All tickets" : s}
        </button>
      ))}

      <button
        onClick={() => setIsFilterOpen(false)}
        className="w-full min-h-[44px] rounded-md bg-gray-100 mt-2"
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
    
  );
}