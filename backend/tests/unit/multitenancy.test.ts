import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTenantShopId,
  getTenantUserId,
  getTenantStore,
  runWithTenantContext,
} from "../../src/common/context/tenant.context";
import { tenantMiddleware } from "../../src/common/middleware/tenant.middleware";
import {
  globalPrisma,
  TENANT_MODELS,
  SOFT_DELETE_MODELS,
  tenantExtensionConfig,
} from "../../src/config/database";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env";
import type { Request, Response } from "express";

describe("Multi-Tenancy & Data Isolation Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Tenant Context (AsyncLocalStorage)", () => {
    it("should return undefined for store accessors when outside tenant context", () => {
      expect(getTenantShopId()).toBeUndefined();
      expect(getTenantUserId()).toBeUndefined();
      expect(getTenantStore()).toBeUndefined();
    });

    it("should provide store accessors inside runWithTenantContext", () => {
      const store = {
        shopId: "shop-123",
        userId: "user-456",
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
        requestId: "req-789",
      };

      runWithTenantContext(store, () => {
        expect(getTenantShopId()).toBe("shop-123");
        expect(getTenantUserId()).toBe("user-456");
        expect(getTenantStore()).toEqual(store);
      });

      expect(getTenantShopId()).toBeUndefined();
    });

    it("should isolate context between concurrent asynchronous operations", async () => {
      const result1Promise = new Promise((resolve) => {
        runWithTenantContext({ shopId: "tenant-A", userId: "user-A" }, async () => {
          await new Promise((r) => setTimeout(r, 20));
          resolve({ shopId: getTenantShopId(), userId: getTenantUserId() });
        });
      });

      const result2Promise = new Promise((resolve) => {
        runWithTenantContext({ shopId: "tenant-B", userId: "user-B" }, async () => {
          await new Promise((r) => setTimeout(r, 10));
          resolve({ shopId: getTenantShopId(), userId: getTenantUserId() });
        });
      });

      const [res1, res2] = await Promise.all([result1Promise, result2Promise]);
      expect(res1).toEqual({ shopId: "tenant-A", userId: "user-A" });
      expect(res2).toEqual({ shopId: "tenant-B", userId: "user-B" });
    });
  });

  describe("Tenant Middleware", () => {
    it("should extract token and set context with x-request-id for authenticated requests", () => {
      const token = jwt.sign({ shopId: "shop-jwt-1", userId: "user-jwt-1" }, env.JWT_SECRET);

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
          "x-request-id": "custom-req-id-101",
          "user-agent": "Vitest-Agent",
        },
        ip: "192.168.1.100",
        socket: {},
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;

      let capturedShopId: string | undefined;
      let capturedUserId: string | undefined;
      let capturedRequestId: string | undefined;

      tenantMiddleware(req, res, () => {
        capturedShopId = getTenantShopId();
        capturedUserId = getTenantUserId();
        capturedRequestId = getTenantStore()?.requestId;
      });

      expect(res.setHeader).toHaveBeenCalledWith("x-request-id", "custom-req-id-101");
      expect(capturedShopId).toBe("shop-jwt-1");
      expect(capturedUserId).toBe("user-jwt-1");
      expect(capturedRequestId).toBe("custom-req-id-101");
    });

    it("should gracefully handle unauthenticated requests with undefined shopId and generate UUID request-id", () => {
      const req = {
        headers: {},
        socket: { remoteAddress: "127.0.0.1" },
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;

      let capturedShopId: string | undefined;
      let capturedUserId: string | undefined;

      tenantMiddleware(req, res, () => {
        capturedShopId = getTenantShopId();
        capturedUserId = getTenantUserId();
      });

      expect(res.setHeader).toHaveBeenCalledWith("x-request-id", expect.any(String));
      expect(capturedShopId).toBeUndefined();
      expect(capturedUserId).toBeUndefined();
    });

    it("should gracefully ignore invalid tokens and pass undefined context", () => {
      const req = {
        headers: {
          authorization: "Bearer invalid-token-xyz",
        },
        socket: {},
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;

      let capturedShopId: string | undefined;

      tenantMiddleware(req, res, () => {
        capturedShopId = getTenantShopId();
      });

      expect(capturedShopId).toBeUndefined();
    });
  });

  describe("Prisma Extension - Model & Soft Delete Definitions", () => {
    it("should include all expected tenant models", () => {
      expect(TENANT_MODELS).toContain("Shop");
      expect(TENANT_MODELS).toContain("Role");
      expect(TENANT_MODELS).toContain("User");
      expect(TENANT_MODELS).toContain("Customer");
      expect(TENANT_MODELS).toContain("PawnTicket");
      expect(TENANT_MODELS).toContain("Payment");
      expect(TENANT_MODELS).toContain("LedgerEntry");
      expect(TENANT_MODELS).toContain("AuditLog");
      expect(TENANT_MODELS).toContain("ActivityLog");
    });

    it("should include all expected soft-delete models", () => {
      expect(SOFT_DELETE_MODELS).toContain("User");
      expect(SOFT_DELETE_MODELS).toContain("Customer");
      expect(SOFT_DELETE_MODELS).toContain("PawnTicket");
      expect(SOFT_DELETE_MODELS).toContain("PawnItem");
      expect(SOFT_DELETE_MODELS).toContain("Payment");
    });
  });

  describe("Prisma Extension - Query Interception & Auto-Scoping", () => {
    const allModels = tenantExtensionConfig.query.$allModels;

    it("should auto-inject shopId and deletedAt: null on findMany for tenant + soft-delete models", async () => {
      const mockQuery = vi.fn().mockResolvedValue([]);
      const args = { where: { full_name: "Alice" } };

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        await allModels.findMany({ model: "Customer", args, query: mockQuery });
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            full_name: "Alice",
            shopId: "shop-test-1",
            deletedAt: null,
          },
        })
      );
    });

    it("should inject id: shopId on Shop model findMany", async () => {
      const mockQuery = vi.fn().mockResolvedValue([]);
      const args = {};

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        await allModels.findMany({ model: "Shop", args, query: mockQuery });
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "shop-test-1",
          },
        })
      );
    });

    it("should auto-inject shopId and deletedAt: null on findFirst", async () => {
      const mockQuery = vi.fn().mockResolvedValue(null);
      const args = { where: { ticket_number: "T-001" } };

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        await allModels.findFirst({ model: "PawnTicket", args, query: mockQuery });
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            ticket_number: "T-001",
            shopId: "shop-test-1",
            deletedAt: null,
          },
        })
      );
    });

    it("should auto-inject shopId on count and aggregate and groupBy", async () => {
      const mockQuery = vi.fn().mockResolvedValue(10);
      const args = {};

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        await allModels.count({ model: "Customer", args, query: mockQuery });
        await allModels.aggregate({ model: "PawnTicket", args, query: mockQuery });
        await allModels.groupBy({ model: "Customer", args, query: mockQuery });
      });

      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it("should translate findUnique to delegate.findFirst with tenant scoping", async () => {
      const mockCustomerDelegate = {
        findFirst: vi.fn().mockResolvedValue({
          id: "c-100",
          full_name: "Bob",
          shopId: "shop-test-1",
          deletedAt: null,
        }),
      };
      vi.spyOn(globalPrisma, "customer", "get").mockReturnValue(
        mockCustomerDelegate as unknown as typeof globalPrisma.customer
      );

      const mockQuery = vi.fn();
      const args = { where: { id: "c-100" } };

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        const result = (await allModels.findUnique({
          model: "Customer",
          args,
          query: mockQuery,
        })) as { full_name: string } | null;
        expect(result).toBeDefined();
        expect(result?.full_name).toBe("Bob");
      });

      expect(mockCustomerDelegate.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "c-100",
            shopId: "shop-test-1",
            deletedAt: null,
          },
        })
      );
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should translate findUniqueOrThrow to delegate.findFirstOrThrow with tenant scoping", async () => {
      const mockCustomerDelegate = {
        findFirstOrThrow: vi.fn().mockResolvedValue({
          id: "c-100",
          full_name: "Bob",
          shopId: "shop-test-1",
          deletedAt: null,
        }),
      };
      vi.spyOn(globalPrisma, "customer", "get").mockReturnValue(
        mockCustomerDelegate as unknown as typeof globalPrisma.customer
      );

      const mockQuery = vi.fn();
      const args = { where: { id: "c-100" } };

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        const result = (await allModels.findUniqueOrThrow({
          model: "Customer",
          args,
          query: mockQuery,
        })) as { full_name: string } | null;
        expect(result).toBeDefined();
        expect(result?.full_name).toBe("Bob");
      });

      expect(mockCustomerDelegate.findFirstOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "c-100",
            shopId: "shop-test-1",
            deletedAt: null,
          },
        })
      );
    });

    it("should auto-inject shopId on create for tenant models", async () => {
      const mockQuery = vi.fn().mockResolvedValue({ id: "c-new" });
      const args = {
        data: {
          full_name: "Charlie",
          phone_number: "1234567890",
        },
      };

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        await allModels.create({ model: "Customer", args, query: mockQuery });
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            full_name: "Charlie",
            phone_number: "1234567890",
            shopId: "shop-test-1",
          }),
        })
      );
    });

    it("should auto-inject shopId into all items on createMany", async () => {
      const mockQuery = vi.fn().mockResolvedValue({ count: 2 });
      const args = {
        data: [
          { type: "credit", category: "interest_received", amount: 100 },
          { type: "debit", category: "principal_disbursed", amount: 500 },
        ],
      };

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        await allModels.createMany({ model: "LedgerEntry", args, query: mockQuery });
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            expect.objectContaining({ shopId: "shop-test-1", type: "credit" }),
            expect.objectContaining({ shopId: "shop-test-1", type: "debit" }),
          ],
        })
      );
    });

    it("should auto-inject shopId on upsert into args.create", async () => {
      const mockQuery = vi.fn().mockResolvedValue({ id: "r-1" });
      const args = {
        where: { shopId_name: { shopId: "shop-test-1", name: "manager" } },
        create: { name: "manager", description: "Store Manager" },
        update: { description: "Updated Manager" },
      };

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        await allModels.upsert({ model: "Role", args, query: mockQuery });
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            shopId: "shop-test-1",
            name: "manager",
          }),
        })
      );
    });

    it("should intercept delete on soft-delete models and perform update with deletedAt", async () => {
      const mockCustomerDelegate = {
        findFirst: vi.fn().mockResolvedValue({
          id: "c-to-delete",
          shopId: "shop-test-1",
          deletedAt: null,
        }),
        update: vi.fn().mockResolvedValue({
          id: "c-to-delete",
          shopId: "shop-test-1",
          deletedAt: new Date(),
        }),
      };
      vi.spyOn(globalPrisma, "customer", "get").mockReturnValue(
        mockCustomerDelegate as unknown as typeof globalPrisma.customer
      );

      const mockQuery = vi.fn();
      const args = { where: { id: "c-to-delete" } };

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        await allModels.delete({
          model: "Customer",
          args,
          query: mockQuery,
        });
      });

      expect(mockCustomerDelegate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "c-to-delete" },
          data: { deletedAt: expect.any(Date) },
        })
      );
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should intercept deleteMany on soft-delete models and perform updateMany with deletedAt", async () => {
      const mockCustomerDelegate = {
        updateMany: vi.fn().mockResolvedValue({ count: 3 }),
      };
      vi.spyOn(globalPrisma, "customer", "get").mockReturnValue(
        mockCustomerDelegate as unknown as typeof globalPrisma.customer
      );

      const mockQuery = vi.fn();
      const args = { where: { kycStatus: "rejected" } };

      await runWithTenantContext({ shopId: "shop-test-1" }, async () => {
        await allModels.deleteMany({
          model: "Customer",
          args,
          query: mockQuery,
        });
      });

      expect(mockCustomerDelegate.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            kycStatus: "rejected",
            shopId: "shop-test-1",
            deletedAt: null,
          },
          data: { deletedAt: expect.any(Date) },
        })
      );
    });

    it("should prevent updating records belonging to another tenant", async () => {
      const mockCustomerDelegate = {
        findFirst: vi.fn().mockResolvedValue(null),
      };
      vi.spyOn(globalPrisma, "customer", "get").mockReturnValue(
        mockCustomerDelegate as unknown as typeof globalPrisma.customer
      );

      const mockQuery = vi.fn();
      const args = {
        where: { id: "cust-belonging-to-tenant-B" },
        data: { full_name: "Hacked Name" },
      };

      await runWithTenantContext({ shopId: "tenant-A" }, async () => {
        await expect(
          allModels.update({
            model: "Customer",
            args,
            query: mockQuery,
          })
        ).rejects.toThrow(/Record to update not found or access denied/);
      });
    });

    it("should prevent deleting records belonging to another tenant", async () => {
      const mockCustomerDelegate = {
        findFirst: vi.fn().mockResolvedValue(null),
      };
      vi.spyOn(globalPrisma, "customer", "get").mockReturnValue(
        mockCustomerDelegate as unknown as typeof globalPrisma.customer
      );

      const mockQuery = vi.fn();
      const args = { where: { id: "cust-belonging-to-tenant-B" } };

      await runWithTenantContext({ shopId: "tenant-A" }, async () => {
        await expect(
          allModels.delete({
            model: "Customer",
            args,
            query: mockQuery,
          })
        ).rejects.toThrow(/Record to delete not found or access denied/);
      });
    });

    it("should allow public/unauthenticated queries without injecting shopId when context is undefined", async () => {
      const mockQuery = vi.fn().mockResolvedValue([]);
      const args = { where: {} };

      await allModels.findMany({
        model: "Permission",
        args,
        query: mockQuery,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });
  });
});

