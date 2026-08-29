export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (page: number, search: string) => [...customerKeys.lists(), { page, search }] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  stats: (id: string) => [...customerKeys.detail(id), "stats"] as const,
  tickets: (id: string) => [...customerKeys.detail(id), "tickets"] as const,
};

export const pawnTicketKeys = {
  all: ["pawnTickets"] as const,
  lists: () => [...pawnTicketKeys.all, "list"] as const,
  list: (page: number, status: string, search: string) => [...pawnTicketKeys.lists(), { page, status, search }] as const,
  details: () => [...pawnTicketKeys.all, "detail"] as const,
  detail: (id: string) => [...pawnTicketKeys.details(), id] as const,
};

export const paymentKeys = {
  all: ["payments"] as const,
  ledger: (page?: number, search?: string) => [...paymentKeys.all, "ledger", { page, search }] as const,
  ledgerList: (page: number, search: string) => [...paymentKeys.all, "ledger", { page, search }] as const,
  byTicket: (ticketId: string) => [...paymentKeys.all, "ticket", ticketId] as const,
};


