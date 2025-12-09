import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getFinancialReport } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { IconReportMoney, IconCurrencyRupee, IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react';

const currency = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function Payments() {
  const { isDarkMode } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ['financial-report'],
    queryFn: getFinancialReport,
    onError: (err) => toast.error(err.message || 'Failed to load financial report'),
  });

  const rows = data?.data || [];

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

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''} pt-20 md:pt-4`}>
      <div className="mb-6 flex items-center gap-2">
        <IconReportMoney className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Payments & Loan Portfolio</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard title="Total Outstanding Balance" value={currency(totals.outstanding)} accent="bg-blue-50 text-blue-800" />
        <SummaryCard title="Total Principal Collected" value={currency(totals.principal)} accent="bg-green-50 text-green-800" />
        <SummaryCard title="Total Interest Collected" value={currency(totals.interest)} accent="bg-amber-50 text-amber-800" />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
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
                  <td colSpan={8} className="py-4 text-center text-neutral-500">Loading...</td>
                </tr>
              ) : !rows.length ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-neutral-500">No data.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">{row.ticket_number}</td>
                    <td className="py-3 pr-4">{Array.isArray(row.customer_name) ? row.customer_name[0] : row.customer_name || '—'}</td>
                    <td className="py-3 pr-4">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="py-3 pr-4">{currency(row.original_loan_amount)}</td>
                    <td className="py-3 pr-4">{currency(row.total_principal_paid)}</td>
                    <td className="py-3 pr-4">{currency(row.total_interest_paid)}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-100">
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
      </div>
    </div>
  );
}

const SummaryCard = ({ title, value, accent }) => (
  <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
    <p className="text-xs text-neutral-500">{title}</p>
    <p className={`mt-2 text-lg font-semibold ${accent}`}>{value}</p>
  </div>
);

const StatusPill = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-100',
    settled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
    defaulted: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100',
  };
  const labelIcon = status === 'settled' ? <IconCircleCheck className="h-4 w-4" /> : status === 'defaulted' ? <IconAlertTriangle className="h-4 w-4" /> : null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100'}`}>
      {labelIcon}
      {status || '—'}
    </span>
  );
};

