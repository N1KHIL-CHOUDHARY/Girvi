import crypto from 'crypto';
import { Customer, Prisma } from '@prisma/client';
import { customerRepository } from './customer.repository';
import { encrypt, decrypt, getLast4Digits } from '../../common/utils/encryption';
import { getTenantShopId, getTenantUserId } from '../../common/context/tenant.context';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFilterParams,
  CustomerStatsResult,
  CustomerStatsSummary,
  CustomerListItem,
  CustomerDetailsResponse,
} from './customer.types';

export class CustomerService {
  async listCustomers(params: CustomerFilterParams): Promise<{
    customers: CustomerListItem[];
    totalCustomers: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { customers, totalCount } = await customerRepository.findAndCount(params);
    const totalPages = Math.ceil(totalCount / (params.limit || 10));

    const mapped: CustomerListItem[] = customers.map((c) => ({
      id: c.id,
      full_name: c.fullName,
      phone_number: c.phoneNumber,
      gender: c.gender,
      customer_photo_url: c.customerPhotoUrl,
      customerCode: c.customerCode,
      kycStatus: c.kycStatus,
      address: {
        line1: c.addressLine1 ?? '',
        city: c.addressCity ?? '',
        pincode: c.addressPincode ?? '',
      },
      aadhaar_last4: c.aadhaarNumberLast4,
      pan_last4: c.panNumberLast4,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return {
      customers: mapped,
      totalCustomers: totalCount,
      totalPages,
      currentPage: params.page,
    };
  }

  async getCustomerById(id: string): Promise<CustomerDetailsResponse> {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const aadhaar_number = customer.aadhaarNumberEncrypted
      ? decrypt(customer.aadhaarNumberEncrypted)
      : null;
    const pan_number = customer.panNumberEncrypted
      ? decrypt(customer.panNumberEncrypted)
      : null;

    return {
      id: customer.id,
      full_name: customer.fullName,
      phone_number: customer.phoneNumber,
      gender: customer.gender,
      customer_photo_url: customer.customerPhotoUrl,
      aadhaar_number,
      pan_number,
      address: {
        line1: customer.addressLine1 ?? '',
        city: customer.addressCity ?? '',
        pincode: customer.addressPincode ?? '',
      },
      dateOfBirth: customer.dateOfBirth?.toISOString() ?? null,
      occupation: customer.occupation,
      nominee_name: customer.nomineeName,
      nominee_phone: customer.nomineePhone,
      nominee_relation: customer.nomineeRelation,
      notes: customer.notes,
      customerCode: customer.customerCode,
      kycStatus: customer.kycStatus,
      kycVerifiedAt: customer.kycVerifiedAt?.toISOString() ?? null,
      shopId: customer.shopId,
      createdByUserId: customer.createdByUserId,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }

  private async generateUniqueCustomerCode(
    tx: Parameters<Parameters<typeof prisma['$transaction']>[0]>[0],
    shopId: string,
    customCode?: string | null
  ): Promise<string> {
    if (customCode?.trim()) {
      return customCode.trim();
    }

    const MAX_RETRIES = 5;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const latestCustomer = await tx.customer.findFirst({
        where: { shopId },
        orderBy: { createdAt: 'desc' },
        select: { customerCode: true },
      });

      let nextSeq = 1;
      if (latestCustomer?.customerCode) {
        const match = latestCustomer.customerCode.match(/(\d+)$/);
        nextSeq = match ? parseInt(match[1], 10) + 1 + attempt : (await tx.customer.count({ where: { shopId } })) + 1 + attempt;
      } else {
        nextSeq = (await tx.customer.count({ where: { shopId } })) + 1 + attempt;
      }

      const candidate = `CUST-${nextSeq.toString().padStart(5, '0')}`;
      const exists = await tx.customer.findFirst({
        where: { shopId, customerCode: candidate },
        select: { id: true },
      });

      if (!exists) return candidate;
    }

    return `CUST-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  }

  async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new BadRequestError('Tenant context required');

    return prisma.$transaction(async (tx) => {
      const customerCode = await this.generateUniqueCustomerCode(tx, shopId, data.customerCode);
      const address = data.address ?? {};

      const customer = await tx.customer.create({
        data: {
          fullName: data.full_name,
          phoneNumber: data.phone_number,
          gender: data.gender ?? null,
          customerPhotoUrl: data.customer_photo_url ?? null,
          aadhaarNumberEncrypted: data.aadhaar_number ? encrypt(data.aadhaar_number) : null,
          aadhaarNumberLast4: data.aadhaar_number ? getLast4Digits(data.aadhaar_number) : null,
          panNumberEncrypted: data.pan_number ? encrypt(data.pan_number) : null,
          panNumberLast4: data.pan_number ? getLast4Digits(data.pan_number) : null,
          addressLine1: address.line1 ?? null,
          addressCity: address.city ?? null,
          addressPincode: address.pincode ?? null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          occupation: data.occupation ?? null,
          nomineeName: data.nominee_name ?? null,
          nomineePhone: data.nominee_phone ?? null,
          nomineeRelation: data.nominee_relation ?? null,
          notes: data.notes ?? null,
          customerCode,
          kycStatus: data.kycStatus ?? 'pending',
          kycVerifiedAt: data.kycStatus === 'verified' ? new Date() : null,
          shop: { connect: { id: shopId } },
          ...(userId ? { createdBy: { connect: { id: userId } } } : {}),
        },
      });

      await tx.auditLog.create({
        data: {
          entityName: 'Customer',
          entityId: customer.id,
          action: 'create',
          newValue: { full_name: customer.fullName, code: customer.customerCode },
          shop: { connect: { id: shopId } },
          ...(userId ? { user: { connect: { id: userId } } } : {}),
        },
      });

      return customer;
    });
  }

  async updateCustomer(id: string, data: UpdateCustomerInput): Promise<Customer> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new BadRequestError('Tenant context required');

    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id, shopId, deletedAt: null },
      });
      if (!customer) throw new NotFoundError('Customer not found');

      const updatePayload: Prisma.CustomerUpdateInput = {};
      const oldValues: Record<string, unknown> = {};
      const newValues: Record<string, unknown> = {};

      if (data.full_name !== undefined) {
        updatePayload.fullName = data.full_name;
        oldValues.full_name = customer.fullName;
        newValues.full_name = data.full_name;
      }
      if (data.phone_number !== undefined) {
        updatePayload.phoneNumber = data.phone_number;
        oldValues.phone_number = customer.phoneNumber;
        newValues.phone_number = data.phone_number;
      }
      if (data.gender !== undefined) updatePayload.gender = data.gender;
      if (data.customer_photo_url !== undefined) updatePayload.customerPhotoUrl = data.customer_photo_url;
      if (data.occupation !== undefined) updatePayload.occupation = data.occupation;
      if (data.nominee_name !== undefined) updatePayload.nomineeName = data.nominee_name;
      if (data.nominee_phone !== undefined) updatePayload.nomineePhone = data.nominee_phone;
      if (data.nominee_relation !== undefined) updatePayload.nomineeRelation = data.nominee_relation;
      if (data.notes !== undefined) updatePayload.notes = data.notes;

      if (data.aadhaar_number !== undefined) {
        updatePayload.aadhaarNumberEncrypted = data.aadhaar_number ? encrypt(data.aadhaar_number) : null;
        updatePayload.aadhaarNumberLast4 = data.aadhaar_number ? getLast4Digits(data.aadhaar_number) : null;
        oldValues.aadhaar_number_last4 = customer.aadhaarNumberLast4;
        newValues.aadhaar_number_last4 = updatePayload.aadhaarNumberLast4;
      }
      if (data.pan_number !== undefined) {
        updatePayload.panNumberEncrypted = data.pan_number ? encrypt(data.pan_number) : null;
        updatePayload.panNumberLast4 = data.pan_number ? getLast4Digits(data.pan_number) : null;
        oldValues.pan_number_last4 = customer.panNumberLast4;
        newValues.pan_number_last4 = updatePayload.panNumberLast4;
      }
      if (data.address) {
        if (data.address.line1 !== undefined) updatePayload.addressLine1 = data.address.line1;
        if (data.address.city !== undefined) updatePayload.addressCity = data.address.city;
        if (data.address.pincode !== undefined) updatePayload.addressPincode = data.address.pincode;
      }
      if (data.dateOfBirth !== undefined) {
        updatePayload.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
      }
      if (data.kycStatus) {
        updatePayload.kycStatus = data.kycStatus;
        updatePayload.kycVerifiedAt = data.kycStatus === 'verified' ? new Date() : null;
        oldValues.kycStatus = customer.kycStatus;
        newValues.kycStatus = data.kycStatus;
      }

      const updated = await tx.customer.update({
        where: { id },
        data: updatePayload,
      });

      await tx.auditLog.create({
        data: {
          entityName: 'Customer',
          entityId: id,
          action: 'update',
          oldValue: oldValues as Prisma.InputJsonValue,
          newValue: newValues as Prisma.InputJsonValue,
          shop: { connect: { id: shopId } },
          ...(userId ? { user: { connect: { id: userId } } } : {}),
        },
      });

      return updated;
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new BadRequestError('Tenant context required');

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id, shopId, deletedAt: null },
      });
      if (!customer) throw new NotFoundError('Customer not found');

      await tx.customer.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          entityName: 'Customer',
          entityId: id,
          action: 'delete',
          oldValue: { full_name: customer.fullName },
          shop: { connect: { id: shopId } },
          ...(userId ? { user: { connect: { id: userId } } } : {}),
        },
      });
    });
  }

  async getCustomerStats(id: string): Promise<CustomerStatsResult> {
    const shopId = getTenantShopId();
    const customer = await customerRepository.findById(id, shopId);
    if (!customer) throw new NotFoundError('Customer not found');

    const ticketWhere = { customerId: id, ...(shopId ? { shopId } : {}), deletedAt: null };

    const [ticketAgg, activeTicketAgg, paymentGroups] = await Promise.all([
      prisma.pawnTicket.aggregate({
        where: ticketWhere,
        _sum: { originalLoanAmount: true },
        _count: { id: true },
      }),
      prisma.pawnTicket.aggregate({
        where: { ...ticketWhere, status: 'active' },
        _sum: { loanAmount: true },
        _count: { id: true },
      }),
      prisma.payment.groupBy({
        by: ['paymentFor'],
        where: { customerId: id, ...(shopId ? { shopId } : {}), deletedAt: null },
        _sum: { amountPaid: true },
      }),
    ]);

    const totalLoanValue = (ticketAgg._sum.originalLoanAmount ?? new Prisma.Decimal(0)).toNumber();
    const totalActiveLoan = (activeTicketAgg._sum.loanAmount ?? new Prisma.Decimal(0)).toNumber();
    const totalTickets = ticketAgg._count.id ?? 0;
    const activeTickets = activeTicketAgg._count.id ?? 0;

    let totalInterestPaidDecimal = new Prisma.Decimal(0);
    let totalPrincipalPaidDecimal = new Prisma.Decimal(0);

    for (const group of paymentGroups) {
      const sum = group._sum.amountPaid ?? new Prisma.Decimal(0);
      const pf = (group.paymentFor ?? '').toLowerCase();
      if (['interest', 'penalty', 'fine'].includes(pf)) {
        totalInterestPaidDecimal = totalInterestPaidDecimal.plus(sum);
      } else if (pf === 'principal') {
        totalPrincipalPaidDecimal = totalPrincipalPaidDecimal.plus(sum);
      }
    }

    const totalInterestPaid = totalInterestPaidDecimal.toNumber();
    const totalPrincipalPaid = totalPrincipalPaidDecimal.toNumber();

    const statsDataObj: CustomerStatsSummary = {
      total_loan_value: totalLoanValue,
      totalActiveLoan,
      total_active_loan: totalActiveLoan,
      totalLoanValue,
      total_tickets: totalTickets,
      totalTickets,
      active_tickets: activeTickets,
      activeTickets,
      total_interest_paid: totalInterestPaid,
      totalInterestPaid,
      total_principal_paid: totalPrincipalPaid,
      totalPrincipalPaid,
    };

    return {
      ...statsDataObj,
      stats: statsDataObj,
      payments: [
        { payment_for: 'interest', total_paid: totalInterestPaid },
        { payment_for: 'principal', total_paid: totalPrincipalPaid },
      ],
    };
  }

  async getCustomerTickets(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new NotFoundError('Customer not found');
    return customerRepository.findTicketsByCustomerId(id);
  }
}

export const customerService = new CustomerService();
export default customerService;
