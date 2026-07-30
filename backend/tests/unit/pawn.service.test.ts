import { describe, it, expect, vi, beforeEach } from "vitest";
import { pawnService } from "../../src/modules/pawn/pawn.service";
import { pawnRepository } from "../../src/modules/pawn/pawn.repository";
import { tenantContext } from "../../src/common/context/tenant.context";
import { AppError, NotFoundError } from "../../src/common/errors/AppError";

vi.mock("../../src/modules/pawn/pawn.repository");
vi.mock("../../src/config/database", () => ({
  prisma: {
    customer: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe("PawnService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw AppError if tenant context is missing on createTicket", async () => {
    vi.spyOn(tenantContext, "getStore").mockReturnValue({});
    await expect(pawnService.createTicket({ customer_id: "c-1" })).rejects.toThrow(
      new AppError("Tenant context required", 400)
    );
  });

  it("should throw NotFoundError if ticket by ID is not found", async () => {
    vi.mocked(pawnRepository.findById).mockResolvedValue(null);
    await expect(pawnService.getTicketById("t-invalid")).rejects.toThrow(
      new NotFoundError("Pawn ticket not found")
    );
  });
});
