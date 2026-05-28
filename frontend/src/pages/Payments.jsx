import { useState, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getFinancialReport } from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'
import { 
  IconReportMoney, 
  IconCircleArrowLeftFilled, 
  IconCircleArrowRightFilled, 
  IconSearch,
  IconWallet,
  IconReceipt2,
  IconChartPie,
  IconEye,
  IconTicket
} from '@tabler/icons-react'
import { Input } from '../components/ui/Input'
import { cn } from '../lib/utils'

const currency = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const statusClass = (status) =>
  ({
    active: "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    settled: "bg-zinc-100 text-zinc-600 border-zinc-200/60 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10",
    defaulted: "bg-rose-50/80 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
  }[status] || "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-white/5 dark:text-zinc-400")

const PaymentsTableSkeleton = () => (
  <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 min-h-[400px]">
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-zinc-100 dark:border-white/[0.02] pb-4 last:border-0">
          <div className="h-5 w-24 rounded-md bg-zinc-200 dark:bg-white/5 animate-pulse" />
          <div className="h-5 w-32 rounded-md bg-zinc-200 dark:bg-white/5 animate-pulse" />
          <div className="h-5 w-20 rounded-md bg-zinc-200 dark:bg-white/5 animate-pulse" />
          <div className="h-5 w-24 rounded-md bg-zinc-200 dark:bg-white/5 animate-pulse" />
          <div className="h-5 w-24 rounded-md bg-zinc-200 dark:bg-white/5 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
)

const SummaryCard = memo(function SummaryCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 shadow-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={cn("p-2 rounded-xl border border-white/10 shadow-sm", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{title}</p>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white relative z-10">{value}</p>
    </div>
  )
})

export default function Payments() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['financial-report', page, search],
    queryFn: () => getFinancialReport(page, search),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    onError: (err) => toast.error(err.message || t('payments.failedToLoadReport')),
  })

  const rows = data?.data || []
  const totalPages = data?.meta?.totalPages || 1
  const totalItems = data?.meta?.totalItems || 0

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.outstanding += Number(row.loan_amount || 0)
        acc.principal += Number(row.total_principal_paid || 0)
        acc.interest += Number(row.total_interest_paid || 0)
        return acc
      },
      { outstanding: 0, principal: 0, interest: 0 }
    )
  }, [rows])

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage)
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <IconReportMoney className="w-8 h-8 text-zinc-400" />
            {t('payments.title')}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 ml-11">Track financial reports, collections, and outstanding balances.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <SummaryCard 
            title={t('payments.totalOutstanding')} 
            value={currency(totals.outstanding)} 
            icon={IconChartPie}
            colorClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20"
          />
          <SummaryCard 
            title={t('payments.totalPrincipalCollected')} 
            value={currency(totals.principal)} 
            icon={IconWallet}
            colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
          />
          <SummaryCard 
            title={t('payments.totalInterestCollected')} 
            value={currency(totals.interest)} 
            icon={IconReceipt2}
            colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder={t('payments.searchByTicket')}
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 min-h-[44px] rounded-xl border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#121212] focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>
          {!isLoading && totalItems > 0 && (
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              {t('payments.showingOfTotal', { shown: rows.length, total: totalItems })}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={false}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <PaymentsTableSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key={page + search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {!rows.length ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] text-center p-8">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <IconSearch className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <h3 className="text-base font-medium text-zinc-900 dark:text-white mb-1">No records found</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {search ? t('payments.noTicketsMatchingSearch', { search }) : t('payments.noData')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50/50 dark:bg-white/[0.02]">
                          <tr className="border-b border-zinc-200/60 dark:border-white/[0.06]">
                            <th className="py-5 pl-6 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">{t('loans.ticketNumber')}</th>
                            <th className="py-5 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">{t('loans.customer')}</th>
                            <th className="py-5 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">{t('loans.status')}</th>
                            <th className="py-5 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">{t('payments.originalLoan')}</th>
                            <th className="py-5 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">{t('payments.principalPaid')}</th>
                            <th className="py-5 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">{t('payments.interestPaid')}</th>
                            <th className="py-5 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">{t('payments.balanceDue')}</th>
                            <th className="py-5 pr-6 text-right text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                          {rows.map((row) => (
                            <tr key={row._id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                              <td className="py-4 pl-6 font-medium text-zinc-900 dark:text-white">{row.ticket_number}</td>
                              <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">{Array.isArray(row.customer_name) ? row.customer_name[0] : row.customer_name || '—'}</td>
                              <td className="py-4 px-4">
                                <span className={cn('px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md border shrink-0', statusClass(row.status))}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-mono text-sm text-zinc-600 dark:text-zinc-400">{currency(row.original_loan_amount)}</td>
                              <td className="py-4 px-4 font-mono text-sm text-emerald-600 dark:text-emerald-400">{currency(row.total_principal_paid)}</td>
                              <td className="py-4 px-4 font-mono text-sm text-blue-600 dark:text-blue-400">{currency(row.total_interest_paid)}</td>
                              <td className="py-4 px-4 font-mono text-sm font-semibold text-rose-600 dark:text-rose-400">{currency(row.loan_amount)}</td>
                              <td className="py-4 pr-6 text-right">
                                <div className="flex items-center justify-end">
                                  <Link
                                    to={`/app/pawns/${row._id}`}
                                    title="View Details"
                                    className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                  >
                                    <IconEye className="w-[18px] h-[18px]" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="md:hidden grid grid-cols-1 gap-5">
                    {rows.map((row, i) => (
                      <motion.div
                        key={row._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="group flex flex-col p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] overflow-hidden shadow-sm relative"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />

                        <div className="relative z-10 flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05] rounded-xl shadow-sm">
                              <IconTicket className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
                                {row.ticket_number}
                              </p>
                              <p className="font-medium text-zinc-900 dark:text-white line-clamp-1 pr-4">
                                {Array.isArray(row.customer_name) ? row.customer_name[0] : row.customer_name || '—'}
                              </p>
                            </div>
                          </div>
                          <span className={cn('px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-lg border shrink-0', statusClass(row.status))}>
                            {row.status}
                          </span>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
                          <div className="rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.02] p-4 flex flex-col justify-center">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">{t('payments.originalLoan')}</span>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">{currency(row.original_loan_amount)}</span>
                          </div>
                          <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 p-4 flex flex-col justify-center">
                            <span className="text-[10px] uppercase tracking-widest text-emerald-600/70 dark:text-emerald-500/70 mb-2">{t('payments.principalPaid')}</span>
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{currency(row.total_principal_paid)}</span>
                          </div>
                          <div className="rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 p-4 flex flex-col justify-center">
                            <span className="text-[10px] uppercase tracking-widest text-blue-600/70 dark:text-blue-500/70 mb-2">{t('payments.interestPaid')}</span>
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{currency(row.total_interest_paid)}</span>
                          </div>
                          <div className="rounded-2xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10 p-4 flex flex-col justify-center">
                            <span className="text-[10px] uppercase tracking-widest text-rose-600/70 dark:text-rose-500/70 mb-2">{t('payments.balanceDue')}</span>
                            <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">{currency(row.loan_amount)}</span>
                          </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-zinc-100 dark:border-white/[0.05]">
                          <Link
                            to={`/app/pawns/${row._id}`}
                            className="flex items-center justify-center gap-2 h-[42px] w-full rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-medium"
                          >
                            <IconEye className="w-[18px] h-[18px]" />
                            <span>View Details</span>
                          </Link>
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
    </div>
  )
}