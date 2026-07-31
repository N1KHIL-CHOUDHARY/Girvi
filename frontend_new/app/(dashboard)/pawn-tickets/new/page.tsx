"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Search, ImagePlus, Loader2, ArrowLeft, User, Calendar } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import FileUpload from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  createPawnTicket,
  getAccounts,
  uploadFile,
  getApiErrorMessage,
} from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import { pawnTicketKeys, customerKeys } from "@/lib/queryKeys";
import type { CustomerListItem } from "@/types/customer";

const selectClass =
  "h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]";

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

  // Search customer state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState<PawnFormState>({
    customerId: "",
    ticketNumber: `TICKET-${Math.floor(10000 + Math.random() * 90000)}`,
    loanAmount: "10000",
    interestRate: "3",
    advanceAmount: "1500",
    pawnedDate: getTodayDateString(),
    itemName: "",
    itemType: "gold",
    itemWeight: "",
    itemPurity: "",
    itemDescription: "",
    itemPhotoUrl: "",
  });

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

    const loanVal = parseFloat(formData.loanAmount);
    const interestVal = parseFloat(formData.interestRate);
    const advVal = parseFloat(formData.advanceAmount);
    const weightVal = parseFloat(formData.itemWeight);

    if (isNaN(loanVal) || loanVal <= 0) {
      toast.error("Please enter a valid loan amount.");
      return;
    }

    if (isNaN(interestVal) || interestVal < 0) {
      toast.error("Please enter a valid interest rate.");
      return;
    }

    if (isNaN(advVal) || advVal < 0) {
      toast.error("Please enter a valid advance amount.");
      return;
    }

    if (!formData.itemName.trim()) {
      toast.error("Item name is required.");
      return;
    }

    if (isNaN(weightVal) || weightVal <= 0) {
      toast.error("Please enter a valid item weight.");
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
          purity: formData.itemPurity ? parseFloat(formData.itemPurity) : null,
          description: formData.itemDescription.trim() || undefined,
          item_photo_url: formData.itemPhotoUrl || undefined,
        },
      ],
    };

    mutation.mutate(payload);
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/pawn-tickets"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create Pawn Ticket</h1>
          <p className="mt-1 text-sm text-slate-500">Add new pawn ticket and item details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Card: Customer & Ticket Details */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-50 pb-3">
            Customer &amp; Ticket Info
          </h3>

          {/* Customer Search & Select */}
          <div className="relative">
            <Label htmlFor="customerSearch">Search & Select Customer</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="customerSearch"
                placeholder="Type customer name or phone number..."
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
                className={`${inputClass} pl-9`}
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>

            {/* Dropdown list */}
            {showDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-100 bg-white py-1 shadow-lg ring-1 ring-black/5">
                {customerData?.data && customerData.data.length > 0 ? (
                  customerData.data.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectCustomer(cust)}
                      className="flex w-full flex-col px-4 py-2 text-left hover:bg-slate-50"
                    >
                      <span className="text-sm font-medium text-slate-900">{cust.full_name}</span>
                      <span className="text-xs text-slate-500">{cust.phone_number}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2.5 text-sm text-slate-500">No customers found</div>
                )}
              </div>
            )}

            {/* Selected customer card display */}
            {selectedCustomer && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-50 bg-[#EEF2FB] px-4 py-2.5">
                <User className="h-4.5 w-4.5 text-[#1E3A66]" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Selected: {selectedCustomer.full_name}</p>
                  <p className="text-slate-500">{selectedCustomer.phone_number}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ticketNumber">Ticket Number</Label>
              <Input
                id="ticketNumber"
                name="ticketNumber"
                value={formData.ticketNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="pawnedDate">Pawned Date</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
              <Input
                id="loanAmount"
                name="loanAmount"
                type="number"
                value={formData.loanAmount}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="interestRate">Interest Rate (% monthly)</Label>
              <Input
                id="interestRate"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="advanceAmount">Advance Amount (₹)</Label>
            <Input
              id="advanceAmount"
              name="advanceAmount"
              type="number"
              value={formData.advanceAmount}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Right Card: Item Details */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-50 pb-3">
            Item Specifications
          </h3>

          <div>
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              name="itemName"
              placeholder="e.g. Gold Chain, Silver Ring"
              value={formData.itemName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemType">Item Category</Label>
              <select
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="diamond">Diamond</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="itemWeight">Weight (grams)</Label>
              <Input
                id="itemWeight"
                name="itemWeight"
                type="number"
                step="0.01"
                placeholder="22.50"
                value={formData.itemWeight}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemPurity">Purity (Karat/Purity value)</Label>
              <Input
                id="itemPurity"
                name="itemPurity"
                placeholder="e.g. 22"
                value={formData.itemPurity}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Item Photo</Label>
              <FileUpload
                value={formData.itemPhotoUrl}
                onUpload={async (file) => {
                  const res = await uploadFile<{ url: string }>(file);
                  return res.data.url;
                }}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, itemPhotoUrl: url }))
                }
                label="Item photo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="itemDescription">Detailed Item Description</Label>
            <textarea
              id="itemDescription"
              name="itemDescription"
              rows={3}
              placeholder="Describe markings, damage, hooks or designs..."
              value={formData.itemDescription}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 lg:col-span-2 border-t border-slate-100 pt-6">
          <Link
            href="/pawn-tickets"
            className="flex items-center justify-center rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#1E3A66] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#17294D] disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Pawn Ticket"
            )}
          </button>
        </div>
      </form>
    </AppShell>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]";