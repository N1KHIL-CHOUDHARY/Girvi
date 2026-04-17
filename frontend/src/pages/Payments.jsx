import { useState, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getFinancialReport } from '../services/api';
import toast from 'react-hot-toast';
import {
  IconReportMoney, IconCurrencyRupee, IconCircleCheck,
  IconAlertTriangle, IconChevronLeft, IconChevronRight, IconSearch,
} from '@tabler/icons-react';
import { Input } from '../components/ui/Input';

const currency = (v = 0) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function Payments() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['financial-report', page, search],
    queryFn: () => getFinancialReport(page, search),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    onError: (err) => toast.error(err.message || t('payments.failedToLoadReport')),
  });

  const rows = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalItems = data?.meta?.totalItems || 0;

  const totals = useMemo(() => rows.reduce(
    (acc, row) => {
      acc.outstanding += Number(row.loan_amount || 0);
      acc.principal   += Number(row.total_principal_paid || 0);
      acc.interest    += Number(row.total_interest_paid || 0);
      return acc;
    },
    { outstanding: 0, principal: 0, interest: 0 }
  ), [rows]);

  const goToPage = (n) => { if (n >= 1 && n <= totalPages) setPage(n); };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  return (
    <div style={{ padding: 'var(--page-py) var(--page-px)' }}>

      {/* Header */}
      <div className="pm-page-header">
        <div className="pm-page-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <IconReportMoney size={20} style={{ color: 'var(--brand)' }} />
            <h1 className="pm-section-title">{t('payments.title')}</h1>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <SummaryCard title={t('payments.totalOutstanding')}        value={currency(totals.outstanding)} />
        <SummaryCard title={t('payments.totalPrincipalCollected')} value={currency(totals.principal)}   />
        <SummaryCard title={t('payments.totalInterestCollected')}  value={currency(totals.interest)}    />
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem', maxWidth: '18rem' }}>
        <div className="pm-search-wrap">
          <IconSearch size={14} className="pm-search-icon" />
          <Input
            type="text"
            placeholder={t('payments.searchByTicket')}
            value={search}
            onChange={handleSearch}
            className="pm-input pm-search-input"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div style={{ display: 'none' }} className="pm-desk-table">
        <style>{`@media(min-width:768px){.pm-desk-table{display:block!important}.pm-mob-cards{display:none!important}}`}</style>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>{t('loans.ticketNumber')}</th>
                <th>{t('loans.customer')}</th>
                <th>{t('loans.status')}</th>
                <th>{t('payments.originalLoan')}</th>
                <th>{t('payments.principalPaid')}</th>
                <th>{t('payments.interestPaid')}</th>
                <th>{t('payments.balanceDue')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {t('common.loading')}
                  </td>
                </tr>
              ) : !rows.length ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {search ? t('payments.noTicketsMatchingSearch', { search }) : t('payments.noData')}
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row._id}>
                  <td className="pm-td-primary">{row.ticket_number}</td>
                  <td>{Array.isArray(row.customer_name) ? row.customer_name[0] : row.customer_name || '—'}</td>
                  <td><StatusPill status={row.status} /></td>
                  <td>{currency(row.original_loan_amount)}</td>
                  <td>{currency(row.total_principal_paid)}</td>
                  <td>{currency(row.total_interest_paid)}</td>
                  <td>
                    <span className="pm-badge pm-badge-defaulted" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <IconCurrencyRupee size={12} />
                      {Number(row.loan_amount || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <Link to={`/app/pawns/${row._id}`} style={{ color: 'var(--brand)', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none' }}>
                      {t('customers.view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && totalItems > 0 && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {t('payments.showingOfTotal', { shown: rows.length, total: totalItems })}
          </p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="pm-mob-cards" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {isLoading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="pm-card">
              {[1,2,3].map(j => <div key={j} className="pm-skeleton" style={{ height: '1rem', marginBottom: '0.75rem', width: j===1?'60%':j===2?'40%':'80%' }} />)}
            </div>
          ))
        ) : !rows.length ? (
          <div className="pm-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {search ? t('payments.noTicketsMatchingSearch', { search }) : t('payments.noData')}
          </div>
        ) : rows.map((row) => (
          <div key={row._id} className="pm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{t('loans.ticketNumberLabel')}</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{row.ticket_number}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {Array.isArray(row.customer_name) ? row.customer_name[0] : row.customer_name || '—'}
                </p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {[
                [t('payments.originalLoan'), currency(row.original_loan_amount)],
                [t('payments.principalPaid'), currency(row.total_principal_paid)],
                [t('payments.interestPaid'), currency(row.total_interest_paid)],
              ].map(([label, val]) => (
                <div key={label}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</p>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</p>
                </div>
              ))}
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{t('payments.balanceDue')}</p>
                <span className="pm-badge pm-badge-defaulted" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <IconCurrencyRupee size={12} />
                  {Number(row.loan_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to={`/app/pawns/${row._id}`} style={{ color: 'var(--brand)', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none' }}>
                {t('customers.view')}
              </Link>
            </div>
          </div>
        ))}
        {!isLoading && totalItems > 0 && (
          <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {t('payments.showingOfTotal', { shown: rows.length, total: totalItems })}
          </p>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="pm-pagination" style={{ marginTop: '1.5rem' }}>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="pm-btn pm-btn-secondary pm-btn-sm"
            style={{ gap: '0.25rem' }}
          >
            <IconChevronLeft size={15} /> Prev
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {t('customers.pageOf', { page, total: totalPages })}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="pm-btn pm-btn-secondary pm-btn-sm"
            style={{ gap: '0.25rem' }}
          >
            Next <IconChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

const SummaryCard = memo(function SummaryCard({ title, value }) {
  return (
    <div className="pm-stat">
      <p className="pm-stat-label">{title}</p>
      <p className="pm-stat-value" style={{ fontSize: '1.375rem' }}>{value}</p>
    </div>
  );
});

const StatusPill = memo(function StatusPill({ status }) {
  const cls = status === 'settled' ? 'pm-badge pm-badge-settled'
    : status === 'defaulted' ? 'pm-badge pm-badge-defaulted'
    : 'pm-badge pm-badge-active';
  const icon = status === 'settled' ? <IconCircleCheck size={12} />
    : status === 'defaulted' ? <IconAlertTriangle size={12} /> : null;
  return (
    <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {icon}{status || '—'}
    </span>
  );
});