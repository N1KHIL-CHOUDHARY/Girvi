import React, { lazy, Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const GenderPieChart = lazy(() => import('../components/GenderPieChart'));
const AreaBarChart   = lazy(() => import('../components/AreaPieChart'));

/* ─── Skeletons ─────────────────────────────────────────── */
const StatSkeleton = () => (
  <div className="pm-stat pm-skeleton" style={{ minHeight: '5.5rem' }} />
);

const ChartSkeleton = () => (
  <div
    className="pm-card pm-skeleton"
    style={{ minHeight: '20rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  />
);

/* ─── Stat Card ─────────────────────────────────────────── */
const StatCard = memo(function StatCard({ title, value, isLoading }) {
  if (isLoading) return <StatSkeleton />;
  return (
    <div className="pm-stat">
      <p className="pm-stat-label">{title}</p>
      <p className="pm-stat-value">{value}</p>
    </div>
  );
});

/* ─── Loading Rows ──────────────────────────────────────── */
const ListSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
    {[1, 2, 3].map(i => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div className="pm-skeleton" style={{ height: '0.875rem', width: '70%', borderRadius: '4px' }} />
        <div className="pm-skeleton" style={{ height: '0.75rem', width: '45%', borderRadius: '4px' }} />
      </div>
    ))}
  </div>
);

/* ─── Recent Activity ───────────────────────────────────── */
const RecentActivity = memo(function RecentActivity({ activities, isLoading }) {
  const { t } = useTranslation();
  return (
    <div className="pm-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
        {t('dashboard.recentActivity')}
      </h3>
      <div style={{ maxHeight: '18rem', overflowY: 'auto' }}>
        {isLoading ? <ListSkeleton /> :
         activities.length === 0 ? (
          <div className="pm-empty" style={{ padding: '2rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {t('dashboard.noRecentActivity')}
            </p>
          </div>
        ) : activities.map(a => (
          <div
            key={a._id}
            style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, margin: '0 0 0.25rem' }}>
              {a.message}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: 0 }}>
              {new Date(a.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ─── Top Customers ─────────────────────────────────────── */
const TopCustomers = memo(function TopCustomers({ customers, isLoading }) {
  const { t } = useTranslation();
  return (
    <div className="pm-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
        {t('dashboard.topCustomers')}
      </h3>
      <div style={{ maxHeight: '18rem', overflowY: 'auto' }}>
        {isLoading ? <ListSkeleton /> :
         customers.length === 0 ? (
          <div className="pm-empty" style={{ padding: '2rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {t('dashboard.noCustomerDataYet')}
            </p>
          </div>
        ) : customers.map((c, idx) => (
          <div
            key={c._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0',
              borderBottom: '1px solid var(--border-default)',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
              }}>
                {idx + 1}
              </span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                {c.full_name}
              </p>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, flexShrink: 0 }}>
              ₹{(c.total_loan || 0).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ─── Dashboard (main) ──────────────────────────────────── */
export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: dashboardData, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await getDashboardStats()).data,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: () => toast.error(t('dashboard.failedToLoadDashboard')),
  });

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="pm-page" style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <div className="pm-skeleton" style={{ height: '2rem', width: '14rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatSkeleton /><StatSkeleton /><StatSkeleton />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <ChartSkeleton /><ChartSkeleton />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  /* Error state */
  if (isError || !dashboardData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '1.5rem' }}>
        <div className="pm-card" style={{ maxWidth: '24rem', width: '100%', textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div style={{
            width: '3.5rem', height: '3.5rem', borderRadius: '50%',
            background: 'var(--danger-light)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1.25rem',
          }}>
            <svg style={{ width: '1.75rem', height: '1.75rem', color: 'var(--danger-text)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('dashboard.somethingWentWrong')}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {t('dashboard.couldNotLoadDashboard')}
          </p>
          <button onClick={() => refetch()} className="pm-btn pm-btn-primary pm-btn-full pm-btn-lg">
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  const { stats, gender_data, area_data, top_customers, recent_activity } = dashboardData;

  return (
    <div className="pm-page" style={{ maxWidth: '80rem', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="pm-page-header">
        <h1 className="pm-section-title">
          {t('dashboard.welcomeBack', { name: user?.full_name })}
        </h1>
        <p className="pm-section-subtitle">{t('dashboard.whatsHappening')}</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: 'var(--section-gap)' }}>
        <StatCard title={t('dashboard.totalActiveLoan')}      value={`₹${(stats?.total_loan_active || 0).toLocaleString('en-IN')}`} />
        <StatCard title={t('dashboard.loanGivenLast30Days')}  value={`₹${(stats?.monthly_loan_given || 0).toLocaleString('en-IN')}`} />
        <StatCard title={t('dashboard.activePawnTickets')}    value={stats?.total_active_tickets ?? 0} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: 'var(--section-gap)' }}>
        <div style={{ minHeight: '20rem' }}>
          <Suspense fallback={<ChartSkeleton />}>
            <GenderPieChart data={gender_data || []} />
          </Suspense>
        </div>
        <div style={{ minHeight: '20rem' }}>
          <Suspense fallback={<ChartSkeleton />}>
            <AreaBarChart data={area_data || []} />
          </Suspense>
        </div>
      </div>

      {/* Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <TopCustomers customers={top_customers || []} isLoading={false} />
        <RecentActivity activities={recent_activity || []} isLoading={false} />
      </div>
    </div>
  );
}