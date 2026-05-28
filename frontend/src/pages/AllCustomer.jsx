import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getAccounts, deleteAccount } from '../services/api'
import { usePermission } from '../hooks/usePermission'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'
import { 
  IconCircleArrowLeftFilled, 
  IconCircleArrowRightFilled, 
  IconEye, 
  IconTrash, 
  IconEdit, 
  IconPlus,
  IconSearch,
  IconUsers,
  IconMapPin
} from '@tabler/icons-react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Input } from "../components/ui/Input"
import TableSkeleton from "../components/TableSkeleton"
import ConfirmationModal from "../components/ConfirmationModal"
import { useDebounce } from '../hooks/useDebounce'
import { cn } from '../lib/utils'

export default function AllCustomers() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 400)
  const [deleteTarget, setDeleteTarget] = useState(null)
  
  const { hasPermission } = usePermission()

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['customers', page, debouncedSearch],
    queryFn: () => getAccounts(page, debouncedSearch),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
  
  const accounts = queryData?.data?.customers || []
  const totalPages = queryData?.data?.totalPages || 1
  const totalCustomers = queryData?.data?.totalCustomers || 0

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success(t('customers.deletedSuccess'))
      queryClient.invalidateQueries(['customers', page, debouncedSearch]) 
      setDeleteTarget(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('customers.failedToDelete'))
    },
  })

  const handleDelete = (id) => {
    setDeleteTarget(id)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget) 
    }
  }
  
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 sm:p-6 md:p-10 font-sans">
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              <IconUsers className="w-8 h-8 text-zinc-400" />
              {t('customers.title')}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 ml-11">
              Manage client profiles, KYC details, and histories.
            </p>
          </div>
          
          <div className="flex flex-wrap w-full lg:w-auto gap-3">
            <div className="relative w-full sm:w-72 flex-grow">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="text"
                placeholder={t('customers.searchByName')}
                value={searchInput}
                onChange={(e) => {
                  setPage(1)
                  setSearchInput(e.target.value)
                }}
                className="w-full pl-10 min-h-[44px] rounded-xl border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#121212] focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>

            {hasPermission('can_create_customers') && (
              <Link
                to="/app/customer/add"
                className="flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl font-medium text-sm whitespace-nowrap bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shrink-0 shadow-sm"
              >
                <IconPlus className="w-4 h-4" />
                <span className="hidden sm:block">{t('customers.newCustomer')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={false}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 min-h-[400px] shadow-sm"
            >
              <TableSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {isError ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] text-center p-8">
                  <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <IconUsers className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="text-base font-medium text-zinc-900 dark:text-white mb-1">{t('customers.failedToLoad')}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t('customers.tryAgainLater')}
                  </p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] text-center p-8">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <IconSearch className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <h3 className="text-base font-medium text-zinc-900 dark:text-white mb-1">No customers found</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    {searchInput ? t('customers.noCustomersMatching', { search: searchInput }) : t('customers.noCustomersYet')}
                  </p>
                  {!searchInput && hasPermission('can_create_customers') && (
                    <Link
                      to="/app/customer/add"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl font-medium text-sm whitespace-nowrap bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm"
                    >
                      <IconPlus className="w-4 h-4" />
                      {t('customers.addFirstCustomer')}
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-3xl border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                        <TableRow className="border-zinc-200/60 dark:border-white/[0.06] hover:bg-transparent">
                          <TableHead className="w-[80px] pl-6 py-5"></TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">
                            {t('customers.name')}
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">
                            {t('customers.phone')}
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5">
                            {t('customers.address')}
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium py-5 text-right pr-6">
                            {t('customers.actions')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account._id} className="border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <TableCell className="pl-6 py-4">
                              <img
                                src={account.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${account.full_name}`}
                                alt={account.full_name}
                                className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-white/10"
                              />
                            </TableCell>
                            <TableCell className="font-medium text-zinc-900 dark:text-white py-4">
                              {account.full_name}
                            </TableCell>
                            <TableCell className="text-zinc-600 dark:text-zinc-400 py-4 font-mono text-sm">
                              {account.phone_number}
                            </TableCell>
                            <TableCell className="text-zinc-600 dark:text-zinc-400 py-4">
                              {account.address?.city || 'N/A'}
                              {account.address?.pincode && `, ${account.address.pincode}`}
                            </TableCell>
                            <TableCell className="text-right pr-6 py-4">
                              {/* Desktop Actions - ALWAYS VISIBLE */}
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/app/customer/${account._id}`}
                                  title={t('customers.view')}
                                  className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                  <IconEye className="w-[18px] h-[18px]" />
                                </Link>
                                {hasPermission('can_edit_customers') && (
                                  <Link
                                    to={`/app/customer/update/${account._id}`}
                                    title={t('customers.edit')}
                                    className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                  >
                                    <IconEdit className="w-[18px] h-[18px]" />
                                  </Link>
                                )}
                                {hasPermission('can_delete_customers') && (
                                  <button
                                    onClick={() => handleDelete(account._id)}
                                    disabled={deleteMutation.isLoading}
                                    title={t('customers.delete')}
                                    className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                  >
                                    <IconTrash className="w-[18px] h-[18px]" />
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Bento Card View */}
                  <div className="md:hidden flex flex-col gap-5">
                    {accounts.map((account, i) => (
                      <motion.div
                        key={account._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="flex flex-col p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] overflow-hidden shadow-sm relative"
                      >
                        {/* Subtle Texture */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />

                        {/* Top: Avatar & Name */}
                        <div className="relative z-10 flex items-center gap-4 mb-6">
                          <img
                            src={account.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${account.full_name}`}
                            alt={account.full_name}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-white/5"
                          />
                          <div>
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white leading-tight">
                              {account.full_name}
                            </h3>
                            <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                              {account.phone_number}
                            </p>
                          </div>
                        </div>

                        {/* Middle: Bento Sub-card for Address */}
                        <div className="relative z-10 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.02] p-4 mb-6 flex flex-col justify-center">
                          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                            <IconMapPin className="w-3.5 h-3.5" />
                            Location
                          </span>
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {account.address?.city || 'Location not provided'}
                            {account.address?.pincode && `, ${account.address.pincode}`}
                          </span>
                        </div>

                        {/* Bottom: Action Dock */}
                        <div className="relative z-10 flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-white/[0.05]">
                          <Link
                            to={`/app/customer/${account._id}`}
                            className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-medium"
                          >
                            <IconEye className="w-[18px] h-[18px]" />
                            <span>{t('customers.view')}</span>
                          </Link>
                          
                          {hasPermission('can_edit_customers') && (
                            <Link
                              to={`/app/customer/update/${account._id}`}
                              className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
                            >
                              <IconEdit className="w-[18px] h-[18px]" />
                            </Link>
                          )}
                          
                          {hasPermission('can_delete_customers') && (
                            <button
                              onClick={() => handleDelete(account._id)}
                              disabled={deleteMutation.isLoading}
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

        {/* Pagination */}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('customers.deleteConfirmTitle')}
        message={t('customers.deleteConfirmMessage')}
        confirmText={deleteMutation.isLoading ? t('customers.deleting') : t('customers.delete')}
      />
    </div>
  )
}