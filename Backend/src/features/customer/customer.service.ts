import { prisma } from '../../config/prisma';
import { ApiError } from '../../lib/errors';
import { encryptText, decryptText } from '../../lib/encryption';
import { logActivity } from '../../lib/activity';
import { parsePagination } from '../../lib/http';
import type { AuthSession } from '../auth/auth.types';
import type { CustomerAddressInput, CustomerBody, CustomerDetail, CustomerListItem, CustomerListResponse, CustomerQuery } from './customer.types';

const mapCustomerListItem = (customer: {
  id: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string | null;
  city: string | null;
  pincode: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  customerPhotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CustomerListItem => ({
  id: customer.id,
  full_name: customer.fullName,
  phone_number: customer.phoneNumber,
  address:
    customer.addressLine1 || customer.city || customer.pincode
      ? {
          line1: customer.addressLine1 ?? undefined,
          city: customer.city ?? undefined,
          pincode: customer.pincode ?? undefined,
        }
      : undefined,
  gender: customer.gender,
  customer_photo_url: customer.customerPhotoUrl,
  createdAt: customer.createdAt.toISOString(),
  updatedAt: customer.updatedAt.toISOString(),
});

const mapCustomerDetail = (customer: {
  id: string;
  shopId: string;
  createdByUserId: string | null;
  fullName: string;
  phoneNumber: string;
  addressLine1: string | null;
  city: string | null;
  pincode: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  customerPhotoUrl: string | null;
  aadhaarNumberEncrypted: string | null;
  panNumberEncrypted: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CustomerDetail => ({
  ...mapCustomerListItem(customer),
  shopId: customer.shopId,
  createdByUserId: customer.createdByUserId,
  aadhaar_number: decryptText(customer.aadhaarNumberEncrypted),
  pan_number: decryptText(customer.panNumberEncrypted),
});

const resolveAddress = (address?: CustomerAddressInput) => ({
  addressLine1: address?.line1?.trim() || null,
  city: address?.city?.trim() || null,
  pincode: address?.pincode?.trim() || null,
});

const validateCustomerOwnership = async (shopId: string, id: string) => {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      shopId,
      isDeleted: false,
    },
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }

  return customer;
};

export const createCustomer = async (session: AuthSession, body: CustomerBody): Promise<CustomerDetail> => {
  const customer = await prisma.customer.create({
    data: {
      shopId: session.shopId,
      createdByUserId: session.userId,
      fullName: body.full_name.trim(),
      phoneNumber: body.phone_number.trim(),
      ...resolveAddress(body.address),
      gender: body.gender ?? null,
      customerPhotoUrl: body.customer_photo_url?.trim() || null,
      aadhaarNumberEncrypted: encryptText(body.aadhaar_number?.trim() || null),
      panNumberEncrypted: encryptText(body.pan_number?.trim() || null),
    },
  });

  await logActivity({
    shopId: session.shopId,
    userId: session.userId,
    type: 'NEW_CUSTOMER',
    message: `Created new customer: ${customer.fullName}`,
    customerId: customer.id,
  });

  return mapCustomerDetail(customer);
};

export const listCustomers = async (session: AuthSession, query: CustomerQuery): Promise<CustomerListResponse> => {
  const { page, limit } = parsePagination(query);
  const search = query.search?.trim();

  const where = {
    shopId: session.shopId,
    isDeleted: false,
    ...(search
      ? {
          fullName: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}),
  };

  const [totalCustomers, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        addressLine1: true,
        city: true,
        pincode: true,
        gender: true,
        customerPhotoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    customers: customers.map(mapCustomerListItem),
    totalCustomers,
    totalPages: Math.ceil(totalCustomers / limit),
    currentPage: page,
  };
};

export const getCustomerById = async (session: AuthSession, id: string): Promise<CustomerDetail> => {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      shopId: session.shopId,
      isDeleted: false,
    },
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }

  return mapCustomerDetail(customer);
};

export const updateCustomer = async (session: AuthSession, id: string, body: Partial<CustomerBody>): Promise<CustomerDetail> => {
  await validateCustomerOwnership(session.shopId, id);

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(body.full_name ? { fullName: body.full_name.trim() } : {}),
      ...(body.phone_number ? { phoneNumber: body.phone_number.trim() } : {}),
      ...(body.address ? resolveAddress(body.address) : {}),
      ...(body.gender ? { gender: body.gender } : {}),
      ...(body.customer_photo_url !== undefined ? { customerPhotoUrl: body.customer_photo_url?.trim() || null } : {}),
      ...(body.aadhaar_number !== undefined ? { aadhaarNumberEncrypted: encryptText(body.aadhaar_number?.trim() || null) } : {}),
      ...(body.pan_number !== undefined ? { panNumberEncrypted: encryptText(body.pan_number?.trim() || null) } : {}),
    },
  });

  await logActivity({
    shopId: session.shopId,
    userId: session.userId,
    type: 'UPDATED_CUSTOMER',
    message: `Updated customer details for: ${customer.fullName}`,
    customerId: customer.id,
  });

  return mapCustomerDetail(customer);
};

export const deleteCustomer = async (session: AuthSession, id: string): Promise<{ customerId: string }> => {
  const customer = await validateCustomerOwnership(session.shopId, id);

  await prisma.customer.update({
    where: { id: customer.id },
    data: { isDeleted: true },
  });

  await logActivity({
    shopId: session.shopId,
    userId: session.userId,
    type: 'DELETED_CUSTOMER',
    message: `Deleted customer: ${customer.fullName}`,
    customerId: customer.id,
  });

  return { customerId: customer.id };
};
