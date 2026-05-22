import React, { lazy, Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const GenderPieChart = lazy(() => import('../components/GenderPieChart'));
const AreaBarChart = lazy(() => import('../components/AreaPieChart'));

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const StatCard = memo(function StatCard({ title, value, isLoading }) {
  if (isLoading) return <StatCardSkeleton />;
  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <p className="text-2xl md:text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
});

const ListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const RecentActivity = memo(function RecentActivity({ activities, isLoading }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('dashboard.recentActivity')}
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto scroll-contain">
        {isLoading ? (
          <ListSkeleton />
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">{t('dashboard.noRecentActivity')}</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity._id} 
              className="pb-3 border-b border-gray-100 last:border-b-0"
            >
              <p className="text-sm text-gray-900 font-medium mb-1">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500">
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
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('dashboard.topCustomers')}
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto scroll-contain">
        {isLoading ? (
          <ListSkeleton />
        ) : customers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">{t('dashboard.noCustomerDataYet')}</p>
          </div>
        ) : (
          customers.map((customer, idx) => (
            <div 
              key={customer._id} 
              className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-900 font-medium">
                  {customer.full_name}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
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
  const { t } = useTranslation();
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
    onError: () => toast.error(t('dashboard.failedToLoadDashboard')),
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-full bg-gray-100 rounded"></div>
          </div>
          <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-full bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('dashboard.somethingWentWrong')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('dashboard.couldNotLoadDashboard')}
          </p>
          <button
            onClick={() => refetch()}
            className="min-h-[44px] rounded-xl bg-emerald-600 px-6 font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  const { stats, gender_data, area_data, top_customers, recent_activity } = dashboardData;

  return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          {t('dashboard.welcomeBack', { name: user?.full_name })}
        </h1>
        <p className="text-sm text-gray-600">
          {t('dashboard.whatsHappening')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={t('dashboard.totalActiveLoan')}
          value={`₹${(stats?.total_loan_active || 0).toLocaleString('en-IN')}`}
        />
        <StatCard
          title={t('dashboard.loanGivenLast30Days')}
          value={`₹${(stats?.monthly_loan_given || 0).toLocaleString('en-IN')}`}
        />
        <StatCard
          title={t('dashboard.activePawnTickets')}
          value={stats?.total_active_tickets ?? 0}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="min-h-[320px] w-full">
          <Suspense
            fallback={
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-64 w-full max-w-sm rounded bg-gray-100 animate-pulse" />
              </div>
            }
          >
            <GenderPieChart data={gender_data || []} />
          </Suspense>
        </div>
        <div className="min-h-[320px] w-full">
          <Suspense
            fallback={
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-64 w-full max-w-sm rounded bg-gray-100 animate-pulse" />
              </div>
            }
          >
            <AreaBarChart data={area_data || []} />
          </Suspense>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCustomers customers={top_customers || []} isLoading={false} />
        <RecentActivity activities={recent_activity || []} isLoading={false} />
      </div>
    </div>
  );
}