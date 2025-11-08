import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAccounts, deleteAccount } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// --- 1. Import animation components ---
import { motion, AnimatePresence } from 'motion/react';
import { IconCircleArrowLeftFilled, IconCircleArrowRightFilled} from '@tabler/icons-react';
import { IconEye,IconTrashFilled,IconEdit,IconPlus } from '@tabler/icons-react';

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
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        // We add a small delay to make the animation visible
        await new Promise(resolve => setTimeout(resolve, 300)); 
        
        const res = await getAccounts(page, search);
        
        if (Array.isArray(res.data.customers)) {
          setAccounts(res.data.customers);
          setTotalPages(res.data.totalPages);
          setTotalCustomers(res.data.totalCustomers);
          setPage(res.data.currentPage);
        } else {
          toast.error('Could not find customer data.');
          setAccounts([]);
        }

      } catch (err) {
        toast.error('Failed to load accounts: ' + err.message);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      try {
        await deleteAccount(id);
        setAccounts((prev) => prev.filter((acc) => acc._id !== id));
        toast.success('Account deleted successfully.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete account.');
      }
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
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''}`}>
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
          <Link
            to="/app/accounts/add"
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-m font-medium whitespace-nowrap"
          >
            <IconPlus className="text-neutral-800 dark:text-neutral-200"/>
            <span>New Customer</span>
          </Link>
        </div>
      </div>

      {/* --- 2. WRAP THE DYNAMIC CONTENT IN AnimatePresence --- */}
      <AnimatePresence mode="wait">
        {loading ? (
          // --- SKELETON LOADER (with exit animation) ---
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="shadow-input rounded-2xl bg-white p-4 dark:bg-black"
          >
            <TableSkeleton />
          </motion.div>
        ) : (
          // --- DATA TABLE / EMPTY MESSAGE (with entry animation) ---
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
          >
            {accounts.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                {search ? `No customers found matching "${search}".` : "No customers created yet."}
              </div>
            ) : (
              <div className="shadow-input rounded-2xl bg-white dark:bg-black">
                <Table>
                  <TableCaption>
                    {`Showing ${accounts.length} of ${totalCustomers} customers.`}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/app/customer/${account._id}`}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 text-white text-xs rounded-md"
                            >
                              <IconEye className="text-neutral-800 dark:text-neutral-200"/>
                            </Link>
                            <Link
                              to={`/app/customer/update/${account._id}`}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 text-white text-xs rounded-md"
                            >
                              <IconEdit className="text-neutral-800 dark:text-neutral-200"/>
                            </Link>
                            {user?.role === 'owner' && (
                              <button
                                onClick={() => handleDelete(account._id)}
                                className="flex items-center justify-center gap-1 px-3 py-1.5 text-white text-xs rounded-md hover:cursor-p"
                              >
                                <IconTrashFilled className="text-neutral-800 dark:text-neutral-200"/>
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

      
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-md disabled:opacity-50"
          >
            <IconCircleArrowLeftFilled className="text-neutral-800 dark:text-neutral-200 h-10 w-10"/>
          </button>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-md disabled:opacity-50"
          >
            <IconCircleArrowRightFilled className="text-neutral-800 dark:text-neutral-200 h-10 w-10"/>
          </button>
        </div>
      )}
    </div>
  );
}