export interface PaymentBody {
  ticket_id: string;
  amount_paid: string | number;
  payment_for: 'interest' | 'principal';
  payment_date?: string;
}

export interface PaymentParams {
  ticketId: string;
}

export interface PaymentRecord {
  id: string;
  shop_id: string;
  customer_id: string;
  ticket_id: string;
  amount_paid: string;
  payment_for: 'interest' | 'principal';
  payment_date: string;
  createdAt: string;
  updatedAt: string;
}
