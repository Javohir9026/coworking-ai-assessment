export interface ApiState<TData> {
  data: Ref<TData | null>
  error: Ref<string | null>
  isLoading: Ref<boolean>
  execute: (request: () => Promise<TData>) => Promise<TData | null>
}

export function useApiState<TData>(): ApiState<TData> {
  const data = ref<TData | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  async function execute(request: () => Promise<TData>): Promise<TData | null> {
    isLoading.value = true
    error.value = null
    try {
      const result = await request()
      data.value = result
      return result
    } catch (caught: unknown) {
      error.value = caught instanceof Error ? caught.message : 'Unknown API error'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { data, error, isLoading, execute }
}
