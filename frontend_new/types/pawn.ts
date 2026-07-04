import { Customer } from './customer';

export type PawnStatus = 'active' | 'redeemed' | 'renewed' | 'forfeited' | 'expired';

export interface PawnItem {
  id: string;
  category: 'jewelry' | 'electronics' | 'watch' | 'automotive' | 'other';
  description: string;
  serialNumber?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  estimatedValue: number;
  weightInGrams?: number;
  images: string[];
}

export interface PawnTicket {
  id: string;
  ticketNumber: string;
  customer: Customer | string;
  items: PawnItem[];
  loanAmount: number;
  interestRate: number;
  monthlyFinancingFee: number;
  issueDate: string;
  expiryDate: string;
  status: PawnStatus;
  notes?: string;
  shopId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}