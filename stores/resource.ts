import { defineStore } from 'pinia'
import { useApiClient } from '~/services/api-client'
import type { Resource } from '~/types/resource'
import type { PaginatedResult } from '~/types/api'

export const useResourceStore = defineStore('resource', () => {
  const items = ref<Resource[]>([])
  const selected = ref<Resource | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const meta = ref({ total: 0, page: 1, pageSize: 10 })

  async function fetchResources(
    page = meta.value.page,
    pageSize = meta.value.pageSize
  ): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      const api = useApiClient()
      const result = await api.request<PaginatedResult<Resource>>('/resources', {
        query: { page, pageSize }
      })
      items.value = result.items
      meta.value = result.meta
    } catch (error: unknown) {
      items.value = []
      errorMessage.value = error instanceof Error ? error.message : 'Resources could not be loaded.'
    } finally {
      isLoading.value = false
    }
  }

  function select(resource: Resource): void {
    selected.value = resource
  }

  return { items, selected, isLoading, errorMessage, meta, fetchResources, select }
})
