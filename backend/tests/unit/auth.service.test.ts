import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../../src/modules/auth/auth.service";

vi.mock("../../src/modules/auth/auth.repository");
vi.mock("../../src/config/redis", () => ({
  redisClient: {
    isOpen: true,
    setEx: vi.fn(),
  },
}));
vi.mock("../../src/jobs", () => ({
  queueEmail: vi.fn(),
}));

describe("AuthService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    const authService = new AuthService();
    expect(authService).toBeDefined();
  });
});
