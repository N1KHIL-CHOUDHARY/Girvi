import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api'; // Correct import
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from '../components/DarkModeToggle';
import GenderPieChart from '../components/GenderPieChart'; 
import AreaBarChart from '../components/AreaPieChart'; 

// A simple component for displaying key stats
const StatCard = ({ title, value }) => (
  <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black">
    <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
    <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{value}</p>
  </div>
);

const RecentActivity = ({ activities }) => (
  <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black">
    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
      Recent Activity
    </h3>
    <div className="space-y-3">
      {activities.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No recent activity.</p>
      ) : (
        activities.map((activity) => (
          <div key={activity._id} className="text-sm">
            <p className="text-neutral-800 dark:text-neutral-200">{activity.message}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme(); 
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats(); // Fetch real data
        setDashboardData(res.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Runs once on page load

  if (loading) {
    return (
      <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
        Loading Dashboard...
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Could not load dashboard data.</div>;
  }

  // Destructure the real data from the API
  const { stats, gender_data, area_data, top_customers, recent_activity } = dashboardData;

  return (
    <div className={`p-4 md:p-6 space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
          Welcome, {user?.full_name}!
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Toggle Theme:</span>
          <DarkModeToggle />
        </div>
      </div>

      {/* 1. Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Active Loan" 
          value={`₹${stats.total_loan_active.toLocaleString('en-IN')}`} 
        />
        <StatCard 
          title="Loan Given (Last 30 Days)" 
          value={`₹${stats.monthly_loan_given.toLocaleString('en-IN')}`} 
        />
        <StatCard 
          title="Active Pawn Tickets" 
          value={stats.total_active_tickets} 
        />
      </div>

      {/* 2. Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenderPieChart data={gender_data} />
        <AreaBarChart data={area_data} />
      </div>

      {/* 3. Lists (Top Customers & Recent Activity) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Top Customers
          </h3>
          <div className="space-y-3">
            {top_customers.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No customer data yet.</p>
            ) : (
              top_customers.map((customer) => (
                <div key={customer._id} className="flex justify-between items-center text-sm">
                  <p className="text-neutral-800 dark:text-neutral-200">{customer.full_name}</p>
                  <p className="font-medium text-neutral-600 dark:text-neutral-300">
                    ₹{customer.total_loan.toLocaleString('en-IN')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <RecentActivity activities={recent_activity} />
      </div>
    </div>
  );
}