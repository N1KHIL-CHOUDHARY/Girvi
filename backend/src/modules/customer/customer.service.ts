import { Customer, Prisma } from '@prisma/client';
import { customerRepository } from './customer.repository';
import { encrypt, decrypt, getLast4Digits } from '../../common/utils/encryption';
import { getTenantShopId, getTenantUserId } from '../../common/context/tenant.context';
import { prisma } from '../../config/database';
import { NotFoundError, AppError } from '../../common/errors/AppError';

export class CustomerService {
  async listCustomers(params: { page: number; limit: number; search?: string }) {
    const { customers, totalCount } = await customerRepository.findAndCount(params);
    const totalPages = Math.ceil(totalCount / params.limit);

    // Map records to hide full encrypted PAN/Aadhaar and structure address object
    const mapped = customers.map((c) => ({
      id: c.id,
      full_name: c.full_name,
      phone_number: c.phone_number,
      gender: c.gender,
      customer_photo_url: c.customer_photo_url,
      customerCode: c.customerCode,
      kycStatus: c.kycStatus,
      address: {
        line1: c.address_line1 || '',
        city: c.address_city || '',
        pincode: c.address_pincode || ''
      },
      aadhaar_last4: c.aadhaar_number_last4,
      pan_last4: c.pan_number_last4,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString()
    }));

    return {
      customers: mapped,
      totalCustomers: totalCount,
      totalPages,
      currentPage: params.page
    };
  }

  async getCustomerById(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Decrypt sensitive information for details view
    const aadhaar_number = customer.aadhaar_number_encrypted
      ? decrypt(customer.aadhaar_number_encrypted)
      : null;
    const pan_number = customer.pan_number_encrypted
      ? decrypt(customer.pan_number_encrypted)
      : null;

    return {
      id: customer.id,
      full_name: customer.full_name,
      phone_number: customer.phone_number,
      gender: customer.gender,
      customer_photo_url: customer.customer_photo_url,
      aadhaar_number,
      pan_number,
      address: {
        line1: customer.address_line1 || '',
        city: customer.address_city || '',
        pincode: customer.address_pincode || ''
      },
      dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.toISOString() : null,
      occupation: customer.occupation,
      nominee_name: customer.nominee_name,
      nominee_phone: customer.nominee_phone,
      nominee_relation: customer.nominee_relation,
      notes: customer.notes,
      customerCode: customer.customerCode,
      kycStatus: customer.kycStatus,
      kycVerifiedAt: customer.kycVerifiedAt ? customer.kycVerifiedAt.toISOString() : null,
      shopId: customer.shopId,
      createdByUserId: customer.createdByUserId,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString()
    };
  }

  async createCustomer(data: Record<string, unknown>): Promise<Customer> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    // Prepare encrypted values and plain search tags
    const aadhaar_number_encrypted = typeof data.aadhaar_number === 'string' ? encrypt(data.aadhaar_number) : null;
    const aadhaar_number_last4 = typeof data.aadhaar_number === 'string' ? getLast4Digits(data.aadhaar_number) : null;
    
    const pan_number_encrypted = typeof data.pan_number === 'string' ? encrypt(data.pan_number) : null;
    const pan_number_last4 = typeof data.pan_number === 'string' ? getLast4Digits(data.pan_number) : null;

    const address = (data.address || {}) as Record<string, unknown>;
    
    // Auto-generate customerCode if missing
    let customerCode = typeof data.customerCode === 'string' ? data.customerCode : undefined;
    if (!customerCode) {
      const count = await prisma.customer.count();
      customerCode = `CUST-${(count + 1).toString().padStart(5, '0')}`;
    }

    const customer = await customerRepository.create({
      createdByUserId: userId,
      full_name: String(data.full_name || ''),
      phone_number: String(data.phone_number || ''),
      gender: typeof data.gender === 'string' ? data.gender : null,
      customer_photo_url: typeof data.customer_photo_url === 'string' ? data.customer_photo_url : null,
      aadhaar_number_encrypted,
      aadhaar_number_last4,
      pan_number_encrypted,
      pan_number_last4,
      address_line1: typeof address.line1 === 'string' ? address.line1 : null,
      address_city: typeof address.city === 'string' ? address.city : null,
      address_pincode: typeof address.pincode === 'string' ? address.pincode : null,
      dateOfBirth: data.dateOfBirth ? new Date(String(data.dateOfBirth)) : null,
      occupation: typeof data.occupation === 'string' ? data.occupation : null,
      nominee_name: typeof data.nominee_name === 'string' ? data.nominee_name : null,
      nominee_phone: typeof data.nominee_phone === 'string' ? data.nominee_phone : null,
      nominee_relation: typeof data.nominee_relation === 'string' ? data.nominee_relation : null,
      notes: typeof data.notes === 'string' ? data.notes : null,
      customerCode,
      kycStatus: typeof data.kycStatus === 'string' ? data.kycStatus : 'pending',
      kycVerifiedAt: data.kycStatus === 'verified' ? new Date() : null
    });

    await prisma.auditLog.create({
      data: {
        userId,
        entityName: 'Customer',
        entityId: customer.id,
        action: 'create',
        newValue: { full_name: customer.full_name, code: customer.customerCode }
      } as unknown as Prisma.AuditLogCreateInput
    });

