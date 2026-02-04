import React, { lazy, Suspense, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const GenderPieChart = lazy(() => import('../components/GenderPieChart'));
const AreaBarChart = lazy(() => import('../components/AreaPieChart'));

const StatCardSkeleton = () => (
  <div className="shadow-input rounded-2xl app-surface p-4 animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>
    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
  </div>
);

const StatCard = memo(function StatCard({ title, value, icon, trend, isLoading }) {
  if (isLoading) return <StatCardSkeleton />;
  return (
    <div className="shadow-input rounded-2xl app-surface p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-blue-500/20">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-app-secondary">{title}</p>
        {icon && <span className="text-blue-500 text-xl">{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-app-primary mb-1">{value}</p>
      {trend != null && (
        <p className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </p>
      )}
    </div>
  );
});

// List skeleton loader
const ListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const RecentActivity = memo(function RecentActivity({ activities, isLoading }) {
  return (
  <div className="shadow-input rounded-2xl app-surface p-5 transition-all duration-300 hover:shadow-lg">
    <h3 className="text-lg font-semibold text-app-primary mb-4 flex items-center gap-2">
      <span className="text-xl">📋</span>
      Recent Activity
    </h3>
    <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
      {isLoading ? (
        <ListSkeleton />
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-app-secondary">No recent activity.</p>
        </div>
      ) : (
        activities.map((activity, idx) => (
          <div 
            key={activity._id} 
            className="pb-3 border-b border-gray-200 last:border-b-0 transition-colors hover:bg-gray-50 p-2 rounded-lg"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <p className="text-sm text-app-primary font-medium mb-1">{activity.message}</p>
            <p className="text-xs text-app-secondary">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
  );
});

const TopCustomers = memo(function TopCustomers({ customers, isLoading }) {
  return (
  <div className="shadow-input rounded-2xl app-surface p-5 transition-all duration-300 hover:shadow-lg">
    <h3 className="text-lg font-semibold text-app-primary mb-4 flex items-center gap-2">
      <span className="text-xl">👥</span>
      Top Customers
    </h3>
    <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
      {isLoading ? (
        <ListSkeleton />
      ) : customers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-app-secondary">No customer data yet.</p>
        </div>
      ) : (
        customers.map((customer, idx) => (
          <div 
            key={customer._id} 
            className="flex justify-between items-center text-sm pb-3 border-b border-gray-200 last:border-b-0 transition-colors hover:bg-gray-50 p-2 rounded-lg"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
                {idx + 1}
              </span>
              <p className="text-app-primary font-medium">{customer.full_name}</p>
            </div>
            <p className="font-semibold text-app-primary">
              ₹{(customer.total_loan || 0).toLocaleString('en-IN')}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
  );
});

export default function Dashboard() {
  const { user } = useAuth();

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
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: () => toast.error('Failed to load dashboard data'),
  });

  // Show skeleton UI while loading
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-gray-300 rounded w-64 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="shadow-input rounded-2xl app-surface p-4 h-80 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-full bg-gray-200 rounded"></div>
          </div>
          <div className="shadow-input rounded-2xl app-surface p-4 h-80 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 rounded-2xl app-surface shadow-lg max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-app-primary mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-app-secondary mb-6">
            Could not load dashboard data. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, gender_data, area_data, top_customers, recent_activity } = dashboardData;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-app-primary mb-1">
            Welcome back, {user?.full_name}! 👋
          </h2>
          <p className="text-sm text-app-secondary">
            Here's what's happening with your business today
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Active Loan"
          value={`₹${(stats?.total_loan_active || 0).toLocaleString('en-IN')}`}
          icon="💰"
        />
        <StatCard
          title="Loan Given (Last 30 Days)"
          value={`₹${(stats?.monthly_loan_given || 0).toLocaleString('en-IN')}`}
          icon="📈"
        />
        <StatCard
          title="Active Pawn Tickets"
          value={stats?.total_active_tickets ?? 0}
          icon="🎫"
        />
      </div>

      {/* Charts: fixed height to prevent CLS, lazy-loaded */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="min-h-[320px] w-full transition-all duration-300 hover:scale-[1.01]">
          <Suspense
            fallback={
              <div className="shadow-input w-full rounded-2xl app-surface p-4 min-h-[320px] flex items-center justify-center">
                <div className="h-[250px] w-full max-w-sm rounded bg-gray-200 animate-pulse" />
              </div>
            }
          >
            <GenderPieChart data={gender_data || []} />
          </Suspense>
        </div>
        <div className="min-h-[320px] w-full transition-all duration-300 hover:scale-[1.01]">
          <Suspense
            fallback={
              <div className="shadow-input w-full rounded-2xl app-surface p-4 min-h-[320px] flex items-center justify-center">
                <div className="h-[250px] w-full max-w-sm rounded bg-gray-200 animate-pulse" />
              </div>
            }
          >
            <AreaBarChart data={area_data || []} />
          </Suspense>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopCustomers customers={top_customers || []} isLoading={false} />
        <RecentActivity activities={recent_activity || []} isLoading={false} />
      </div>
    </div>
  );
}