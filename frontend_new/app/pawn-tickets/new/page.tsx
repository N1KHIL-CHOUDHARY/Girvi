"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Search, ImagePlus } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

export default function NewPawnTicket() {
  const [photo, setPhoto] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create Pawn Ticket</h1>
        <p className="mt-1 text-sm text-slate-500">Add new pawn ticket and item details.</p>
      </div>

      <form className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-semibold text-slate-900">Customer &amp; Ticket</h3>

          <div className="mb-4">
            <label className={labelClass}>Search Customer</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search by name or phone number..." className={`${inputClass} pl-9`} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ticket Number</label>
              <input defaultValue="TICKET-10021" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Pawned Date</label>
              <input type="date" defaultValue="2025-06-05" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Loan Amount (₹)</label>
              <input type="number" defaultValue={10000} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Interest Rate (%)</label>
              <input type="number" defaultValue={3} className={inputClass} />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Advance Amount (₹)</label>
            <input type="number" defaultValue={1500} className={inputClass} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-semibold text-slate-900">Item Details</h3>

          <div className="mb-4">
            <label className={labelClass}>Item Name</label>
            <input defaultValue="Gold Chain" className={inputClass} />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Weight (grams)</label>
              <input type="number" defaultValue={22.5} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Purity</label>
              <input defaultValue="22K (916)" className={inputClass} />
            </div>
          </div>

          <div className="mb-5">
            <label className={labelClass}>Item Description</label>
            <input defaultValue="22K gold chain with small locket" className={inputClass} />
          </div>

          <label className={labelClass}>Item Photo</label>
          <label className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Item" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPhoto(URL.createObjectURL(file));
              }}
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 lg:col-span-2">
          <button
            type="button"
            className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-[#1E3A66] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#17294D]"
          >
            Save Pawn Ticket
          </button>
        </div>
      </form>
    </AppShell>
  );
}