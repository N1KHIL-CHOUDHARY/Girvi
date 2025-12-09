import React, { useState } from 'react'; // <-- 1. REMOVED useEffect
import { Link } from 'react-router-dom';
import { getAccounts, deleteAccount } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCircleArrowLeftFilled, IconCircleArrowRightFilled, IconEye, IconTrashFilled, IconEdit, IconPlus } from '@tabler/icons-react';

// --- 2. IMPORT TanStack Query hooks ---
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

export default function AllCustomers() {
  // --- 3. REMOVED loading, accounts, totalPages, totalCustomers state ---
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  
  // Get the QueryClient instance
  const queryClient = useQueryClient();

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => getAccounts(page, search), 
    keepPreviousData: true, 
  });
  
  const accounts = queryData?.data?.customers || [];
  const totalPages = queryData?.data?.totalPages || 1;
  const totalCustomers = queryData?.data?.totalCustomers || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success('Account deleted successfully.');
      queryClient.invalidateQueries(['customers']); 
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteMutation.mutate(id); 
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

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''} pt-20 md:pt-4`}>
      {/* --- HEADER (No change) --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
          Customers
        </h1>
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
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-md font-medium whitespace-nowrap text-neutral-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <IconPlus className="text-neutral-800 dark:text-neutral-200 text-black dark:text-white"/>
              <span>New Customer</span>
            </Link>
          )}
        </div>
      </div>

      {/* --- 7. WRAPPER (use isLoading now) --- */}
      <AnimatePresence mode="wait">
        {isLoading ? ( // <-- Use isLoading from useQuery
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="shadow-input rounded-2xl bg-white p-4 dark:bg-black"
          >
            <TableSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
          >
            {isError ? (
              <div className="text-center py-10 text-red-500 dark:text-red-400">
                Failed to load accounts.
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                {search ? `No customers found matching "${search}".` : "No customers created yet."}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block shadow-input rounded-2xl bg-white dark:bg-black">
                  <Table>
                    <TableCaption className="pb-4">
                      {`Showing ${accounts.length} of ${totalCustomers} customers.`}
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
                        <TableRow key={account._id}>
                          <TableCell>
                            <img
                              src={account.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${account.full_name}`}
                              alt={account.full_name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">
                            {account.full_name}
                          </TableCell>
                          <TableCell className="text-neutral-600 dark:text-neutral-400">
                            {account.phone_number}
                          </TableCell>
                          <TableCell className="text-neutral-600 dark:text-neutral-400">
                            {account.address?.city || 'N/A'}
                            {account.address?.pincode && `, ${account.address.pincode}`}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Link
                                to={`/app/customer/${account._id}`}
                                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                              >
                                <IconEye className="text-indigo-500 w-5 h-5"/>
                              </Link>
                              {hasPermission('can_edit_customers') && (
                                <Link
                                  to={`/app/customer/update/${account._id}`}
                                  className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                >
                                  <IconEdit className="text-blue-500 w-5 h-5"/>
                                </Link>
                              )}
                              {hasPermission('can_delete_customers') && (
                                <button
                                  onClick={() => handleDelete(account._id)}
                                  className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                  disabled={deleteMutation.isLoading}
                                >
                                  <IconTrashFilled className="text-red-500 w-5 h-5"/>
                                </button>
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
                    {`Showing ${accounts.length} of ${totalCustomers} customers.`}
                  </p>
                  {accounts.map((account) => (
                    <motion.div
                      key={account._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="shadow-input rounded-xl bg-white dark:bg-black p-4 border border-neutral-200 dark:border-neutral-800"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={account.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${account.full_name}`}
                          alt={account.full_name}
                          className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200 mb-1 truncate">
                            {account.full_name}
                          </h3>
                          <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Phone:</span>
                              <span>{account.phone_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Address:</span>
                              <span className="truncate">
                                {account.address?.city || 'N/A'}
                                {account.address?.pincode && `, ${account.address.pincode}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <Link
                          to={`/app/customer/${account._id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                          <IconEye className="w-4 h-4"/>
                          <span className="text-sm font-medium">View</span>
                        </Link>
                        {hasPermission('can_edit_customers') && (
                          <Link
                            to={`/app/customer/update/${account._id}`}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <IconEdit className="w-4 h-4"/>
                            <span className="text-sm font-medium">Edit</span>
                          </Link>
                        )}
                        {hasPermission('can_delete_customers') && (
                          <button
                            onClick={() => handleDelete(account._id)}
                            disabled={deleteMutation.isLoading}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                          >
                            <IconTrashFilled className="w-4 h-4"/>
                            <span className="text-sm font-medium">Delete</span>
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

      
      {/* --- PAGINATION --- */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-md disabled:opacity-50"
          >
            <IconCircleArrowLeftFilled className={`h-10 w-10 ${page === 1 ? 'text-gray-400 dark:text-neutral-700' : 'text-neutral-800 dark:text-neutral-200'} text-black dark:text-white`}/>
          </button>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-md disabled:opacity-50"
          >
            <IconCircleArrowRightFilled className={`h-10 w-10 ${page === totalPages ? 'text-gray-400 dark:text-neutral-700' : 'text-neutral-800 dark:text-neutral-200'} text-black dark:text-white`}/>
          </button>
        </div>
      )}
    </div>
  );
}