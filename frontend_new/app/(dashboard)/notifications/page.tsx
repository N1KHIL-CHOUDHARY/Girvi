"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Check,
} from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";


interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "warning" | "info" | "success";
  ticketId?: string;
  customerId?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="System →"
        title="Notification Center"
        subtitle="Real-time alerts for overdue pledges, payment confirmations, and KYC verifications."
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                leftIcon={<Check className="h-3.5 w-3.5" />}
              >
                Mark all as read
              </Button>
            )}
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#E7E9EC] pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-[#14181F] text-white"
                : "bg-white text-[#55606D] hover:bg-[#F6F7F8] hover:text-[#14181F]"
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              filter === "unread"
                ? "bg-[#14181F] text-white"
                : "bg-white text-[#55606D] hover:bg-[#F6F7F8] hover:text-[#14181F]"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notification Stream */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E7E9EC] bg-white p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-[#8A94A3]" />
            <p className="mt-2 text-xs font-semibold text-[#14181F]">No notifications</p>
            <p className="mt-0.5 text-[11px] text-[#8A94A3]">You're completely caught up.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-4 transition-colors ${
                item.read
                  ? "border-[#E7E9EC] bg-white"
                  : "border-[#14181F]/20 bg-[#F6F7F8]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-[#D97706]" />
                    ) : item.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                    ) : (
                      <Bell className="h-4 w-4 text-[#2563EB]" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#14181F]">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                      )}
                    </div>
                    <p className="text-xs text-[#55606D]">{item.message}</p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[#8A94A3]">
                      <span>{item.timestamp}</span>
                      {item.ticketId && (
                        <Link
                          href={`/pawn-tickets/${item.ticketId}`}
                          className="font-medium text-[#14181F] underline hover:text-[#314259]"
                        >
                          View Ticket
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteNotification(item.id)}
                  className="text-[#8A94A3] hover:text-red-600 transition-colors p-1"
                  aria-label="Dismiss alert"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
