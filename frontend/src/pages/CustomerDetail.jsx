import React,{ useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAccountById, getPawnTicketsByAccountId } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { IconEye, IconPlus, IconEdit } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { cn } from '../lib/utils';

// A simple component for displaying key stats
const StatCard = ({ title, value }) => (
  <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black">
    <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
    <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{value}</p>
  </div>
);

export default function CustomerDetail() {
  const { id } = useParams(); // Get customer ID from URL
  const [customer, setCustomer] = useState(null);
  const [pawns, setPawns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  // Fetch customer details and pawn tickets
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customerRes, pawnRes] = await Promise.all([
          getAccountById(id),
          getPawnTicketsByAccountId(id)
        ]);
        
        setCustomer(customerRes.data);
        setPawns(pawnRes.data.tickets);
        
      } catch (error) {
        toast.error('Failed to load customer data.');
        setCustomer(null);
        setPawns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- Calculate Analytics ---
  const stats = React.useMemo(() => {
    if (!pawns || pawns.length === 0) {
      return { totalLoan: 0, activeLoan: 0, activeTickets: 0 };
    }
    
    const totalLoan = pawns.reduce((acc, ticket) => acc + ticket.loan_amount, 0);
    const activeTickets = pawns.filter(t => t.status === 'active');
    const activeLoan = activeTickets.reduce((acc, ticket) => acc + ticket.loan_amount, 0);

    return { totalLoan, activeLoan, activeTickets: activeTickets.length };
  }, [pawns]);
  // ---------------------------

  if (loading) {
    return <div>Loading Customer...</div>; // TODO: Add Skeleton
  }

  if (!customer) {
    return <div>Customer not found.</div>;
  }
  
  const statusClass = (status) => {
    // (Same statusClass function from AllPawns.jsx)
    return status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      
      {/* 1. Customer Info Card */}
      <div className="shadow-input rounded-2xl bg-white p-6 md:p-8 dark:bg-black mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={customer.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${customer.full_name}`}
            alt={customer.full_name}
            className="w-32 h-32 rounded-full object-cover border-4 border-neutral-200 dark:border-neutral-700"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">{customer.full_name}</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">{customer.phone_number}</p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {customer.address?.line1} {customer.address?.city}, {customer.address?.pincode}
            </p>
            <div className="mt-4">
              <Link
                to={`/app/accounts/update/${customer._id}`}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-blue-600 text-white font-medium"
              >
                <IconEdit size={16} />
                <span>Edit Customer</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customer Analytics */}
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
        Customer Analytics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Total Loan Value" 
          value={`₹${stats.totalLoan.toLocaleString('en-IN')}`} 
        />
        <StatCard 
          title="Total Active Loan" 
          value={`₹${stats.activeLoan.toLocaleString('en-IN')}`} 
        />
        <StatCard 
          title="Active Pawn Tickets" 
          value={stats.activeTickets} 
        />
      </div>

      {/* 3. Pawn Ticket History */}
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
        Pawn Ticket History
      </h2>
      <div className="shadow-input rounded-2xl bg-white dark:bg-black">
        <Table>
          <TableCaption>A list of all pawn tickets for {customer.full_name}.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Item(s)</TableHead>
              <TableHead>Loan Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pawns.map((pawn) => (
              <TableRow key={pawn._id}>
                <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">
                  {pawn.ticket_number}
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-400">
                  {pawn.items[0]?.name}
                  {pawn.items.length > 1 && ` (+${pawn.items.length - 1})`}
                </TableCell>
                <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">
                  {`₹${pawn.loan_amount.toLocaleString('en-IN')}`}
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-400">
                  {new Date(pawn.pawned_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusClass(pawn.status))}>
                    {pawn.status.charAt(0).toUpperCase() + pawn.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/app/pawns/${pawn._id}`}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-md"
                  >
                    <IconEye className="text-neutral-800 dark:text-neutral-200"/>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}