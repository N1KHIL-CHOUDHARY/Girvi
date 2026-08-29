"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Search,
  Loader2,
  ArrowLeft,
  User,
  Package,
  Calculator,
  Plus,
} from "lucide-react";

import FileUpload from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  createPawnTicket,
  getAccounts,
  uploadFile,
  getApiErrorMessage,
} from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import { pawnTicketKeys, customerKeys } from "@/lib/queryKeys";
import { formatCurrency } from "@/lib/format";
import type { CustomerListItem } from "@/types/customer";

interface PawnFormState {
  customerId: string;
  ticketNumber: string;
  loanAmount: string;
  interestRate: string;
  advanceAmount: string;
  pawnedDate: string;
  itemName: string;
  itemType: string;
  itemWeight: string;
  itemPurity: string;
  itemDescription: string;
  itemPhotoUrl: string;
}

const getTodayDateString = () => {
  return new Date().toISOString().slice(0, 10);
};

export default function NewPawnTicket() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState<PawnFormState>(() => ({
    customerId: "",
    ticketNumber: `T-${Math.floor(1000 + Math.random() * 9000)}`,
    loanAmount: "10000",
    interestRate: "3.0",
    advanceAmount: "0",
    pawnedDate: getTodayDateString(),
    itemName: "",
    itemType: "gold",
    itemWeight: "",
    itemPurity: "22K (91.6%)",
    itemDescription: "",
    itemPhotoUrl: "",
  }));


  const { data: customerData, isLoading: isSearching } = useQuery({
    queryKey: customerKeys.list(1, debouncedSearchQuery),
    queryFn: async () => {
      const res = await getAccounts<CustomerListItem[]>(1, debouncedSearchQuery);
      return res;
    },
    enabled: debouncedSearchQuery.trim().length > 0,
  });

  const handleSelectCustomer = (customer: CustomerListItem) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setSearchQuery(customer.full_name);
    setShowDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loanVal = parseFloat(formData.loanAmount) || 0;
  const interestVal = parseFloat(formData.interestRate) || 0;
  const advVal = parseFloat(formData.advanceAmount) || 0;
  const monthlyInterest = (loanVal * interestVal) / 100;
  const netDisbursed = Math.max(0, loanVal - advVal);

  const mutation = useMutation({
    mutationFn: (payload: any) => createPawnTicket(payload),
    onSuccess: () => {
      toast.success("Pawn ticket created successfully");
      queryClient.invalidateQueries({ queryKey: pawnTicketKeys.all });
      router.push("/pawn-tickets");
    },
    onError: (err: any) => {
      const payload = err?.response?.data;
      if (payload?.error && typeof payload.error === "object") {
        const details = payload.error.details;
        if (details && typeof details === "object") {
          toast.error("Validation error: " + Object.values(details).flat().join(", "));
          return;
        }
      }
      toast.error(getApiErrorMessage(err, "Failed to create pawn ticket"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      toast.error("Please search and select a customer.");
      return;
    }

    if (!formData.ticketNumber.trim()) {
      toast.error("Ticket number is required.");
      return;
    }

    const weightVal = parseFloat(formData.itemWeight);

    if (loanVal <= 0) {
      toast.error("Please enter a valid loan amount.");
      return;
    }

    if (!formData.itemName.trim()) {
      toast.error("Item name is required.");
      return;
    }

    if (isNaN(weightVal) || weightVal <= 0) {
      toast.error("Please enter a valid item weight in grams.");
      return;
    }

    const payload = {
      customer_id: formData.customerId,
      ticket_number: formData.ticketNumber.trim(),
      loan_amount: loanVal,
      interest_rate: interestVal,
      adv_amount: advVal,
      pawned_date: formData.pawnedDate,
      items: [
        {
          name: formData.itemName.trim(),
          type: formData.itemType,
          weight_grams: weightVal,
          purity: formData.itemPurity.trim() ? formData.itemPurity.trim() : undefined,
          description: formData.itemDescription.trim() || undefined,
          item_photo_url: formData.itemPhotoUrl || undefined,
        },
      ],
    };

    mutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Loans & Tickets →"
        title="Originate Pawn Ticket"
        subtitle="Record new collateral pledge, verify borrower KYC, and generate pawn agreement."
        breadcrumbs={
          <Link
            href="/pawn-tickets"
            className="inline-flex items-center gap-1 text-xs text-[#55606D] hover:text-[#14181F]"
          >
            <ArrowLeft className="h-3 w-3" /> Back to ledger
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Customer & Loan Terms */}
          <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
              <User className="h-4 w-4 text-[#314259]" />
              <h2 className="text-sm font-semibold text-[#14181F]">
                Borrower &amp; Loan Parameters
              </h2>
            </div>

            {/* Customer Search & Select */}
            <div className="relative">
              <Label htmlFor="customerSearch" required>
                Select Borrower Profile
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A94A3]" />
                <input
                  id="customerSearch"
                  placeholder="Type name, phone, or Aadhaar..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                    if (selectedCustomer && e.target.value !== selectedCustomer.full_name) {
                      setSelectedCustomer(null);
                      setFormData((prev) => ({ ...prev, customerId: "" }));
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="h-10 w-full rounded-xl border border-[#E7E9EC] bg-white pl-9 pr-4 text-xs text-[#14181F] placeholder:text-[#8A94A3] focus:border-[#14181F] focus:outline-none focus:ring-1 focus:ring-[#14181F]"
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#8A94A3]" />
                  </div>
                )}
              </div>

              {/* Dropdown list */}
              {showDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[#E7E9EC] bg-white py-1 shadow-lg">
                  {Array.isArray(customerData?.data) && customerData.data.length > 0 ? (
                    customerData.data.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className="flex w-full flex-col px-3.5 py-2 text-left hover:bg-[#F6F7F8] cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-[#14181F]">{cust.full_name}</span>
                        <span className="text-[11px] text-[#8A94A3] font-mono">{cust.phone_number}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-[#8A94A3]">
                      No matching customer.{" "}
                      <Link href="/customers/new" className="text-[#14181F] underline font-medium">
                        Create new customer
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Customer Card */}
              {selectedCustomer && (
                <div className="mt-2.5 flex items-center justify-between rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#14181F] text-[11px] font-semibold text-white">
                      {selectedCustomer.full_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-[#14181F] block">{selectedCustomer.full_name}</span>
                      <span className="text-[11px] text-[#8A94A3] font-mono">{selectedCustomer.phone_number}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#059669]">KYC Ready ✓</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ticketNumber" required>
                  Ticket Number
                </Label>
                <Input
                  id="ticketNumber"
                  name="ticketNumber"
                  value={formData.ticketNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pawnedDate" required>
                  Pawn Date
                </Label>
                <Input
                  id="pawnedDate"
                  name="pawnedDate"
                  type="date"
                  value={formData.pawnedDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="loanAmount" required>
                  Loan Principal (₹)
                </Label>
                <Input
                  id="loanAmount"
                  name="loanAmount"
                  type="number"
                  step="100"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="interestRate" required>
                  Interest Rate (% / mo)
                </Label>
                <Input
                  id="interestRate"
                  name="interestRate"
                  type="number"
                  step="0.1"
                  value={formData.interestRate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="advanceAmount">Advance / Deductions (₹)</Label>
              <Input
                id="advanceAmount"
                name="advanceAmount"
                type="number"
                value={formData.advanceAmount}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Right Column: Collateral Specifications & Calculator */}
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
                <Package className="h-4 w-4 text-[#314259]" />
                <h2 className="text-sm font-semibold text-[#14181F]">
                  Collateral Asset Specification
                </h2>
              </div>

              <div>
                <Label htmlFor="itemName" required>
                  Item Description / Name
                </Label>
                <Input
                  id="itemName"
                  name="itemName"
                  placeholder="e.g. 22K Gold Figaro Necklace"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="itemType">Category</Label>
                  <select
                    id="itemType"
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleChange}
                    className="h-10 w-full rounded-xl border border-[#E7E9EC] bg-white px-3 text-xs text-[#14181F] focus:border-[#14181F] focus:outline-none focus:ring-1 focus:ring-[#14181F] cursor-pointer"
                  >
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="diamond">Diamond</option>
                    <option value="other">Other Watch / Luxury</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="itemWeight" required>
                    Gross Weight (grams)
                  </Label>
                  <Input
                    id="itemWeight"
                    name="itemWeight"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 24.50"
                    value={formData.itemWeight}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="itemPurity">Purity / Karat</Label>
                <Input
                  id="itemPurity"
                  name="itemPurity"
                  placeholder="e.g. 22K (91.6%)"
                  value={formData.itemPurity}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Collateral Photograph</Label>
                <FileUpload
                  value={formData.itemPhotoUrl}
                  onUpload={async (file) => {
                    const res = await uploadFile<{ url: string }>(file);
                    return res.data.url;
                  }}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, itemPhotoUrl: url }))
                  }
                  label="Pledged item photo"
                />
              </div>
            </div>

            {/* Live Financial Calculation Box */}
            <div className="rounded-xl border border-[#E7E9EC] bg-[#F6F7F8] p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14181F]">
                <Calculator className="h-4 w-4 text-[#314259]" />
                <span>Live Loan Calculator</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[#8A94A3] text-[11px] block">Monthly Interest</span>
                  <span className="font-mono font-semibold text-[#14181F]">
                    {formatCurrency(monthlyInterest)}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A94A3] text-[11px] block">Annual APR</span>
                  <span className="font-mono font-semibold text-[#14181F]">
                    {(interestVal * 12).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[#8A94A3] text-[11px] block">Net Disbursed</span>
                  <span className="font-mono font-semibold text-[#059669]">
                    {formatCurrency(netDisbursed)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E7E9EC] pt-4">
          <Button
            variant="secondary"
            onClick={() => router.push("/pawn-tickets")}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={mutation.isPending}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Originate Pawn Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}