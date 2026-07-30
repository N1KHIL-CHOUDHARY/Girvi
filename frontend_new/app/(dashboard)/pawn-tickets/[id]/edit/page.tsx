"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import toast from "react-hot-toast";

import { AppShell } from "@/components/layout/AppShell";
import FileUpload from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  getApiErrorMessage,
  getPawnTicketById,
  updatePawnTicket,
  uploadFile,
} from "@/services/api";

type CustomerReference =
  | string
  | {
      _id?: string;
      id?: string;
      full_name?: string;
      fullName?: string;
      firstName?: string;
      lastName?: string;
    };

interface PawnItemDto {
  name?: string;
  type?: string;
  weight_grams?: number | string;
  purity?: number | string | null;
  description?: string;
  item_photo_url?: string;
}

interface PawnTicketDto {
  _id: string;
  customer_id: CustomerReference;
  ticket_number: string;
  loan_amount: number | string;
  interest_rate: number | string;
  adv_amount: number | string;
  pawned_date: string;
  items?: PawnItemDto[];
}

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

interface PawnUpdatePayload {
  customer_id: string;
  ticket_number: string;
  loan_amount: number;
  interest_rate: number;
  adv_amount: number;
  pawned_date: string;
  items: Array<{
    name: string;
    type: string;
    weight_grams: number;
    purity?: number;
    description: string;
    item_photo_url?: string;
  }>;
}

const initialFormState: PawnFormState = {
  customerId: "",
  ticketNumber: "",
  loanAmount: "",
  interestRate: "",
  advanceAmount: "",
  pawnedDate: "",
  itemName: "",
  itemType: "gold",
  itemWeight: "",
  itemPurity: "",
  itemDescription: "",
  itemPhotoUrl: "",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toStringValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
};

