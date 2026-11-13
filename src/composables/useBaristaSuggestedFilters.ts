import { computed, ref, watch } from 'vue'
import type { Filter } from '@/models'
import { filtersItems as filterItemsService } from '@/services'
import { joinFiltersWithItems, serializeFilters } from '@/logic/filters'
import { useBaristaStore } from '@/stores/barista'

/** Always-on search filters that SearchPills never displays */
export const BaristaHiddenFilterTypes = ['hasTextContents', 'isFront']

export const getVisibleFilters = (filters: Filter[]) =>
  filters.filter(filter => !BaristaHiddenFilterTypes.includes(filter.type))

export interface UseBaristaSuggestedFiltersOptions {
  /** Filters of the current search */
  filters: () => Filter[] | undefined
  /** Filters suggested by Barista, shared between the full and the compact view */
  suggestedFilters?: () => Filter[] | undefined
  onSuggestedFiltersChange?: (filters: Filter[]) => void
}

export function useBaristaSuggestedFilters(options: UseBaristaSuggestedFiltersOptions) {
  const baristaStore = useBaristaStore()
  const suggestedFilters = ref<Filter[]>(options.filters() || [])
  const suggestedFiltersWithItems = ref<Filter[]>([])

  watch(
    () => suggestedFilters.value,
    async newFilters => {
      suggestedFiltersWithItems.value = await filterItemsService
        .find({
          query: {
            filters: serializeFilters(newFilters)
          }
        })
        .then(joinFiltersWithItems)
    },
    { immediate: true }
  )

  watch(
    options.filters,
    newFilters => {
      suggestedFilters.value = [...(newFilters || [])]
    },
    { immediate: true }
  )

  if (options.suggestedFilters) {
    watch(
      options.suggestedFilters,
      newFilters => {
        if (newFilters && newFilters !== suggestedFilters.value) {
          suggestedFilters.value = newFilters
        }
      },
      { immediate: true }
    )
  }

  watch(
    () => baristaStore.sendCurrentFilters,
    value => {
      if (value) {
        suggestedFilters.value = options.filters() || []
      } else {
        suggestedFilters.value = []
      }
    }
  )

  watch(suggestedFilters, newFilters => options.onSuggestedFiltersChange?.(newFilters))

  const handleFiltersChanged = (updatedFilters: Filter[]) => {
    suggestedFilters.value = updatedFilters
  }

  const visibleSuggestedFilters = computed(() => getVisibleFilters(suggestedFilters.value))

  return {
    suggestedFilters,
    visibleSuggestedFilters,
    suggestedFiltersWithItems,
    handleFiltersChanged
  }
}
