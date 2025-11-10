import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAccountById, getPawnTicketsByAccountId, getAccountStats } from '../services/api';
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

// StatCard for Analytics
const StatCard = ({ title, value }) => (
  <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black">
    <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
    <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{value}</p>
  </div>
);

// Skeleton for loading state
const CustomerDetailSkeleton = () => (
  <div className="p-4 md:p-6 min-h-screen">
    <div className="shadow-input rounded-2xl bg-white p-6 md:p-8 dark:bg-black mb-6 animate-pulse">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-neutral-800"></div>
        <div className="flex-1 text-center md:text-left">
          <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-800 rounded-md mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-800 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-neutral-800 rounded-md"></div>
        </div>
      </div>
    </div>
    <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-800 rounded-md mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black h-24 animate-pulse"></div>
      <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black h-24 animate-pulse"></div>
      <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black h-24 animate-pulse"></div>
    </div>
  </div>
);

export default function CustomerDetail() {
  const { id } = useParams(); // Get customer ID from URL
  const [customer, setCustomer] = useState(null);
  const [pawns, setPawns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [customerRes, pawnRes, statsRes] = await Promise.all([
          getAccountById(id),
          getPawnTicketsByAccountId(id),
          getAccountStats(id)
        ]);
        
        setCustomer(customerRes.data);
        setPawns(pawnRes.data.tickets);
        setStats(statsRes.data.stats);
        
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

  if (loading) {
    return <CustomerDetailSkeleton />;
  }

  if (!customer) {
    return <div>Customer not found.</div>;
  }
  
  return (
    <AnimatePresence>
      <motion.div 
        key="customer-detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
        className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''}`}
      >
        
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
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
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
            title="Total Loan Value (Lifetime)" 
            value={`₹${stats?.total_loan_value.toLocaleString('en-IN') || 0}`} 
          />
          <StatCard 
            title="Total Active Loan" 
            value={`₹${stats?.total_active_loan.toLocaleString('en-IN') || 0}`} 
          />
          <StatCard 
            title="Active Pawn Tickets" 
            value={stats?.active_tickets || 0} 
          />
        </div>

        {/* 3. Pawn Ticket History */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            Pawn Ticket History
          </h2>
          <Link
            to="/app/pawn/add" // Link to the New Pawn page
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-md font-medium text-neutral-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <IconPlus className="text-neutral-800 dark:text-neutral-200"/>
            <span>New Ticket</span>
          </Link>
        </div>
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
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pawns.length > 0 ? pawns.map((pawn) => (
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
                  <TableCell className="text-center">
                    <Link
                      to={`/app/pawn  /${pawn._id}`}
                      className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 w-full"
                    >
                      <IconEye className="text-indigo-500 w-5 h-5"/>
                    </Link>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-500 dark:text-neutral-400 py-10">
                    This customer has no pawn tickets.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}