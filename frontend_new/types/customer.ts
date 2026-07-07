import type { CustomerGender } from "@/types/dashboard";

export interface CustomerAddress {
  line1?: string;
  city?: string;
  pincode?: string;
}

export interface CustomerListItem {
  id: string;
  full_name: string;
  phone_number: string;
  address?: CustomerAddress;
  gender?: CustomerGender | null;
  customer_photo_url?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail extends CustomerListItem {
  aadhaar_number?: string | null;
  pan_number?: string | null;
  shopId: string;
  createdByUserId?: string | null;
}

export interface CustomerListResponse {
  items: CustomerListItem[];
  total: number;
  totalPages: number;
  page: number;
}

export interface CustomerAddressInput {
  line1?: string;
  city?: string;
  pincode?: string;
}

export interface CustomerCreatePayload {
  full_name: string;
  phone_number: string;
  address?: CustomerAddressInput;
  gender?: CustomerGender;
  customer_photo_url?: string;
  aadhaar_number?: string;
  pan_number?: string;
}

export interface CustomerUpdatePayload {
  full_name?: string;
  phone_number?: string;
  address?: CustomerAddressInput;
  gender?: CustomerGender;
  customer_photo_url?: string;
  aadhaar_number?: string;
  pan_number?: string;
}

export interface CustomerStats {
  total_loan_value: string;
  total_active_loan: string;
  total_tickets: number;
  active_tickets: number;
}

export interface CustomerPaymentStat {
  payment_for: "interest" | "principal";
  total_paid: string;
}

export interface CustomerStatsResponse {
  stats: CustomerStats;
  payments: CustomerPaymentStat[];
}
