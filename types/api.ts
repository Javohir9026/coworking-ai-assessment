export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error: string
  timestamp: string
  path: string
}

export interface ApiResponse<TData> {
  data: TData
}

export interface PaginatedResponse<TItem> {
  data: TItem[]
  meta: {
    total: number
    page: number
    pageSize: number
  }
}
