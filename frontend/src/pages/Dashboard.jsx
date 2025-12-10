import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import GenderPieChart from '../components/GenderPieChart';
import AreaBarChart from '../components/AreaPieChart';
import { useQuery } from '@tanstack/react-query';

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

  // ✅ Replace useEffect + local state with useQuery
  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await getDashboardStats();
      return res.data;
    },
    // Optional: background refresh every 5 minutes while the tab is focused
    // refetchInterval: 5 * 60 * 1000,
    onError: () => toast.error('Failed to load dashboard data'),
  });

  if (isLoading) {
    return (
      <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
        Loading Dashboard...
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-3">Could not load dashboard data.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, gender_data, area_data, top_customers, recent_activity } = dashboardData;

  return (
    <div className={`p-4 md:p-6 space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
          Welcome, {user?.full_name}!
        </h2>
       
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Active Loan"
          value={`₹${(stats?.total_loan_active || 0).toLocaleString('en-IN')}`}
        />
        <StatCard
          title="Loan Given (Last 30 Days)"
          value={`₹${(stats?.monthly_loan_given || 0).toLocaleString('en-IN')}`}
        />
        <StatCard
          title="Active Pawn Tickets"
          value={stats?.total_active_tickets ?? 0}
        />
      </div>

      {/* 2. Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenderPieChart data={gender_data || []} />
        <AreaBarChart data={area_data || []} />
      </div>

      {/* 3. Lists (Top Customers & Recent Activity) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="shadow-input rounded-2xl bg-white p-4 dark:bg-black">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Top Customers
          </h3>
          <div className="space-y-3">
            {(top_customers || []).length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No customer data yet.</p>
            ) : (
              top_customers.map((customer) => (
                <div key={customer._id} className="flex justify-between items-center text-sm">
                  <p className="text-neutral-800 dark:text-neutral-200">{customer.full_name}</p>
                  <p className="font-medium text-neutral-600 dark:text-neutral-300">
                    ₹{(customer.total_loan || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <RecentActivity activities={recent_activity || []} />
      </div>
    </div>
  );
}
