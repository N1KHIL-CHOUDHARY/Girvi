export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: unknown;
  meta?: {
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
    totalCount?: number;
  };
}

export interface PaginatedQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}
