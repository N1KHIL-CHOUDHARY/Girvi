import { describe, it, expect, vi, beforeEach } from "vitest";
import { Customer } from "@prisma/client";
import { customerService } from "../../src/modules/customer/customer.service";
import { customerRepository } from "../../src/modules/customer/customer.repository";
import { tenantContext } from "../../src/common/context/tenant.context";
import { AppError, NotFoundError } from "../../src/common/errors/AppError";

vi.mock("../../src/modules/customer/customer.repository");
vi.mock("../../src/config/database", () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
    customer: {
      findFirst: vi.fn(),
    },
  },
}));

describe("CustomerService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw AppError if tenant context is missing on createCustomer", async () => {
    vi.spyOn(tenantContext, "getStore").mockReturnValue({});
    await expect(
      customerService.createCustomer({
        full_name: "John Doe",
        phone_number: "9876543210",
      })
    ).rejects.toThrow(new AppError("Tenant context required", 400));
  });

  it("should list customers correctly", async () => {
    const mockCustomers: Customer[] = [
      {
        id: "c-1",
        shopId: "shop-1",
        fullName: "John Doe",
        phoneNumber: "9876543210",
        gender: "Male",
        customerPhotoUrl: null,
        aadhaarNumberEncrypted: null,
        aadhaarNumberLast4: "1234",
        panNumberEncrypted: null,
        panNumberLast4: "5678",
        addressLine1: "123 Main St",
        addressCity: "City",
        addressPincode: "123456",
        dateOfBirth: null,
        occupation: null,
        nomineeName: null,
        nomineePhone: null,
        nomineeRelation: null,
        notes: null,
        customerCode: "C001",
        kycStatus: "pending",
        kycVerifiedAt: null,
        createdByUserId: null,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
        deletedAt: null,
      },
    ];

    vi.mocked(customerRepository.findAndCount).mockResolvedValue({
      customers: mockCustomers,
      totalCount: 1,
    });

    const result = await customerService.listCustomers({ page: 1, limit: 10 });
    expect(result.customers).toHaveLength(1);
    expect(result.totalCustomers).toBe(1);
    expect(result.customers[0].full_name).toBe("John Doe");
  });

  it("should throw NotFoundError if customer by ID is not found", async () => {
    vi.mocked(customerRepository.findById).mockResolvedValue(null);
    await expect(customerService.getCustomerById("c-invalid")).rejects.toThrow(
      new NotFoundError("Customer not found")
    );
  });
});
