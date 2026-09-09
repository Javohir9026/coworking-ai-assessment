import { defineStore } from 'pinia'
import { useApiClient } from '~/services/api-client'
import type { Resource } from '~/types/resource'

export const useResourceStore = defineStore('resource', () => {
  const items = ref<Resource[]>([])
  const selected = ref<Resource | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  async function fetchResources(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      const api = useApiClient()
      items.value = await api.request<Resource[]>('/resources')
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Resources could not be loaded.'
    } finally {
      isLoading.value = false
    }
  }

  function select(resource: Resource): void {
    selected.value = resource
  }

  return { items, selected, isLoading, errorMessage, fetchResources, select }
})
