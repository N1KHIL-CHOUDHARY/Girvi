export type CustomerGender = "Male" | "Female" | "Other";

export interface DashboardGenderDatum {
  gender: CustomerGender | null;
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

export interface DashboardActivityUser {
  full_name: string;
}

export interface DashboardActivity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user?: DashboardActivityUser | null;
}

export interface DashboardStats {
  total_loan_active: string;
  monthly_loan_given: string;
  total_active_tickets: number;
}

export interface DashboardStatsResponse {
  stats: DashboardStats;
  gender_data: DashboardGenderDatum[];
  area_data: DashboardAreaDatum[];
  top_customers: DashboardTopCustomer[];
  recent_activity: DashboardActivity[];
}
