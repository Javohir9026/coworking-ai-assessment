import { defineStore } from 'pinia'
import type { Resource } from '~/types/resource'

interface ResourcesState {
  items: Resource[]
  selected: Resource | null
}

export const useResourcesStore = defineStore('resources', {
  state: (): ResourcesState => ({ items: [], selected: null })
})
