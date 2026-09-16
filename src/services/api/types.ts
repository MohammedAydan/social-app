export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
};
