import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccounts, deleteAccount } from '../services/api';
import { usePermission } from '../hooks/usePermission';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconCircleArrowLeftFilled, 
  IconCircleArrowRightFilled, 
  IconEye, 
  IconTrashFilled, 
  IconEdit, 
  IconPlus,
  IconPhone,
  IconMapPin,
  IconSearch,
  IconX,
  IconDotsVertical
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
import TableSkeleton from "../components/TableSkeleton";
import ConfirmationModal from "../components/ConfirmationModal";

export default function AllCustomers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => getAccounts(page, search),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  
  const accounts = queryData?.data?.customers || [];
  const totalPages = queryData?.data?.totalPages || 1;
  const totalCustomers = queryData?.data?.totalCustomers || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      queryClient.invalidateQueries(['customers']); 
      setDeleteTarget(null);
      setOpenMenuId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    },
  });

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget); 
    }
  };
  
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); 
  };
  
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white">
      {/* Mobile Header - Fixed */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isSearchOpen ? (
                  <IconX className="w-5 h-5 text-gray-600" />
                ) : (
                  <IconSearch className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {hasPermission('can_create_customers') && (
                <Link
                  to="/app/customer/add"
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  <IconPlus className="w-4 h-4" />
                  Add
                </Link>
              )}
            </div>
          </div>
          
          {/* Search Bar - Collapsible on Mobile */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={handleSearch}
                  className="w-full"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Results Count */}
        {!isLoading && accounts.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              {totalCustomers} {totalCustomers === 1 ? 'customer' : 'customers'} total
            </p>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-black">Customers</h1>
          <div className="flex w-full sm:w-auto gap-2">
            <Input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={handleSearch}
              className="w-full md:w-64"
            />
            {hasPermission('can_create_customers') && (
              <Link
                to="/app/customer/add"
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-md font-medium whitespace-nowrap text-black hover:bg-gray-100"
              >
                <IconPlus className="text-black" />
                <span>New Customer</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-32 md:pt-0 pb-20 md:pb-6 px-4 md:px-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={false}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="shadow-input rounded-2xl bg-white p-4 min-h-[320px]"
            >
              <TableSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={false}
              animate={{ opacity: 1, transition: { duration: 0.25 } }}
            >
              {isError ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <IconX className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">Failed to load customers</p>
                  <p className="text-gray-500 text-sm mt-1">Please try again later</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <IconSearch className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    {search ? `No customers found matching "${search}"` : "No customers yet"}
                  </p>
                  {!search && hasPermission('can_create_customers') && (
                    <Link
                      to="/app/customer/add"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <IconPlus className="w-4 h-4" />
                      Add your first customer
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block shadow-input rounded-2xl bg-white p-4">
                    <Table>
                      <TableCaption className="pb-4">
                        {`Showing ${accounts.length} of ${totalCustomers} customers`}
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Photo</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account._id} className="hover:bg-gray-50">
                            <TableCell>
                            <img
                              src={account.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${account.full_name}`}
                              alt={account.full_name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            </TableCell>
                            <TableCell className="font-medium text-black">
                              {account.full_name}
                            </TableCell>
                            <TableCell className="text-black">
                              {account.phone_number}
                            </TableCell>
                            <TableCell className="text-black">
                              {account.address?.city || 'N/A'}
                              {account.address?.pincode && `, ${account.address.pincode}`}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Link
                                  to={`/app/customer/${account._id}`}
                                  className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                                >
                                  <IconEye className="text-indigo-500 w-5 h-5" />
                                </Link>
                                {hasPermission('can_edit_customers') && (
                                  <Link
                                    to={`/app/customer/update/${account._id}`}
                                    className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                                  >
                                    <IconEdit className="text-blue-500 w-5 h-5" />
                                  </Link>
                                )}
                                {hasPermission('can_delete_customers') && (
                                  <button
                                    onClick={() => handleDelete(account._id)}
                                    className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                                    disabled={deleteMutation.isLoading}
                                  >
                                    <IconTrashFilled className="text-red-500 w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View - Improved */}
                  <div className="md:hidden space-y-3">
                    {accounts.map((account) => (
                      <motion.div
                        key={account._id}
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                      >
                        {/* Card Header */}
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={account.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${account.full_name}`}
                              alt={account.full_name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base text-gray-900 truncate">
                                {account.full_name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                                <IconPhone className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{account.phone_number}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                                <IconMapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">
                                  {account.address?.city || 'N/A'}
                                  {account.address?.pincode && `, ${account.address.pincode}`}
                                </span>
                              </div>
                            </div>
                            
                            {/* Menu Button */}
                            <div className="relative">
                              <button
                                onClick={() => toggleMenu(account._id)}
                                className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <IconDotsVertical className="w-5 h-5 text-gray-600" />
                              </button>
                              
                              {/* Dropdown Menu */}
                              <AnimatePresence>
                                {openMenuId === account._id && (
                                  <>
                                    {/* Backdrop */}
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={() => setOpenMenuId(null)}
                                    />
                                    
                                    {/* Menu */}
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                                    >
                                      <Link
                                        to={`/app/customer/${account._id}`}
                                        onClick={() => setOpenMenuId(null)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700"
                                      >
                                        <IconEye className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-medium">View</span>
                                      </Link>
                                      
                                      {hasPermission('can_edit_customers') && (
                                        <Link
                                          to={`/app/customer/update/${account._id}`}
                                          onClick={() => setOpenMenuId(null)}
                                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700"
                                        >
                                          <IconEdit className="w-4 h-4 text-blue-500" />
                                          <span className="text-sm font-medium">Edit</span>
                                        </Link>
                                      )}
                                      
                                      {hasPermission('can_delete_customers') && (
                                        <>
                                          <div className="h-px bg-gray-200 my-1" />
                                          <button
                                            onClick={() => {
                                              handleDelete(account._id);
                                              setOpenMenuId(null);
                                            }}
                                            disabled={deleteMutation.isLoading}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 w-full disabled:opacity-50"
                                          >
                                            <IconTrashFilled className="w-4 h-4" />
                                            <span className="text-sm font-medium">Delete</span>
                                          </button>
                                        </>
                                      )}
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Button - View Details */}
                        <Link
                          to={`/app/customer/${account._id}`}
                          className="block px-4 py-3 bg-gray-50 border-t border-gray-100 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          View Details
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination - Fixed Bottom on Mobile */}
        {!isLoading && totalPages > 1 && (
          <div className="fixed md:relative bottom-0 left-0 right-0 md:mt-6 bg-white md:bg-transparent border-t md:border-0 border-gray-200 px-4 py-3 md:p-0 z-30">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-30 transition-opacity"
              >
                <IconCircleArrowLeftFilled 
                  className={`h-8 w-8 ${page === 1 ? 'text-gray-300' : 'text-gray-700'}`}
                />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">Previous</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-30 transition-opacity"
              >
                <span className="hidden sm:inline text-sm font-medium text-gray-700">Next</span>
                <IconCircleArrowRightFilled 
                  className={`h-8 w-8 ${page === totalPages ? 'text-gray-300' : 'text-gray-700'}`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete customer?"
        message="This action will soft-delete the customer and hide them from lists."
        confirmText={deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
      />
    </div>
  );
}