    return customer;
  }

  async updateCustomer(id: string, data: Record<string, unknown>): Promise<Customer> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const updatePayload: Prisma.CustomerUpdateInput = {};
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    if (data.full_name !== undefined) {
      updatePayload.full_name = String(data.full_name);
      oldValues.full_name = customer.full_name;
      newValues.full_name = data.full_name;
    }
    if (data.phone_number !== undefined) {
      updatePayload.phone_number = String(data.phone_number);
      oldValues.phone_number = customer.phone_number;
      newValues.phone_number = data.phone_number;
    }
    if (data.gender !== undefined) {
      updatePayload.gender = typeof data.gender === 'string' ? data.gender : null;
    }
    if (data.customer_photo_url !== undefined) {
      updatePayload.customer_photo_url = typeof data.customer_photo_url === 'string' ? data.customer_photo_url : null;
    }
    if (data.aadhaar_number !== undefined) {
      updatePayload.aadhaar_number_encrypted = typeof data.aadhaar_number === 'string' ? encrypt(data.aadhaar_number) : null;
      updatePayload.aadhaar_number_last4 = typeof data.aadhaar_number === 'string' ? getLast4Digits(data.aadhaar_number) : null;
      oldValues.aadhaar_number_last4 = customer.aadhaar_number_last4;
      newValues.aadhaar_number_last4 = updatePayload.aadhaar_number_last4;
    }
    if (data.pan_number !== undefined) {
      updatePayload.pan_number_encrypted = typeof data.pan_number === 'string' ? encrypt(data.pan_number) : null;
      updatePayload.pan_number_last4 = typeof data.pan_number === 'string' ? getLast4Digits(data.pan_number) : null;
      oldValues.pan_number_last4 = customer.pan_number_last4;
      newValues.pan_number_last4 = updatePayload.pan_number_last4;
    }
    if (data.address !== undefined) {
      const addr = (data.address || {}) as Record<string, unknown>;
      if (addr.line1 !== undefined) updatePayload.address_line1 = typeof addr.line1 === 'string' ? addr.line1 : null;
      if (addr.city !== undefined) updatePayload.address_city = typeof addr.city === 'string' ? addr.city : null;
      if (addr.pincode !== undefined) updatePayload.address_pincode = typeof addr.pincode === 'string' ? addr.pincode : null;
    }
    if (data.dateOfBirth !== undefined) {
      updatePayload.dateOfBirth = data.dateOfBirth ? new Date(String(data.dateOfBirth)) : null;
    }
    if (data.occupation !== undefined) {
      updatePayload.occupation = typeof data.occupation === 'string' ? data.occupation : null;
    }
    if (data.nominee_name !== undefined) {
      updatePayload.nominee_name = typeof data.nominee_name === 'string' ? data.nominee_name : null;
    }
    if (data.nominee_phone !== undefined) {
      updatePayload.nominee_phone = typeof data.nominee_phone === 'string' ? data.nominee_phone : null;
    }
    if (data.nominee_relation !== undefined) {
      updatePayload.nominee_relation = typeof data.nominee_relation === 'string' ? data.nominee_relation : null;
    }
    if (data.notes !== undefined) {
      updatePayload.notes = typeof data.notes === 'string' ? data.notes : null;
    }
    if (data.kycStatus !== undefined) {
      updatePayload.kycStatus = String(data.kycStatus);
      updatePayload.kycVerifiedAt = data.kycStatus === 'verified' ? new Date() : null;
      oldValues.kycStatus = customer.kycStatus;
      newValues.kycStatus = data.kycStatus;
    }

    const updated = await customerRepository.update(id, updatePayload);

    await prisma.auditLog.create({
      data: {
        userId,
        entityName: 'Customer',
        entityId: id,
        action: 'update',
        oldValue: oldValues,
        newValue: newValues
      } as unknown as Prisma.AuditLogCreateInput
    });

    return updated;
  }

  async deleteCustomer(id: string): Promise<void> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    await customerRepository.delete(id);

    await prisma.auditLog.create({
      data: {
        userId,
        entityName: 'Customer',
        entityId: id,
        action: 'delete',
        oldValue: { full_name: customer.full_name }
      } as unknown as Prisma.AuditLogCreateInput
    });
  }

  async getCustomerStats(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const tickets = await prisma.pawnTicket.findMany({
      where: { customerId: id }
    });

    const payments = await prisma.payment.findMany({
      where: { customerId: id }
    });

    const activeTickets = tickets.filter((t) => (t.status || "").toLowerCase() === "active");

    const totalLoanValue = tickets.reduce((acc, t) => acc + Number(t.original_loan_amount || 0), 0);
    const totalActiveLoan = activeTickets.reduce((acc, t) => acc + Number(t.loan_amount || 0), 0);

    const totalInterestPaid = payments
      .filter((p) => {
        const pf = (p.payment_for || "").toLowerCase();
        return pf === 'interest' || pf === 'penalty' || pf === 'fine';
      })
      .reduce((acc, p) => acc + Number(p.amount_paid || 0), 0);

    const totalPrincipalPaid = payments
      .filter((p) => (p.payment_for || "").toLowerCase() === 'principal')
      .reduce((acc, p) => acc + Number(p.amount_paid || 0), 0);

    const statsDataObj = {
      total_loan_value: totalLoanValue,
      totalActiveLoan: totalActiveLoan,
      total_active_loan: totalActiveLoan,
      totalLoanValue: totalLoanValue,
      total_tickets: tickets.length,
      totalTickets: tickets.length,
      active_tickets: activeTickets.length,
      activeTickets: activeTickets.length,
      total_interest_paid: totalInterestPaid,
      totalInterestPaid: totalInterestPaid,
      total_principal_paid: totalPrincipalPaid,
      totalPrincipalPaid: totalPrincipalPaid,
    };

    return {
      ...statsDataObj,
      stats: statsDataObj,
      payments: [
        { payment_for: 'interest', total_paid: totalInterestPaid },
        { payment_for: 'principal', total_paid: totalPrincipalPaid }
      ]
    };
  }

  async getCustomerTickets(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    return customerRepository.findTicketsByCustomerId(id);
  }
}

export const customerService = new CustomerService();
export default customerService;
