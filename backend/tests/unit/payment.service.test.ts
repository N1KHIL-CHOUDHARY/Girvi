import { describe, it, expect, vi, beforeEach } from "vitest";
import { paymentService } from "../../src/modules/payment/payment.service";
import { paymentRepository } from "../../src/modules/payment/payment.repository";
import { tenantContext } from "../../src/common/context/tenant.context";
import { prisma } from "../../src/config/database";
import { AppError, NotFoundError, ValidationError } from "../../src/common/errors/AppError";
import { Payment, PawnTicket, LedgerEntry, Prisma } from "@prisma/client";

vi.mock("../../src/modules/payment/payment.repository");

vi.mock("../../src/config/database", () => {
  const mockTx = {
    auditLog: {
      create: vi.fn(),
    },
    payment: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  return {
    prisma: {
      $transaction: vi.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
      auditLog: {
        create: vi.fn(),
      },
      payment: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
      },
    },
  };
});

describe("PaymentService Unit Tests", () => {
  const mockShopId = "shop-uuid-123";
  const mockUserId = "user-uuid-456";

  const createMockTicket = (overrides: Partial<PawnTicket> = {}): PawnTicket => ({
    id: "ticket-1",
    shopId: mockShopId,
    customerId: "cust-1",
    ticketNumber: "T-001",
    loanAmount: new Prisma.Decimal(1000),
    originalLoanAmount: new Prisma.Decimal(1000),
    interestRate: new Prisma.Decimal(2),
    advAmount: new Prisma.Decimal(0),
    interestType: "monthly",
    graceDays: 0,
    loanDuration: 12,
    pawnedDate: new Date("2026-08-01T00:00:00Z"),
    renewalDate: null,
    maturityDate: null,
    auctionDate: null,
    status: "active",
    settledDate: null,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
    deletedAt: null,
    ...overrides,
  });

  const createMockPayment = (overrides: Partial<Payment> = {}): Payment => ({
    id: "pay-1",
    shopId: mockShopId,
    customerId: "cust-1",
    ticketId: "ticket-1",
    amountPaid: new Prisma.Decimal(500),
    paymentFor: "principal",
    paymentDate: new Date("2026-08-09T10:00:00Z"),
    idempotencyKey: "idem-key-123",
    createdAt: new Date("2026-08-09T10:00:00Z"),
    updatedAt: new Date("2026-08-09T10:00:00Z"),
    deletedAt: null,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(tenantContext, "getStore").mockReturnValue({
      shopId: mockShopId,
      userId: mockUserId,
    });
  });

  it("should throw AppError if tenant context is missing on createPayment", async () => {
    vi.spyOn(tenantContext, "getStore").mockReturnValue({});
    await expect(
      paymentService.createPayment({
        ticket_id: "t-1",
        amount_paid: 100,
        payment_for: "principal",
      })
    ).rejects.toThrow(new AppError("Tenant context required", 400));
  });

  it("should return existing payment immediately when idempotencyKey is already used (Duplicate Retry)", async () => {
    const existingPayment: Payment & { ticket: PawnTicket } = {
      ...createMockPayment({
        id: "pay-existing-1",
        amountPaid: new Prisma.Decimal(500),
        idempotencyKey: "unique-key-abc",
      }),
      ticket: createMockTicket({
        loanAmount: new Prisma.Decimal(1500),
        status: "active",
      }),
    };

    vi.mocked(paymentRepository.findByIdempotencyKey).mockResolvedValue(existingPayment);

    const result = await paymentService.createPayment({
      ticket_id: "ticket-1",
      amount_paid: 500,
      payment_for: "principal",
      idempotencyKey: "unique-key-abc",
    });

    expect(result.isDuplicate).toBe(true);
    expect(result.payment.id).toBe("pay-existing-1");
    expect(result.remaining_balance).toBe("1500");
    expect(result.ticket_status).toBe("active");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if pawn ticket is not found during row lock", async () => {
    vi.mocked(paymentRepository.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(paymentRepository.lockTicket).mockResolvedValue(null);

    await expect(
      paymentService.createPayment({
        ticket_id: "t-invalid",
        amount_paid: 100,
        payment_for: "principal",
      })
    ).rejects.toThrow(new NotFoundError("Pawn ticket not found"));
  });

  it("should throw ValidationError if ticket status is not active or defaulted (e.g. settled)", async () => {
    const mockTicket = createMockTicket({
      id: "ticket-settled",
      loanAmount: new Prisma.Decimal(0),
      status: "settled",
    });

    vi.mocked(paymentRepository.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(paymentRepository.lockTicket).mockResolvedValue(mockTicket);

    await expect(
      paymentService.createPayment({
        ticket_id: "ticket-settled",
        amount_paid: 100,
        payment_for: "principal",
      })
    ).rejects.toThrow(new ValidationError("Cannot post payment: Ticket is already 'settled'"));
  });

  it("should throw ValidationError if principal repayment exceeds remaining loan balance", async () => {
    const mockTicket = createMockTicket({
      id: "ticket-active",
      loanAmount: new Prisma.Decimal(1000),
      status: "active",
    });

    vi.mocked(paymentRepository.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(paymentRepository.lockTicket).mockResolvedValue(mockTicket);

    await expect(
      paymentService.createPayment({
        ticket_id: "ticket-active",
        amount_paid: 1500,
        payment_for: "principal",
      })
    ).rejects.toThrow(
      new ValidationError("Payment amount of 1500 exceeds the remaining loan balance of 1000")
    );
  });

  it("should successfully process a partial principal payment with atomic balance update, ledger and audit entries", async () => {
    const mockTicket = createMockTicket({
      id: "ticket-1",
      loanAmount: new Prisma.Decimal(2000),
      status: "active",
      settledDate: null,
    });

    const updatedTicket = createMockTicket({
      ...mockTicket,
      loanAmount: new Prisma.Decimal(1500),
    });

    const createdPayment = createMockPayment({
      id: "pay-1",
      amountPaid: new Prisma.Decimal(500),
      paymentFor: "principal",
      idempotencyKey: "idem-key-123",
    });

    vi.mocked(paymentRepository.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(paymentRepository.lockTicket).mockResolvedValue(mockTicket);
    vi.mocked(paymentRepository.updateTicket).mockResolvedValue(updatedTicket);
    vi.mocked(paymentRepository.createPayment).mockResolvedValue(createdPayment);
    vi.mocked(paymentRepository.createLedgerEntry).mockResolvedValue({} as LedgerEntry);

    const result = await paymentService.createPayment({
      ticket_id: "ticket-1",
      amount_paid: 500,
      payment_for: "principal",
      idempotencyKey: "idem-key-123",
      payment_date: "2026-08-09T10:00:00Z",
    });

    expect(result.isDuplicate).toBe(false);
    expect(result.payment.id).toBe("pay-1");
    expect(result.remaining_balance).toBe("1500");
    expect(result.ticket_status).toBe("active");

    // Verify ticket update
    expect(paymentRepository.updateTicket).toHaveBeenCalledWith(
      expect.anything(),
      "ticket-1",
      expect.objectContaining({
        loanAmount: new Prisma.Decimal(1500),
        status: "active",
      })
    );

    // Verify ledger entry
    expect(paymentRepository.createLedgerEntry).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: "credit",
        category: "principal_repaid",
        amount: new Prisma.Decimal(500),
      })
    );
  });

  it("should transition ticket status to settled and set settled_date when remaining balance reaches 0", async () => {
    const mockTicket = createMockTicket({
      id: "ticket-payoff",
      loanAmount: new Prisma.Decimal(500),
      status: "active",
      settledDate: null,
    });

    const updatedTicket = createMockTicket({
      ...mockTicket,
      loanAmount: new Prisma.Decimal(0),
      status: "settled",
      settledDate: new Date("2026-08-09T12:00:00Z"),
    });

    const createdPayment = createMockPayment({
      id: "pay-full",
      ticketId: "ticket-payoff",
      amountPaid: new Prisma.Decimal(500),
      paymentFor: "principal",
      idempotencyKey: null,
    });

    vi.mocked(paymentRepository.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(paymentRepository.lockTicket).mockResolvedValue(mockTicket);
    vi.mocked(paymentRepository.updateTicket).mockResolvedValue(updatedTicket);
    vi.mocked(paymentRepository.createPayment).mockResolvedValue(createdPayment);
    vi.mocked(paymentRepository.createLedgerEntry).mockResolvedValue({} as LedgerEntry);

    const result = await paymentService.createPayment({
      ticket_id: "ticket-payoff",
      amount_paid: 500,
      payment_for: "principal",
      payment_date: "2026-08-09T12:00:00Z",
    });

    expect(result.isDuplicate).toBe(false);
    expect(result.remaining_balance).toBe("0");
    expect(result.ticket_status).toBe("settled");

    expect(paymentRepository.updateTicket).toHaveBeenCalledWith(
      expect.anything(),
      "ticket-payoff",
      expect.objectContaining({
        loanAmount: new Prisma.Decimal(0),
        status: "settled",
      })
    );
  });

  it("should process interest payment with category interest_received without deducting loan principal", async () => {
    const mockTicket = createMockTicket({
      id: "ticket-interest",
      loanAmount: new Prisma.Decimal(1000),
      status: "active",
      settledDate: null,
    });

    const updatedTicket = createMockTicket({
      ...mockTicket,
      loanAmount: new Prisma.Decimal(1000),
      status: "active",
    });

    const createdPayment = createMockPayment({
      id: "pay-interest",
      ticketId: "ticket-interest",
      amountPaid: new Prisma.Decimal(100),
      paymentFor: "interest",
      idempotencyKey: null,
    });

    vi.mocked(paymentRepository.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(paymentRepository.lockTicket).mockResolvedValue(mockTicket);
    vi.mocked(paymentRepository.updateTicket).mockResolvedValue(updatedTicket);
    vi.mocked(paymentRepository.createPayment).mockResolvedValue(createdPayment);
    vi.mocked(paymentRepository.createLedgerEntry).mockResolvedValue({} as LedgerEntry);

    const result = await paymentService.createPayment({
      ticket_id: "ticket-interest",
      amount_paid: 100,
      payment_for: "interest",
    });

    expect(result.isDuplicate).toBe(false);
    expect(result.remaining_balance).toBe("1000");

    expect(paymentRepository.createLedgerEntry).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: "credit",
        category: "interest_received",
        amount: new Prisma.Decimal(100),
      })
    );
  });

  it("should return formatted payments for a ticket in getPaymentsForTicket", async () => {
    const mockPayments: Payment[] = [
      createMockPayment({
        id: "p-1",
        amountPaid: new Prisma.Decimal(250),
        paymentFor: "interest",
        paymentDate: new Date("2026-08-05T10:00:00Z"),
      }),
    ];

    vi.mocked(paymentRepository.findByTicketId).mockResolvedValue(mockPayments);

    const list = await paymentService.getPaymentsForTicket("ticket-1");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("p-1");
    expect(list[0].amount_paid).toBe("250");
    expect(list[0].payment_for).toBe("interest");
  });
});
