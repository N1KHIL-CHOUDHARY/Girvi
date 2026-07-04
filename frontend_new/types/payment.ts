export type PaymentType = 'interest' | 'redemption' | 'renewal' | 'principal_payment';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'digital_wallet';

export interface Payment {
  id: string;
  pawnTicketId: string;
  receiptNumber: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  processedBy: string;
  transactionDate: string;
  notes?: string;
  createdAt: string;
}