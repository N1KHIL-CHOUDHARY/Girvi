export type ReportType = 'inventory' | 'transactions' | 'audit_log' | 'profit_loss';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  shopId?: string;
  status?: string;
}

export interface ReportMetadata {
  id: string;
  title: string;
  type: ReportType;
  generatedBy: string;
  generatedAt: string;
  fileUrl?: string;
}

export interface FinancialReportRow {
  id: string;
  ticket_number: string;
  status: 'active' | 'settled' | 'defaulted';
  original_loan_amount: string;
  loan_amount: string;
  total_interest_paid: string;
  total_principal_paid: string;
  customer_name: string;
}

export interface FinancialReportResponse {
  report: FinancialReportRow[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
}