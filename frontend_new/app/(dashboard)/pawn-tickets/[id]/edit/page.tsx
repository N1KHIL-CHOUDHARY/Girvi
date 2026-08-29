"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";


import FileUpload from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getApiErrorMessage,
  getPawnTicketById,
  updatePawnTicket,
  uploadFile,
} from "@/services/api";
import { pawnTicketKeys } from "@/lib/queryKeys";

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

function PawnTicketEditForm({ id, initialTicket }: { id: string; initialTicket: PawnTicketDto }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [{ customerLabel, formData }, setFormState] = useState(() => mapPawnTicketToForm(initialTicket));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMutation = useMutation({
    mutationFn: (payload: PawnUpdatePayload) => updatePawnTicket(id, payload),
    onSuccess: () => {
      toast.success("Pawn ticket updated successfully");
      queryClient.invalidateQueries({ queryKey: pawnTicketKeys.all });
      queryClient.invalidateQueries({ queryKey: pawnTicketKeys.detail(id) });
      router.push(`/pawn-tickets/${id}`);
    },
    onError: (error: any) => {
      const payload = error?.response?.data;
      if (payload?.error && typeof payload.error === "object") {
        const details = payload.error.details;
        if (details && typeof details === "object") {
          const fieldErrors: Record<string, string> = {};
          Object.entries(details).forEach(([key, val]) => {
            fieldErrors[key] = Array.isArray(val) ? val.join(", ") : String(val);
          });
          setErrors(fieldErrors);
          toast.error("Please resolve validation errors.");
          return;
        }
      }
      toast.error(getApiErrorMessage(error, "Failed to update pawn ticket"));
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value,
      },
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Loans & Tickets →"
        title="Edit Pawn Ticket"
        subtitle={`Updating ticket ${formData.ticketNumber} for ${customerLabel}`}
        breadcrumbs={
          <Link
            href={`/pawn-tickets/${id}`}
            className="inline-flex items-center gap-1 text-xs text-[#55606D] hover:text-[#14181F]"
          >
            <ArrowLeft className="h-3 w-3" /> Back to ticket
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Customer & Financials */}
          <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A94A3] border-b border-[#E7E9EC] pb-2">
              Borrower &amp; Financial Terms
            </h3>

            <div>
              <Label>Borrower Profile</Label>
              <Input value={customerLabel} disabled className="bg-[#F6F7F8] text-[#55606D]" />
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
                  Pawned Date
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
                  inputMode="decimal"
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
                  inputMode="decimal"
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
                inputMode="decimal"
                value={formData.advanceAmount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Right: Collateral Asset */}
          <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A94A3] border-b border-[#E7E9EC] pb-2">
              Collateral Specifications
            </h3>

            <div>
              <Label htmlFor="itemName" required>
                Item Name
              </Label>
              <Input
                id="itemName"
                name="itemName"
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
                  <option value="other">Other</option>
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
                  inputMode="decimal"
                  value={formData.itemWeight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="itemPurity">Purity (Karat / %)</Label>
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
                  setFormState((prev) => ({
                    ...prev,
                    formData: {
                      ...prev.formData,
                      itemPhotoUrl: url,
                    },
                  }))
                }
                label="Collateral photo"
              />
            </div>

            <div>
              <Label htmlFor="itemDescription">Description &amp; Markings</Label>
              <textarea
                id="itemDescription"
                name="itemDescription"
                rows={2}
                value={formData.itemDescription}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E7E9EC] bg-white p-3 text-xs text-[#14181F] placeholder:text-[#8A94A3] focus:border-[#14181F] focus:outline-none focus:ring-1 focus:ring-[#14181F]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E7E9EC] pt-4">
          <Button
            variant="secondary"
            onClick={() => router.push(`/pawn-tickets/${id}`)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateMutation.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function UpdatePawn() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    data: pawnTicket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: pawnTicketKeys.detail(id),
    queryFn: async () => {
      const response = await getPawnTicketById<PawnTicketDto>(id);
      return response;
    },
  });

  if (isError) {
    notFound();
  }

  if (isLoading || !pawnTicket?.data) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
        <div className="h-6 w-1/3 rounded bg-[#F6F7F8]" />
        <div className="h-64 rounded-xl bg-[#F6F7F8]" />
      </div>
    );
  }

  return <PawnTicketEditForm id={id} initialTicket={pawnTicket.data} />;
}