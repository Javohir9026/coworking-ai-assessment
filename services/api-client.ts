import type { ApiErrorBody, ApiResponse } from '~/types/api'

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly body: ApiErrorBody | null
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.statusCode === 'number' &&
    (typeof candidate.message === 'string' || Array.isArray(candidate.message)) &&
    typeof candidate.error === 'string' &&
    typeof candidate.timestamp === 'string' &&
    typeof candidate.path === 'string'
  )
}

export function useApiClient() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  async function request<TData>(
    path: string,
    options: Parameters<typeof $fetch<ApiResponse<TData>>>[1] = {}
  ) {
    try {
      const response = await $fetch<ApiResponse<TData>>(path, {
        baseURL: config.public.apiBaseUrl,
        ...options,
        headers: {
          ...options.headers,
          ...(auth.accessToken === null ? {} : { Authorization: `Bearer ${auth.accessToken}` })
        }
      })
      return response.data
    } catch (caught: unknown) {
      const responseBody =
        typeof caught === 'object' && caught !== null && 'data' in caught
          ? (caught as { data: unknown }).data
          : null
      const body = isApiErrorBody(responseBody) ? responseBody : null
      const message =
        body === null
          ? 'API request failed'
          : Array.isArray(body.message)
            ? body.message.join(', ')
            : body.message
      throw new ApiClientError(message, body)
    }
  }

  return { request }
}
