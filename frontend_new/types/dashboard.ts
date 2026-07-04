export interface StatMetric {
  value: number;
  changePercentage: number;
  isPositiveTrend: boolean;
}

export interface DashboardStats {
  activeLoansCount: StatMetric;
  totalCapitalOut: StatMetric;
  monthlyRevenue: StatMetric;
  newCustomersCount: StatMetric;
}

export interface ChartDataPoint {
  label: string;
  amount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueChart: ChartDataPoint[];
  loanDistribution: ChartDataPoint[];
}