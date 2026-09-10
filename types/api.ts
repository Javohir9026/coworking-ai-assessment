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

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
}

export interface PaginatedResult<TItem> {
  items: TItem[]
  meta: {
    total: number
    page: number
    pageSize: number
  }
}
