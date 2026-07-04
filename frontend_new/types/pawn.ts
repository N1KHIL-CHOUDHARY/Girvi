export type PawnTicketStatus = "active" | "settled" | "defaulted";

export interface PawnTicketItemRecord {
  id: string;
  name: string;
  type: string;
  weight_grams: string;
  purity: string | null;
  description?: string | null;
  item_photo_url?: string | null;
}

export interface PawnTicketCustomerSummary {
  id: string;
  full_name: string;
  phone_number: string;
  address?: {
    line1?: string;
    city?: string;
    pincode?: string;
  };
}

export interface PawnTicketRecord {
  id: string;
  customer_id: string;
  ticket_number: string;
  loan_amount: string;
  original_loan_amount: string;
  interest_rate: string;
  adv_amount: string;
  pawned_date: string;
  status: PawnTicketStatus;
  settled_date?: string | null;
  items: PawnTicketItemRecord[];
  customer?: PawnTicketCustomerSummary;
}

export interface PawnTicketListResponse {
  tickets: PawnTicketRecord[];
  totalPawnTickets: number;
  totalPages: number;
  currentPage: number;
}

export interface PawnItemInput {
  name: string;
  type?: string;
  weight_grams: string | number;
  purity?: string | number | null;
  description?: string;
  item_photo_url?: string;
}

export interface PawnTicketCreatePayload {
  customer_id: string;
  ticket_number: string;
  loan_amount: string | number;
  interest_rate: string | number;
  adv_amount: string | number;
  pawned_date?: string;
  items: PawnItemInput[];
}

export interface PawnTicketUpdatePayload {
  ticket_number?: string;
  loan_amount?: string | number;
  interest_rate?: string | number;
  adv_amount?: string | number;
  pawned_date?: string;
  status?: PawnTicketStatus;
  items?: PawnItemInput[];
}
