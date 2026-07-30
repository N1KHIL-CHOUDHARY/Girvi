import { describe, it, expect, vi, beforeEach } from "vitest";
import { paymentService } from "../../src/modules/payment/payment.service";
import { tenantContext } from "../../src/common/context/tenant.context";
import { prisma } from "../../src/config/database";
import { AppError, NotFoundError } from "../../src/common/errors/AppError";

vi.mock("../../src/config/database", () => ({
  prisma: {
    pawnTicket: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe("PaymentService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw AppError if tenant context is missing on createPayment", async () => {
    vi.spyOn(tenantContext, "getStore").mockReturnValue({});
    await expect(
      paymentService.createPayment({ ticket_id: "t-1", amount_paid: 100, payment_for: "principal" })
    ).rejects.toThrow(new AppError("Tenant context required", 400));
  });

  it("should throw NotFoundError if pawn ticket is not found", async () => {
    vi.spyOn(tenantContext, "getStore").mockReturnValue({ shopId: "shop-1" });
    vi.mocked(prisma.pawnTicket.findFirst).mockResolvedValue(null);

    await expect(
      paymentService.createPayment({ ticket_id: "t-invalid", amount_paid: 100, payment_for: "principal" })
    ).rejects.toThrow(new NotFoundError("Pawn ticket not found"));
  });
});
