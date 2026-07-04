export interface CustomerIdentity {
  type: 'passport' | 'driving_license' | 'national_id' | 'other';
  number: string;
  expiryDate?: string;
  scannedUrl?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  identity: CustomerIdentity;
  isFlagged: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}