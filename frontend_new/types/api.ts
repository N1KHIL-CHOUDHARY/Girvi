export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: unknown;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalItems?: number;
    totalPages?: number;
    totalCount?: number;
    [key: string]: any;
  };
}


export interface PaginatedQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}
