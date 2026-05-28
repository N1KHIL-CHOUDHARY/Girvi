import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import {
  getPawnTickets,
  deletePawnTicket,
  updatePawnTicketStatus,
  createPayment
} from "../services/api"
import { usePermission } from "../hooks/usePermission"
import toast from "react-hot-toast"
import { useDebounce } from '../hooks/useDebounce'
import { motion, AnimatePresence } from "motion/react"
import {
  IconCircleArrowLeftFilled,
  IconCircleArrowRightFilled,
  IconEye,
  IconTrash,
  IconEdit,
  IconPlus,
  IconCheck,
  IconSearch,
  IconFilter,
  IconReceipt,
  IconLayoutGrid
} from "@tabler/icons-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table"
import { Input } from "../components/ui/Input"
import PawnTableSkeleton from "../components/PawnTableSkeleton"
import ConfirmationModal from "../components/ConfirmationModal"
import { cn } from "../lib/utils"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"

export default function AllPawns() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("active")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount_paid: "", payment_for: "interest" })

  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 400)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { hasPermission } = usePermission()

  const { data, isLoading } = useQuery({
    queryKey: ["pawns", page, debouncedSearch, status],
    queryFn: () => getPawnTickets(page, debouncedSearch, status),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    onError: (err) => {
      toast.error(t('loans.failedToLoad', { message: err.message }))
    },
  })

  const pawns = data?.data?.tickets || []
  const totalPages = data?.data?.totalPages || 1

  const deleteMutation = useMutation({
    mutationFn: deletePawnTicket,
    onSuccess: () => {
      toast.success("Pawn ticket deleted")
      queryClient.invalidateQueries(["pawns", page, searchInput, status])
    },
    onError: (err) => toast.error(err.response?.data?.message || t("loans.failedToDeleteTicket"))
  })

  const settleMutation = useMutation({
    mutationFn: (id) => updatePawnTicketStatus(id, "settled"),
    onSuccess: () => {
      toast.success("Ticket settled")
      queryClient.invalidateQueries(["pawns"])
    },
    onError: (err) => toast.error(err.response?.data?.message || t("loans.failedToSettle"))
  })

  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success(t("loans.paymentRecorded"))
      queryClient.invalidateQueries(["pawns"])
      setIsPaymentOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || t("loans.failedToSavePayment"))
  })

  const openSettleModal = (id) => {
    setSelectedTicketId(id)
    setIsModalOpen(true)
  }

  const handleConfirmSettle = () => {
    if (!selectedTicketId) return
    settleMutation.mutate(selectedTicketId)
    setIsModalOpen(false)
  }

  const openDeleteModal = (id) => {
    setSelectedTicketId(id)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedTicketId) return
    deleteMutation.mutate(selectedTicketId)
    setIsDeleteOpen(false)
  }

  const openPaymentModal = (id) => {
    setSelectedTicketId(id)
    setPaymentForm({ amount_paid: "", payment_for: "interest" })
    setIsPaymentOpen(true)
  }

  const handleCreatePayment = () => {
    const ticket = pawns.find((p) => p._id === selectedTicketId)
    if (!ticket) return

    const amount = Number(paymentForm.amount_paid)
    if (!amount || amount <= 0) return toast.error(t("loans.enterValidAmount"))

    paymentMutation.mutate({
      ticket_id: selectedTicketId,
      customer_id: ticket.customer_id?._id || ticket.customer_id,
      amount_paid: amount,
      payment_for: paymentForm.payment_for
    })
  }

  const statusClass = (status) =>
    ({
      active: "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      settled: "bg-zinc-100 text-zinc-600 border-zinc-200/60 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10",
      defaulted: "bg-rose-50/80 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
    }[status] || "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-white/5 dark:text-zinc-400")

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage)
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 sm:p-6 md:p-10 font-sans">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSettle}
        title={t("loans.settlePawnTicket")}
        message={t("loans.settleConfirmMessage")}
        confirmText={t("loans.yesSettle")}
      />

      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("loans.deletePawnTicket")}
        message={t("loans.deleteTicketMessage")}
        confirmText={t("buttons.delete")}
      />

      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-zinc-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto scroll-contain rounded-t-3xl md:rounded-3xl bg-white dark:bg-[#121212] p-8 pb-32 md:pb-8 shadow-2xl border border-zinc-200 dark:border-white/[0.08]">
            <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-6">{t("loans.addPayment")}</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">{t("loans.amount")}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  enterKeyHint="next"
                  value={paymentForm.amount_paid}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount_paid: e.target.value }))}
                  className="w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">{t("loans.paymentFor")}</label>
                <select
                  value={paymentForm.payment_for}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_for: e.target.value }))}
                  className="w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
                >
                  <option value="interest">{t("loans.interest")}</option>
                  <option value="principal">{t("loans.principal")}</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex flex-col md:flex-row justify-end gap-3">
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="min-h-[44px] w-full md:w-auto rounded-xl px-6 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                disabled={paymentMutation.isLoading}
              >
                {t("buttons.cancel")}
              </button>
              <button
                onClick={handleCreatePayment}
                className="min-h-[44px] w-full md:w-auto rounded-xl px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60"
                disabled={paymentMutation.isLoading}
              >
                {paymentMutation.isLoading ? t("buttons.saving") : t("loans.savePayment")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              <IconLayoutGrid className="w-8 h-8 text-zinc-400" />
              {t("loans.pawnTickets")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 ml-11">Manage your inventory, payments, and active pledges.</p>
          </div>
          
          <div className="flex flex-wrap w-full lg:w-auto gap-3">
            <div className="relative w-full sm:w-64">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search ticket or item..."
                value={searchInput}
                onChange={(e) => {
                  setPage(1)
                  setSearchInput(e.target.value)
                }}
                className="w-full pl-10 min-h-[44px] rounded-xl border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#121212] focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>

            <div className="relative hidden sm:block w-40">
              <select
                value={status}
                onChange={(e) => {
                  setPage(1)
                  setStatus(e.target.value)
                }}
                className="flex h-[44px] w-full rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#121212] px-4 pr-10 text-sm font-medium text-zinc-700 dark:text-zinc-300 appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="settled">Settled</option>
                <option value="defaulted">Defaulted</option>
                <option value="all">All Tickets</option>
              </select>
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="sm:hidden flex items-center justify-center min-h-[44px] w-[44px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#121212] text-zinc-600 dark:text-zinc-400 shrink-0"
            >
              <IconFilter className="w-4 h-4" />
            </button>

            {hasPermission("can_create_tickets") && (
              <Link
                to="/app/pawn/add"
                className="flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl font-medium text-sm whitespace-nowrap bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shrink-0 shadow-sm"
              >
                <IconPlus className="w-4 h-4" />
                <span className="hidden sm:block">New Ticket</span>
              </Link>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={false}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 min-h-[400px] shadow-sm"
            >
              <PawnTableSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key={status + page + searchInput}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {pawns.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] text-center p-8">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <IconSearch className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <h3 className="text-base font-medium text-zinc-900 dark:text-white mb-1">No tickets found</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {searchInput
                      ? `We couldn't find any ${status} tickets matching "${searchInput}".`
                      : `You don't have any ${status !== 'all' ? status : ''} pawn tickets yet.`}
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block rounded-3xl border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                        <TableRow className="border-zinc-200/60 dark:border-white/[0.06] hover:bg-transparent">
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5 pl-6">Ticket</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">Customer</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">Items</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">Amount</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">Status</TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5 text-right pr-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pawns.map((pawn) => (
                          <TableRow key={pawn._id} className="border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <TableCell className="font-medium text-zinc-900 dark:text-white pl-6 py-5">
                              {pawn.ticket_number}
                            </TableCell>
                            <TableCell className="text-zinc-600 dark:text-zinc-400 py-5">
                              {pawn.customer_id?.full_name || 'N/A'}
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
                            <TableCell className="py-5">
                              <span
                                className={cn(
                                  'px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md border',
                                  statusClass(pawn.status)
                                )}
                              >
                                {pawn.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6 py-5">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/app/pawns/${pawn._id}`}
                                  title="View"
                                  className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                  <IconEye className="w-[18px] h-[18px]" />
                                </Link>
                                
                                {hasPermission('can_edit_tickets') && (
                                  <Link
                                    to={`/app/pawn/update/${pawn._id}`}
                                    title="Edit"
                                    className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                  >
                                    <IconEdit className="w-[18px] h-[18px]" />
                                  </Link>
                                )}

                                {hasPermission('can_delete_tickets') && (
                                  <button
                                    onClick={() => openDeleteModal(pawn._id)}
                                    disabled={deleteMutation.isLoading}
                                    title="Delete"
                                    className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                  >
                                    <IconTrash className="w-[18px] h-[18px]" />
                                  </button>
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
                                    <button
                                      onClick={() => openPaymentModal(pawn._id)}
                                      title="Payment"
                                      className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                    >
                                      <IconReceipt className="w-[18px] h-[18px]" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden flex flex-col gap-5">
                    {pawns.map((pawn, i) => (
                      <motion.div
                        key={pawn._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="group flex flex-col p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] overflow-hidden shadow-sm relative"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />

                        <div className="relative z-10 flex items-start justify-between mb-6">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1.5">
                              {pawn.ticket_number}
                            </span>
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white line-clamp-1 pr-4">
                              {pawn.customer_id?.full_name || 'N/A'}
                            </h3>
                          </div>
                          <span className={cn('px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-lg border shrink-0', statusClass(pawn.status))}>
                            {pawn.status}
                          </span>
                        </div>

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
                            <span className="text-xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
                              ₹{pawn.loan_amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-white/[0.05]">
                          <Link
                            to={`/app/pawns/${pawn._id}`}
                            title="View Details"
                            className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-medium"
                          >
                            <IconEye className="w-[18px] h-[18px]" />
                            <span>View</span>
                          </Link>
                          
                          {hasPermission('can_edit_tickets') && (
                            <Link
                              to={`/app/pawn/update/${pawn._id}`}
                              title="Edit Ticket"
                              className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
                            >
                              <IconEdit className="w-[18px] h-[18px]" />
                            </Link>
                          )}

                          {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                            <button
                              onClick={() => openSettleModal(pawn._id)}
                              disabled={settleMutation.isLoading}
                              title="Settle Loan"
                              className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shrink-0"
                            >
                              <IconCheck className="w-[18px] h-[18px]" />
                            </button>
                          )}

                          {hasPermission('can_settle_tickets') && pawn.status === 'active' && (
                            <button
                              onClick={() => openPaymentModal(pawn._id)}
                              title="Record Payment"
                              className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors shrink-0"
                            >
                              <IconReceipt className="w-[18px] h-[18px]" />
                            </button>
                          )}

                          {hasPermission('can_delete_tickets') && (
                            <button
                              onClick={() => openDeleteModal(pawn._id)}
                              disabled={deleteMutation.isLoading}
                              title="Delete"
                              className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
                            >
                              <IconTrash className="w-[18px] h-[18px]" />
                            </button>
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

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-between items-center mt-12 px-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/[0.08] text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-white transition-colors shadow-sm"
            >
              <IconCircleArrowLeftFilled className="w-7 h-7" />
            </button>
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/[0.08] text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-white transition-colors shadow-sm"
            >
              <IconCircleArrowRightFilled className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-end sm:hidden">
          <div className="w-full bg-white dark:bg-[#121212] rounded-t-[2rem] p-8 pb-[env(safe-area-inset-bottom)] border-t border-zinc-200 dark:border-white/[0.08] shadow-2xl">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-6">Filter Tickets</h3>

            <div className="space-y-3">
              {["active", "settled", "defaulted", "all"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s)
                    setPage(1)
                    setIsFilterOpen(false)
                  }}
                  className={cn(
                    "w-full min-h-[52px] rounded-2xl border px-5 text-left text-sm font-medium transition-all capitalize",
                    status === s 
                      ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900" 
                      : "bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.05] text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  {s === "all" ? "All tickets" : s}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full min-h-[52px] rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 text-sm font-medium mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}