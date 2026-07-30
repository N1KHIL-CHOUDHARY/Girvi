import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NewCustomer from "@/app/(dashboard)/customers/new/page";
import UpdateCustomer from "@/app/(dashboard)/customers/[id]/edit/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({
    id: "cust-123",
  }),
  usePathname: () => "/customers/new",
  notFound: () => {
    throw new Error("notFound triggered");
  },
}));

vi.mock("@/services/api", () => ({
  createAccount: vi.fn(),
  updateAccount: vi.fn(),
  getAccountById: vi.fn().mockResolvedValue({
    data: {
      id: "cust-123",
      full_name: "Original Name",
      phone_number: "1234567890",
      gender: "Male",
      address: {
        line1: "123 St",
        city: "City",
        pincode: "123456",
      },
      aadhaar_number: "",
      pan_number: "",
      customer_photo_url: "",
    },
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("Customer Pages Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display inline errors on NewCustomer submit if fields are empty", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NewCustomer />
      </QueryClientProvider>
    );

    const submitButton = screen.getByRole("button", { name: /save customer/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText("Full name is required")).toBeInTheDocument();
    expect(screen.getByText("Phone number is required")).toBeInTheDocument();
  });

  it("should show error on edit customer form if phone is invalid", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UpdateCustomer />
      </QueryClientProvider>
    );

    const nameInput = await screen.findByLabelText(/full name/i);
    expect(nameInput).toBeInTheDocument();

    const phoneInput = screen.getByLabelText(/phone number/i);
    fireEvent.change(phoneInput, { target: { value: "123" } });

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText("Phone number must be at least 10 digits")).toBeInTheDocument();
  });
});
