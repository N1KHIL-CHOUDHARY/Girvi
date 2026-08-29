"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Label } from "./Label";
import { Button } from "./Button";
import { createPayment, getApiErrorMessage } from "@/services/api";
import { paymentKeys, pawnTicketKeys } from "@/lib/queryKeys";
import toast from "react-hot-toast";
import { DollarSign } from "lucide-react";


interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId?: string;
  ticketNumber?: string;
  customerName?: string;
  principalBalance?: number | string;
  interestDue?: number | string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  ticketId = "",
  ticketNumber = "",
  customerName = "",
  principalBalance = 0,
  interestDue = 0,
}: RecordPaymentModalProps) {
  const queryClient = useQueryClient();
  const [paymentFor, setPaymentFor] = useState<"interest" | "principal">("interest");
  const [amount, setAmount] = useState(
    paymentFor === "interest" && Number(interestDue) > 0 ? String(interestDue) : ""
  );
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: any) => createPayment(payload),
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: pawnTicketKeys.all });
      if (ticketId) {
        queryClient.invalidateQueries({ queryKey: pawnTicketKeys.detail(ticketId) });
        queryClient.invalidateQueries({ queryKey: paymentKeys.byTicket(ticketId) });
      }
      onClose();
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to record payment"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    mutation.mutate({
      ticket_id: ticketId,
      amount_paid: numAmount,
      payment_for: paymentFor,
      payment_method: paymentMethod,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ticket Summary Card */}
        <div className="rounded-xl border border-[#E7E9EC] bg-[#F6F7F8] p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#8A94A3]">Pawn Ticket</span>
            <span className="font-mono font-semibold text-[#14181F]">{ticketNumber || "Ticket"}</span>
          </div>
          {customerName && (
            <div className="flex justify-between items-center">
              <span className="text-[#8A94A3]">Customer</span>
              <span className="font-semibold text-[#14181F]">{customerName}</span>
            </div>
          )}
          {Number(principalBalance) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[#8A94A3]">Active Principal</span>
              <span className="font-mono font-semibold text-[#14181F]">₹{Number(principalBalance).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Payment Type Selection */}
        <div>
          <Label>Payment Allocation</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                setPaymentFor("interest");
                if (Number(interestDue) > 0) setAmount(String(interestDue));
              }}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer text-center ${
                paymentFor === "interest"
                  ? "border-[#14181F] bg-[#14181F] text-white"
                  : "border-[#E7E9EC] bg-white text-[#55606D] hover:bg-[#F6F7F8]"
              }`}
            >
              Interest Payment
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentFor("principal");
              }}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer text-center ${
                paymentFor === "principal"
                  ? "border-[#14181F] bg-[#14181F] text-white"
                  : "border-[#E7E9EC] bg-white text-[#55606D] hover:bg-[#F6F7F8]"
              }`}
            >
              Principal Repayment
            </button>
          </div>
        </div>

        {/* Payment Amount */}
        <div>
          <Label htmlFor="amount" required>
            Payment Amount (₹)
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Payment Method */}
        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#E7E9EC] bg-white px-3 text-sm text-[#14181F] focus:outline-none focus:border-[#14181F] cursor-pointer"
          >
            <option value="Cash">Cash</option>
            <option value="UPI / QR">UPI / QR Code</option>
            <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
            <option value="Cheque">Cheque</option>
            <option value="Card">Debit / Credit Card</option>
          </select>
        </div>

        {/* Optional Notes */}
        <div>
          <Label htmlFor="notes">Notes / Reference (Optional)</Label>
          <Input
            id="notes"
            placeholder="e.g. Receipt #4829 or UPI Txn Ref"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E7E9EC] pt-4 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={mutation.isPending}
            leftIcon={<DollarSign className="h-4 w-4" />}
          >
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
