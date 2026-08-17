export interface AddressInput {
  line1?: string | null;
  city?: string | null;
  pincode?: string | null;
}

export interface CreateCustomerInput {
  full_name: string;
  phone_number: string;
  gender?: 'Male' | 'Female' | 'Other' | string | null;
  customer_photo_url?: string | null;
  aadhaar_number?: string | null;
  pan_number?: string | null;
  address?: AddressInput | null;
  dateOfBirth?: string | Date | null;
  occupation?: string | null;
  nominee_name?: string | null;
  nominee_phone?: string | null;
  nominee_relation?: string | null;
  notes?: string | null;
  customerCode?: string | null;
  kycStatus?: 'pending' | 'verified' | 'rejected' | string | null;
}

export interface UpdateCustomerInput {
  full_name?: string;
  phone_number?: string;
  gender?: 'Male' | 'Female' | 'Other' | string | null;
  customer_photo_url?: string | null;
  aadhaar_number?: string | null;
  pan_number?: string | null;
  address?: AddressInput | null;
  dateOfBirth?: string | Date | null;
  occupation?: string | null;
  nominee_name?: string | null;
  nominee_phone?: string | null;
  nominee_relation?: string | null;
  notes?: string | null;
  customerCode?: string | null;
  kycStatus?: 'pending' | 'verified' | 'rejected' | string | null;
}

export interface CustomerFilterParams {
  page: number;
  limit: number;
  search?: string;
}

export interface CustomerStatsSummary {
  total_loan_value: number;
  totalActiveLoan: number;
  total_active_loan: number;
  totalLoanValue: number;
  total_tickets: number;
  totalTickets: number;
  active_tickets: number;
  activeTickets: number;
  total_interest_paid: number;
  totalInterestPaid: number;
  total_principal_paid: number;
  totalPrincipalPaid: number;
}

export interface CustomerPaymentBreakdown {
  payment_for: string;
  total_paid: number;
}

export interface CustomerStatsResult extends CustomerStatsSummary {
  stats: CustomerStatsSummary;
  payments: CustomerPaymentBreakdown[];
}

export interface CustomerListItem {
  id: string;
  full_name: string;
  phone_number: string;
  gender: string | null;
  customer_photo_url: string | null;
  customerCode: string | null;
  kycStatus: string;
  address: {
    line1: string;
    city: string;
    pincode: string;
  };
  aadhaar_last4: string | null;
  pan_last4: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetailsResponse {
  id: string;
  full_name: string;
  phone_number: string;
  gender: string | null;
  customer_photo_url: string | null;
  aadhaar_number: string | null;
  pan_number: string | null;
  address: {
    line1: string;
    city: string;
    pincode: string;
  };
  dateOfBirth: string | null;
  occupation: string | null;
  nominee_name: string | null;
  nominee_phone: string | null;
  nominee_relation: string | null;
  notes: string | null;
  customerCode: string | null;
  kycStatus: string;
  kycVerifiedAt: string | null;
  shopId: string;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
