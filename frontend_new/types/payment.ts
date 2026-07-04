export type PaymentFor = "interest" | "principal";

export interface PaymentRecord {
  id: string;
  shop_id: string;
  customer_id: string;
  ticket_id: string;
  amount_paid: string;
  payment_for: PaymentFor;
  payment_date: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCreatePayload {
  ticket_id: string;
  amount_paid: string | number;
  payment_for: PaymentFor;
  payment_date?: string;
}

export interface PaymentListResponse {
  payments: PaymentRecord[];
}
