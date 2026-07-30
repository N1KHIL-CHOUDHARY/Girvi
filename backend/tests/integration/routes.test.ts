import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app";

vi.mock("../../src/config/database", () => {
  const mockPrisma = {
    customer: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    pawnTicket: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    auditLog: {
      create: vi.fn(),
    },
  };
  return {
    prisma: mockPrisma,
  };
});

vi.mock("../../src/config/redis", () => ({
  redisClient: {
    isOpen: false,
    connect: vi.fn(),
    get: vi.fn(),
    setEx: vi.fn(),
    del: vi.fn(),
  },
}));

describe("API Route Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /version should return 200", async () => {
    const res = await request(app).get("/version");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("version");
  });

  it("POST /api/v1/auth/login should return 400 on empty credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "", password: "" });
    expect(res.status).toBe(400);
  });

  it("GET /api/v1/app/customers should return 401 without authorization header", async () => {
    const res = await request(app).get("/api/v1/app/customers");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/app/pawns should return 401 without authorization header", async () => {
    const res = await request(app).get("/api/v1/app/pawns");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/app/payments/ticket/invalid-id should return 401 without authorization header", async () => {
    const res = await request(app).get("/api/v1/app/payments/ticket/invalid-id");
    expect(res.status).toBe(401);
  });
});
