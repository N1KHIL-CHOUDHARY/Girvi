import React, { lazy, Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { IconWallet, IconCalendar, IconTicket, IconAlertTriangle } from '@tabler/icons-react';
import { cn } from '../lib/utils';

const GenderPieChart = lazy(() => import('../components/GenderPieChart'));
const AreaBarChart = lazy(() => import('../components/AreaPieChart'));

const StatCardSkeleton = () => (
  <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-white/5"></div>
      <div className="h-3 bg-zinc-200 dark:bg-white/5 rounded w-24"></div>
    </div>
    <div className="h-8 bg-zinc-200 dark:bg-white/5 rounded w-1/2"></div>
  </div>
);

const StatCard = memo(function StatCard({ title, value, isLoading, icon: Icon, colorClass }) {
  if (isLoading) return <StatCardSkeleton />;
  
  return (
    <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 shadow-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={cn("p-2 rounded-xl border border-white/10 shadow-sm", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{title}</p>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white relative z-10">{value}</p>
    </div>
  );
});

const ListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="animate-pulse flex items-center justify-between border-b border-zinc-100 dark:border-white/[0.02] pb-3">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-white/5 shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-3 bg-zinc-200 dark:bg-white/5 rounded w-1/2"></div>
            <div className="h-2 bg-zinc-200 dark:bg-white/5 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RecentActivity = memo(function RecentActivity({ activities, isLoading }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 md:p-8 shadow-sm h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
      <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-white mb-6 relative z-10">
        {t('dashboard.recentActivity')}
      </h3>
      <div className="space-y-4 max-h-80 overflow-y-auto scroll-contain relative z-10 pr-2">
        {isLoading ? (
          <ListSkeleton />
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('dashboard.noRecentActivity')}</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity._id} 
              className="pb-4 border-b border-zinc-100 dark:border-white/[0.05] last:border-b-0 last:pb-0 relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-[-1rem] last:before:bottom-0 before:w-[2px] before:bg-zinc-100 dark:before:bg-white/[0.05]"
            >
              <div className="absolute left-[-3px] top-2 w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 ring-4 ring-white dark:ring-[#121212]" />
              <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium mb-1 leading-snug">
                {activity.message}
              </p>
              <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
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
    <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 md:p-8 shadow-sm h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
      <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-white mb-6 relative z-10">
        {t('dashboard.topCustomers')}
      </h3>
      <div className="space-y-4 max-h-80 overflow-y-auto scroll-contain relative z-10 pr-2">
        {isLoading ? (
          <ListSkeleton />
        ) : customers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('dashboard.noCustomerDataYet')}</p>
          </div>
        ) : (
          customers.map((customer, idx) => (
            <div 
              key={customer._id} 
              className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-white/[0.05] last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.05] text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">
                  0{idx + 1}
                </span>
                <p className="text-sm text-zinc-900 dark:text-white font-medium">
                  {customer.full_name}
                </p>
              </div>
              <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
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
      <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A]">
        <div className="mb-8">
          <div className="h-8 bg-zinc-200 dark:bg-white/5 rounded-lg w-64 animate-pulse mb-2"></div>
          <div className="h-4 bg-zinc-200 dark:bg-white/5 rounded w-48 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 animate-pulse rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6">
            <div className="h-5 bg-zinc-200 dark:bg-white/5 rounded w-1/3 mb-4"></div>
            <div className="h-full bg-zinc-50 dark:bg-white/[0.02] rounded-xl"></div>
          </div>
          <div className="h-80 animate-pulse rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6">
            <div className="h-5 bg-zinc-200 dark:bg-white/5 rounded w-1/3 mb-4"></div>
            <div className="h-full bg-zinc-50 dark:bg-white/[0.02] rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A]">
        <div className="w-full max-w-md rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <IconAlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
          </div>
          <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white mb-2">
            {t('dashboard.somethingWentWrong')}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            {t('dashboard.couldNotLoadDashboard')}
          </p>
          <button
            onClick={() => refetch()}
            className="min-h-[44px] rounded-xl bg-zinc-900 dark:bg-white px-8 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  const { stats, gender_data, area_data, top_customers, recent_activity } = dashboardData;

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] font-sans">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-zinc-900 dark:text-white mb-2">
          {t('dashboard.welcomeBack', { name: user?.full_name })}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('dashboard.whatsHappening')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('dashboard.totalActiveLoan')}
          value={`₹${(stats?.total_loan_active || 0).toLocaleString('en-IN')}`}
          icon={IconWallet}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
        />
        <StatCard
          title={t('dashboard.loanGivenLast30Days')}
          value={`₹${(stats?.monthly_loan_given || 0).toLocaleString('en-IN')}`}
          icon={IconCalendar}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
        />
        <StatCard
          title={t('dashboard.activePawnTickets')}
          value={stats?.total_active_tickets ?? 0}
          icon={IconTicket}
          colorClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-100 dark:border-purple-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-h-[340px] w-full">
          <Suspense
            fallback={
              <div className="flex min-h-[340px] items-center justify-center rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 shadow-sm">
                <div className="h-64 w-full max-w-sm rounded-xl bg-zinc-50 dark:bg-white/[0.02] animate-pulse" />
              </div>
            }
          >
            <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 shadow-sm h-full relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
               <div className="relative z-10 h-full">
                 <GenderPieChart data={gender_data || []} />
               </div>
            </div>
          </Suspense>
        </div>
        <div className="min-h-[340px] w-full">
          <Suspense
            fallback={
              <div className="flex min-h-[340px] items-center justify-center rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 shadow-sm">
                <div className="h-64 w-full max-w-sm rounded-xl bg-zinc-50 dark:bg-white/[0.02] animate-pulse" />
              </div>
            }
          >
            <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 shadow-sm h-full relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
               <div className="relative z-10 h-full">
                 <AreaBarChart data={area_data || []} />
               </div>
            </div>
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCustomers customers={top_customers || []} isLoading={false} />
        <RecentActivity activities={recent_activity || []} isLoading={false} />
      </div>
    </div>
  );
}