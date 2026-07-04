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