const toDateInputValue = (value: unknown): string => {
  const date = new Date(value as string | number | Date);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const getCustomerDisplayName = (customer: CustomerReference): string => {
  if (!isRecord(customer)) {
    return toStringValue(customer);
  }

  const fullName =
    toStringValue(customer.full_name) ||
    toStringValue(customer.fullName) ||
    [toStringValue(customer.firstName), toStringValue(customer.lastName)]
      .filter(Boolean)
      .join(" ")
      .trim();

  return fullName || toStringValue(customer._id) || toStringValue(customer.id);
};

const getCustomerId = (customer: CustomerReference): string => {
  if (!isRecord(customer)) {
    return toStringValue(customer);
  }

  return toStringValue(customer._id) || toStringValue(customer.id);
};

const parseRequiredNumber = (value: string, label: string): number => {
  const parsedValue = Number.parseFloat(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${label} must be a valid number.`);
  }

  return parsedValue;
};

const parseOptionalNumber = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  const parsedValue = Number.parseFloat(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error("Purity must be a valid number.");
  }

  return parsedValue;
};

const mapPawnTicketToForm = (ticket: PawnTicketDto) => {
  const customerId = getCustomerId(ticket.customer_id);
  const customerLabel = getCustomerDisplayName(ticket.customer_id) || customerId;
  const item = ticket.items?.[0] ?? {};

  return {
    customerLabel,
    formData: {
      customerId,
      ticketNumber: toStringValue(ticket.ticket_number),
      loanAmount: toStringValue(ticket.loan_amount),
      interestRate: toStringValue(ticket.interest_rate),
      advanceAmount: toStringValue(ticket.adv_amount),
      pawnedDate: toDateInputValue(ticket.pawned_date),
      itemName: toStringValue(item.name),
      itemType: toStringValue(item.type) || "gold",
      itemWeight: toStringValue(item.weight_grams),
      itemPurity: toStringValue(item.purity),
      itemDescription: toStringValue(item.description),
      itemPhotoUrl: toStringValue(item.item_photo_url),
    } satisfies PawnFormState,
  };
};

const buildPawnUpdatePayload = (formData: PawnFormState): PawnUpdatePayload => ({
  customer_id: formData.customerId,
  ticket_number: formData.ticketNumber.trim(),
  loan_amount: parseRequiredNumber(formData.loanAmount, "Loan amount"),
  interest_rate: parseRequiredNumber(formData.interestRate, "Interest rate"),
  adv_amount: parseRequiredNumber(formData.advanceAmount, "Advance amount"),
  pawned_date: formData.pawnedDate,
  items: [
    {
      name: formData.itemName.trim(),
      type: formData.itemType.trim() || "gold",
      weight_grams: parseRequiredNumber(formData.itemWeight, "Item weight"),
      purity: parseOptionalNumber(formData.itemPurity),
      description: formData.itemDescription.trim(),
      item_photo_url: formData.itemPhotoUrl || undefined,
    },
  ],
});

export default function UpdatePawn() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PawnFormState>(initialFormState);
  const [customerLabel, setCustomerLabel] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    data: pawnTicket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pawnTicket", id],
    queryFn: async () => {
      const response = await getPawnTicketById<PawnTicketDto>(id);
      return response.data;
    },
  });

  if (isError) {
    notFound();
  }

  useEffect(() => {
    if (pawnTicket) {
      const mappedTicket = mapPawnTicketToForm(pawnTicket);

      setCustomerLabel(mappedTicket.customerLabel || "N/A");
      setFormData(mappedTicket.formData);
      setIsHydrated(true);
    }
  }, [pawnTicket]);

  const updateMutation = useMutation({
    mutationFn: (payload: PawnUpdatePayload) => updatePawnTicket(id, payload),
    onSuccess: () => {
      toast.success("Pawn ticket updated successfully");
      queryClient.invalidateQueries({ queryKey: ["pawnTickets"] });
      queryClient.invalidateQueries({ queryKey: ["pawnTicket", id] });
      router.push("/pawn-tickets");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update pawn ticket"));
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      updateMutation.mutate(buildPawnUpdatePayload(formData));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update pawn ticket"
      );
    }
  };

  if (isLoading || !isHydrated) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-100 bg-white p-10 shadow-sm">
          <div className="animate-pulse">
            <div className="mb-4 h-6 w-1/3 rounded bg-slate-100" />
            <div className="h-4 w-1/4 rounded bg-slate-100" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
          <Ticket className="h-5 w-5 text-slate-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Update Pawn Ticket
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Editing {formData.ticketNumber} for {customerLabel}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-semibold text-slate-900">Customer &amp; Ticket</h3>

          <div className="mb-4">
            <Label>Customer</Label>
            <Input value={customerLabel} disabled className="bg-slate-50 text-slate-500" />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
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

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
              <Input
                id="loanAmount"
                name="loanAmount"
                type="number"
                inputMode="decimal"
                value={formData.loanAmount}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                name="interestRate"
                type="number"
                inputMode="decimal"
                value={formData.interestRate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="advanceAmount">Advance Amount (₹)</Label>
            <Input
              id="advanceAmount"
              name="advanceAmount"
              type="number"
              inputMode="decimal"
              value={formData.advanceAmount}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-semibold text-slate-900">Item Details</h3>

          <div className="mb-4">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemType">Item Type</Label>
              <Input
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="itemWeight">Weight (grams)</Label>
              <Input
                id="itemWeight"
                name="itemWeight"
                type="number"
                inputMode="decimal"
                value={formData.itemWeight}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemPurity">Purity</Label>
              <Input
                id="itemPurity"
                name="itemPurity"
                type="number"
                inputMode="decimal"
                value={formData.itemPurity}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="itemPhotoUrl">Item Photo</Label>
              <FileUpload
                value={formData.itemPhotoUrl}
                onUpload={async (file) => {
                  const res = await uploadFile<{ url: string }>(file);
                  return res.data.url;
                }}
                onChange={(url) =>
                  setFormData((prev) => ({
                    ...prev,
                    itemPhotoUrl: url,
                  }))
                }
                label="Item photo"
              />
            </div>
          </div>

          <div className="mb-1">
            <Label htmlFor="itemDescription">Item Description</Label>
            <Input
              id="itemDescription"
              name="itemDescription"
              value={formData.itemDescription}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 lg:col-span-2">
          <Link
            href="/pawn-tickets"
            className="flex items-center justify-center rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center justify-center rounded-xl bg-[#1E3A66] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#17294D] disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </AppShell>
  );
}