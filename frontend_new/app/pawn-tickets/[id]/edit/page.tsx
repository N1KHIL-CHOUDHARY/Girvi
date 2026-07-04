"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Ticket } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { getPawnTicketById, updatePawnTicket } from "@/services/api";

interface PawnFormState {
  customer: string;
  ticketNumber: string;
  loanAmount: string;
  interestRate: string;
  monthlyFinancingFee: string;
  expiryDate: string;
  issueDate: string;
  itemCategory: "jewelry" | "electronics" | "watch" | "automotive" | "other";
  itemDescription: string;
  itemCondition: "excellent" | "good" | "fair" | "poor";
  itemValue: string;
  itemWeight: string;
}

const selectClass =
  "h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]";

export default function UpdatePawn() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PawnFormState | null>(null);
  const [customerName, setCustomerName] = useState("");

  const {
    data: pawnData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pawnTicket", id],
    queryFn: async () => {
      const res = await getPawnTicketById(id);
      return res.data;
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load pawn ticket");
      router.push("/pawn-tickets");
    }
  }, [isError, router]);

  useEffect(() => {
    if (pawnData) {
      const cust = pawnData.customer;
      const computedName =
        typeof cust === "object" && cust !== null
          ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim()
          : "N/A";

      setCustomerName(computedName || "N/A");
      setFormData({
        customer: typeof cust === "object" && cust !== null ? cust.id : String(cust || ""),
        ticketNumber: pawnData.ticketNumber || "",
        loanAmount: String(pawnData.loanAmount ?? ""),
        interestRate: String(pawnData.interestRate ?? ""),
        monthlyFinancingFee: String(pawnData.monthlyFinancingFee ?? ""),
        issueDate: pawnData.issueDate ? new Date(pawnData.issueDate).toISOString().split("T")[0] : "",
        expiryDate: pawnData.expiryDate ? new Date(pawnData.expiryDate).toISOString().split("T")[0] : "",
        itemCategory: pawnData.items?.[0]?.category || "jewelry",
        itemDescription: pawnData.items?.[0]?.description || "",
        itemCondition: pawnData.items?.[0]?.condition || "good",
        itemValue: String(pawnData.items?.[0]?.estimatedValue ?? ""),
        itemWeight: String(pawnData.items?.[0]?.weightInGrams ?? ""),
      });
    }
  }, [pawnData]);

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => updatePawnTicket(id, payload),
    onSuccess: () => {
      toast.success("Pawn ticket updated successfully");
      queryClient.invalidateQueries({ queryKey: ["pawnTickets"] });
      queryClient.invalidateQueries({ queryKey: ["pawnTicket", id] });
      router.push("/pawn-tickets");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to update pawn ticket";
      toast.error(message.replace(/"/g, ""));
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => (prev ? { ...prev, [e.target.name]: e.target.value } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    updateMutation.mutate({
      customer: formData.customer,
      ticketNumber: formData.ticketNumber,
      loanAmount: parseFloat(formData.loanAmount),
      interestRate: parseFloat(formData.interestRate),
      monthlyFinancingFee: parseFloat(formData.monthlyFinancingFee),
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate,
      items: [
        {
          category: formData.itemCategory,
          description: formData.itemDescription,
          condition: formData.itemCondition,
          estimatedValue: parseFloat(formData.itemValue) || 0,
          weightInGrams: parseFloat(formData.itemWeight) || undefined,
        },
      ],
    });
  };

  if (isLoading || !formData) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-3xl animate-pulse rounded-2xl border border-slate-100 bg-white p-10 shadow-sm">
          <div className="mb-4 h-6 w-1/3 rounded bg-slate-100" />
          <div className="h-4 w-1/4 rounded bg-slate-100" />
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
            Editing {formData.ticketNumber} for {customerName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-semibold text-slate-900">Customer &amp; Ticket</h3>

          <div className="mb-4">
            <Label>Customer</Label>
            <Input value={customerName} disabled className="bg-slate-50 text-slate-500" />
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
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                name="issueDate"
                type="date"
                value={formData.issueDate}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthlyFinancingFee">Monthly Fee (₹)</Label>
              <Input
                id="monthlyFinancingFee"
                name="monthlyFinancingFee"
                type="number"
                inputMode="decimal"
                value={formData.monthlyFinancingFee}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-semibold text-slate-900">Item Details</h3>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemCategory">Category</Label>
              <select
                id="itemCategory"
                name="itemCategory"
                value={formData.itemCategory}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="jewelry">Jewelry</option>
                <option value="electronics">Electronics</option>
                <option value="watch">Watch</option>
                <option value="automotive">Automotive</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="itemCondition">Condition</Label>
              <select
                id="itemCondition"
                name="itemCondition"
                value={formData.itemCondition}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemWeight">Weight (grams)</Label>
              <Input
                id="itemWeight"
                name="itemWeight"
                type="number"
                inputMode="decimal"
                value={formData.itemWeight}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="itemValue">Estimated Value (₹)</Label>
              <Input
                id="itemValue"
                name="itemValue"
                type="number"
                inputMode="decimal"
                value={formData.itemValue}
                onChange={handleChange}
                required
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