export interface PawnItemInput {
  name: string;
  type?: string;
  weight_grams: string | number;
  purity?: string | number | null;
  description?: string;
  item_photo_url?: string;
}

export interface PawnTicketBody {
  customer_id: string;
  ticket_number: string;
  loan_amount: string | number;
  interest_rate: string | number;
  adv_amount: string | number;
  pawned_date?: string;
  items: PawnItemInput[];
}

export interface PawnTicketUpdateBody {
  ticket_number?: string;
  loan_amount?: string | number;
  interest_rate?: string | number;
  adv_amount?: string | number;
  pawned_date?: string;
  status?: 'active' | 'settled' | 'defaulted';
  items?: PawnItemInput[];
}

export interface PawnTicketQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: 'active' | 'settled' | 'defaulted' | 'all';
}

export interface PawnTicketParams {
  id: string;
}

export interface CustomerPawnTicketsParams {
  id: string;
}

export interface PawnTicketItemRecord {
  id: string;
  name: string;
  type: string;
  weight_grams: string;
  purity: string | null;
  description?: string | null;
  item_photo_url?: string | null;
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
  status: 'active' | 'settled' | 'defaulted';
  settled_date?: string | null;
  items: PawnTicketItemRecord[];
  customer?: {
    id: string;
    full_name: string;
    phone_number: string;
    address?: {
      line1?: string;
      city?: string;
      pincode?: string;
    };
  };
}

export interface PawnTicketListResponse {
  tickets: PawnTicketRecord[];
  totalPawnTickets: number;
  totalPages: number;
  currentPage: number;
}
