import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPawnTickets, deletePawnTicket, updatePawnTicketStatus } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function AllPawns() {
  const [pawns, setPawns] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPawnTickets, setTotalPawnTickets] = useState(0);

  const [status, setStatus] = useState('active');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPawns = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // for smooth loading animation
        const res = await getPawnTickets(page, search);

        if (Array.isArray(res.data.tickets)) {
          setPawns(res.data.tickets);
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
  }, [page, search]);

  // ✅ Reset page when status filter changes
  useEffect(() => {
    setPage(1);
  }, [status]);

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

  // --- Settle Ticket Logic ---
  const openSettleModal = (id) => {
    setSelectedTicketId(id);
    setIsModalOpen(true);
  };

  const handleConfirmSettle = async () => {
    if (!selectedTicketId) return;

    try {
      await updatePawnTicketStatus(selectedTicketId, 'settled');
      toast.success('Ticket marked as settled.');
      setPawns(pawns.map(p =>
        p._id === selectedTicketId ? { ...p, status: 'settled' } : p
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to settle ticket.');
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

  // ✅ Filter pawns by selected status
  const filteredPawns =
    status === 'all'
      ? pawns
      : pawns.filter((p) => p.status.toLowerCase() === status.toLowerCase());

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* --- CONFIRMATION MODAL --- */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSettle}
        title="Settle Pawn Ticket"
        message="Are you sure this ticket is settled and the loan is closed?"
        confirmText="Yes, Settle"
      />

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
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-200 px-3 py-2 rounded-lg pr-8 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="settled">Settled</option>
            </select>
          </div>
          <Link
            to="/app/pawns/add"
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-md font-medium whitespace-nowrap text-neutral-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <IconPlus className="text-neutral-800 dark:text-neutral-200" />
            <span>New Ticket</span>
          </Link>
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
            key={status} // ✅ Animate when filter changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {filteredPawns.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                {search
                  ? `No ${status} tickets found matching "${search}".`
                  : `No ${status !== 'all' ? status : ''} pawn tickets found.`}
              </div>
            ) : (
              <div className="shadow-input rounded-2xl bg-white dark:bg-black overflow-hidden">
                <Table>
                  <TableCaption className="pb-4">
                    Showing {filteredPawns.length} of {totalPawnTickets} tickets.
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
                    {filteredPawns.map((pawn) => (
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
                            <Link
                              to={`/app/pawn/update/${pawn._id}`}
                              className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                            >
                              <IconEdit className="text-blue-500 w-5 h-5" />
                            </Link>

                            {user?.role === 'owner' && (
                              <button
                                onClick={() => handleDelete(pawn._id)}
                                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                              >
                                <IconTrashFilled className="text-red-500 w-5 h-5" />
                              </button>
                            )}

                            {user?.role === 'owner' && pawn.status === 'active' && (
                              <button
                                onClick={() => openSettleModal(pawn._id)}
                                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                title="Mark as Settled"
                              >
                                <IconCheck className="text-green-600 dark:text-green-500 w-5 h-5" />
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
              className={`h-10 w-10 ${page === 1
                ? 'text-gray-400 dark:text-neutral-700'
                : 'text-neutral-800 dark:text-neutral-200'}`}
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
              className={`h-10 w-10 ${page === totalPages
                ? 'text-gray-400 dark:text-neutral-700'
                : 'text-neutral-800 dark:text-neutral-200'}`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
