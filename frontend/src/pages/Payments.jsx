import { useState, useMemo, memo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getFinancialReport } from '../services/api';
import toast from 'react-hot-toast';
import { IconReportMoney, IconCurrencyRupee, IconCircleCheck, IconAlertTriangle, IconCircleArrowLeftFilled, IconCircleArrowRightFilled, IconSearch } from '@tabler/icons-react';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

const currency = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const PaymentsTableSkeleton = () => (
  <div className="min-h-[320px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex gap-4 border-b border-neutral-100 pb-3 last:border-0">
          <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

export default function Payments() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['financial-report', page, search],
    queryFn: () => getFinancialReport(page, search),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    onError: (err) => toast.error(err.message || 'Failed to load financial report'),
  });

  const rows = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalItems = data?.meta?.totalItems || 0;

 
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.outstanding += Number(row.loan_amount || 0);
        acc.principal += Number(row.total_principal_paid || 0);
        acc.interest += Number(row.total_interest_paid || 0);
        return acc;
      },
      { outstanding: 0, principal: 0, interest: 0 }
    );
  }, [rows]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="min-h-[100dvh]">
      <div className="mb-6 flex items-center gap-2">
        <IconReportMoney className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-semibold text-neutral-900">Payments & Loan Portfolio</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard title="Total Outstanding Balance" value={currency(totals.outstanding)} />
        <SummaryCard title="Total Principal Collected" value={currency(totals.principal)} />
        <SummaryCard title="Total Interest Collected" value={currency(totals.interest)} />
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative w-full md:w-64">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search by ticket number..."
            value={search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm min-h-[320px]">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200">
                <th className="py-2 pr-4">Ticket #</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Original Loan</th>
                <th className="py-2 pr-4">Principal Paid</th>
                <th className="py-2 pr-4">Interest Paid</th>
                <th className="py-2 pr-4">Balance Due</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <div className="min-h-[280px] flex items-center justify-center text-neutral-400">Loading...</div>
                  </td>
                </tr>
              ) : !rows.length ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-neutral-500">
                    {search ? `No tickets found matching "${search}".` : 'No data.'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id} className="border-b border-neutral-100">
                    <td className="py-3 pr-4 font-semibold text-neutral-900">{row.ticket_number}</td>
                    <td className="py-3 pr-4">{Array.isArray(row.customer_name) ? row.customer_name[0] : row.customer_name || '—'}</td>
                    <td className="py-3 pr-4">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="py-3 pr-4">{currency(row.original_loan_amount)}</td>
                    <td className="py-3 pr-4">{currency(row.total_principal_paid)}</td>
                    <td className="py-3 pr-4">{currency(row.total_interest_paid)}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        <IconCurrencyRupee className="h-4 w-4" />
                        {Number(row.loan_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Link
                        to={`/app/pawns/${row._id}`}
                        className="text-blue-600 hover:underline text-sm font-semibold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && totalItems > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200 text-sm text-neutral-500">
            Showing {rows.length} of {totalItems} total tickets.
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <PaymentsTableSkeleton />
        ) : !rows.length ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center text-neutral-500 shadow-sm">
            {search ? `No tickets found matching "${search}".` : 'No data.'}
          </div>
        ) : (
          rows.map((row) => (
            <div key={row._id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-neutral-500">Ticket</p>
                  <p className="text-lg font-semibold text-neutral-900">{row.ticket_number}</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {Array.isArray(row.customer_name) ? row.customer_name[0] : row.customer_name || '—'}
                  </p>
                </div>
                <StatusPill status={row.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-neutral-600">
                <div>
                  <p className="text-xs text-neutral-500">Original Loan</p>
                  <p className="font-semibold text-neutral-900">{currency(row.original_loan_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Principal Paid</p>
                  <p className="font-semibold text-neutral-900">{currency(row.total_principal_paid)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Interest Paid</p>
                  <p className="font-semibold text-neutral-900">{currency(row.total_interest_paid)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Balance Due</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    <IconCurrencyRupee className="h-4 w-4" />
                    {Number(row.loan_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  to={`/app/pawns/${row._id}`}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View
                </Link>
              </div>
            </div>
          ))
        )}
        {!isLoading && totalItems > 0 && (
          <div className="text-sm text-neutral-500 text-center">
            Showing {rows.length} of {totalItems} total tickets.
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-md disabled:opacity-50"
          >
            <IconCircleArrowLeftFilled
              className={cn(
                'h-10 w-10',
                page === 1
                  ? 'text-gray-400'
                  : 'text-neutral-800'
              )}
            />
          </button>
          <span className="text-sm text-neutral-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-md disabled:opacity-50"
          >
            <IconCircleArrowRightFilled
              className={cn(
                'h-10 w-10',
                page === totalPages
                  ? 'text-gray-400'
                  : 'text-neutral-800'
              )}
            />
          </button>
        </div>
      )}
    </div>
  );
}

const SummaryCard = memo(function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm min-h-[80px]">
      <p className="text-xs text-neutral-500">{title}</p>
      <p className="mt-2 text-lg font-semibold text-neutral-800">{value}</p>
    </div>
  );
});

const StatusPill = memo(function StatusPill({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-800',
    settled: 'bg-blue-100 text-blue-800',
    defaulted: 'bg-red-100 text-red-800',
  };
  const labelIcon = status === 'settled' ? <IconCircleCheck className="h-4 w-4" /> : status === 'defaulted' ? <IconAlertTriangle className="h-4 w-4" /> : null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || 'bg-neutral-100 text-neutral-800'}`}>
      {labelIcon}
      {status || '—'}
    </span>
  );
});

