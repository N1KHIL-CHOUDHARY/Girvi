export interface DashboardGenderDatum {
  gender: 'Male' | 'Female' | 'Other' | null;
  count: number;
}

export interface DashboardAreaDatum {
  pincode: string;
  count: number;
}

export interface DashboardTopCustomer {
  id: string;
  full_name: string;
  total_loan: string;
}

export interface DashboardActivity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user?: {
    full_name: string;
  } | null;
}

export interface DashboardStatsResponse {
  stats: {
    total_loan_active: string;
    monthly_loan_given: string;
    total_active_tickets: number;
  };
  gender_data: DashboardGenderDatum[];
  area_data: DashboardAreaDatum[];
  top_customers: DashboardTopCustomer[];
  recent_activity: DashboardActivity[];
}

export interface FinancialReportQuery {
  page?: string;
  limit?: string;
  search?: string;
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

export interface CustomerStatsResponse {
  stats: {
    total_loan_value: string;
    total_active_loan: string;
    total_tickets: number;
    active_tickets: number;
  };
  payments: {
    payment_for: 'interest' | 'principal';
    total_paid: string;
  }[];
}
