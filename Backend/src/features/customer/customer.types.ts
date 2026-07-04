export interface CustomerAddressInput {
  line1?: string;
  city?: string;
  pincode?: string;
}

export interface CustomerBody {
  full_name: string;
  phone_number: string;
  address?: CustomerAddressInput;
  gender?: 'Male' | 'Female' | 'Other';
  customer_photo_url?: string;
  aadhaar_number?: string;
  pan_number?: string;
}

export interface CustomerQuery {
  page?: string;
  limit?: string;
  search?: string;
}

export interface CustomerParams {
  id: string;
}

export interface CustomerListItem {
  id: string;
  full_name: string;
  phone_number: string;
  address?: CustomerAddressInput;
  gender?: 'Male' | 'Female' | 'Other' | null;
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
  customers: CustomerListItem[];
  totalCustomers: number;
  totalPages: number;
  currentPage: number;
}
