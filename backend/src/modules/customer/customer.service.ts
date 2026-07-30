import { Customer } from '@prisma/client';
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

  async createCustomer(data: any): Promise<Customer> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    // Prepare encrypted values and plain search tags
    const aadhaar_number_encrypted = data.aadhaar_number ? encrypt(data.aadhaar_number) : null;
    const aadhaar_number_last4 = data.aadhaar_number ? getLast4Digits(data.aadhaar_number) : null;
    
    const pan_number_encrypted = data.pan_number ? encrypt(data.pan_number) : null;
    const pan_number_last4 = data.pan_number ? getLast4Digits(data.pan_number) : null;

    const address = data.address || {};
    
    // Auto-generate customerCode if missing
    let customerCode = data.customerCode;
    if (!customerCode) {
      const count = await prisma.customer.count({ where: { shopId } });
      customerCode = `CUST-${(count + 1).toString().padStart(5, '0')}`;
    }

    const customer = await customerRepository.create({
      shopId,
      createdByUserId: userId,
      full_name: data.full_name,
      phone_number: data.phone_number,
      gender: data.gender || null,
      customer_photo_url: data.customer_photo_url || null,
      aadhaar_number_encrypted,
      aadhaar_number_last4,
      pan_number_encrypted,
      pan_number_last4,
      address_line1: address.line1 || null,
      address_city: address.city || null,
      address_pincode: address.pincode || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      occupation: data.occupation || null,
      nominee_name: data.nominee_name || null,
      nominee_phone: data.nominee_phone || null,
      nominee_relation: data.nominee_relation || null,
      notes: data.notes || null,
      customerCode,
      kycStatus: data.kycStatus || 'pending',
      kycVerifiedAt: data.kycStatus === 'verified' ? new Date() : null
    });

    await prisma.auditLog.create({
      data: {
        shopId,
        userId,
        entityName: 'Customer',
        entityId: customer.id,
        action: 'create',
        newValue: { full_name: customer.full_name, code: customer.customerCode }
      }
    });

    return customer;
  }

  async updateCustomer(id: string, data: any): Promise<Customer> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const updatePayload: any = {};
    const oldValues: any = {};
    const newValues: any = {};

    if (data.full_name !== undefined) {
      updatePayload.full_name = data.full_name;
      oldValues.full_name = customer.full_name;
      newValues.full_name = data.full_name;
    }
    if (data.phone_number !== undefined) {
      updatePayload.phone_number = data.phone_number;
      oldValues.phone_number = customer.phone_number;
      newValues.phone_number = data.phone_number;
    }
    if (data.gender !== undefined) {
      updatePayload.gender = data.gender;
    }
    if (data.customer_photo_url !== undefined) {
      updatePayload.customer_photo_url = data.customer_photo_url;
    }
    if (data.occupation !== undefined) {
      updatePayload.occupation = data.occupation;
    }
    if (data.nominee_name !== undefined) {
      updatePayload.nominee_name = data.nominee_name;
    }
    if (data.nominee_phone !== undefined) {
      updatePayload.nominee_phone = data.nominee_phone;
    }
    if (data.nominee_relation !== undefined) {
      updatePayload.nominee_relation = data.nominee_relation;
    }
    if (data.notes !== undefined) {
      updatePayload.notes = data.notes;
    }
    if (data.customerCode !== undefined) {
      updatePayload.customerCode = data.customerCode;
    }
    if (data.dateOfBirth !== undefined) {
      updatePayload.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }

    // Encrypt Aadhaar if updated
    if (data.aadhaar_number !== undefined) {
      updatePayload.aadhaar_number_encrypted = data.aadhaar_number ? encrypt(data.aadhaar_number) : null;
      updatePayload.aadhaar_number_last4 = data.aadhaar_number ? getLast4Digits(data.aadhaar_number) : null;
    }

    // Encrypt PAN if updated
    if (data.pan_number !== undefined) {
      updatePayload.pan_number_encrypted = data.pan_number ? encrypt(data.pan_number) : null;
      updatePayload.pan_number_last4 = data.pan_number ? getLast4Digits(data.pan_number) : null;
    }

    // Handle nested address updates
    if (data.address) {
      if (data.address.line1 !== undefined) updatePayload.address_line1 = data.address.line1;
      if (data.address.city !== undefined) updatePayload.address_city = data.address.city;
      if (data.address.pincode !== undefined) updatePayload.address_pincode = data.address.pincode;
    }

    if (data.kycStatus !== undefined) {
      updatePayload.kycStatus = data.kycStatus;
      updatePayload.kycVerifiedAt = data.kycStatus === 'verified' ? new Date() : null;
      oldValues.kycStatus = customer.kycStatus;
      newValues.kycStatus = data.kycStatus;
    }

    const updated = await customerRepository.update(id, updatePayload);

    await prisma.auditLog.create({
      data: {
        shopId,
        userId,
        entityName: 'Customer',
        entityId: id,
        action: 'update',
        oldValue: oldValues,
        newValue: newValues
      }
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
        shopId,
        userId,
        entityName: 'Customer',
        entityId: id,
        action: 'delete',
        oldValue: { full_name: customer.full_name }
      }
    });
  }

  async getCustomerStats(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    return customerRepository.getCustomerStats(id);
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
