<template>
  <div class="ListOfSearchFacetsStackedBars container">
    <slot name="beforeHeader"></slot>
    <slot name="header" :total="facets.length">
      <div class="p-3 d-flex gap-2 justify-content-between align-items-center">
        <h5 class="m-0 font-size-inherit" v-html="props.title"></h5>
      </div>
    </slot>
    <slot name="afterHeader"></slot>

    <div :class="props.itemsClass" style="min-height: 120px">
      <LoadingBlock v-if="status === 'loading'" :height="100" />

      <div v-if="status === 'error'" class="p-3">
        <Alert type="warning" :closable="false">
          <span v-html="props.errorLoadingItemsMessage"></span>
        </Alert>
      </div>

      <div v-if="status === 'success' && !hasBuckets" class="p-3">
        <Alert
          type="info"
          class="border border-info"
          :closable="false"
          v-html="props.listIsEmptyMessage"
        />
      </div>

      <div v-if="status === 'success' && hasBuckets" class="row g-3">
        <div v-for="facet in facets" :key="facet.type" class="col-12" :class="props.columnsClass">
          <StackedBarsPanel
            :label="facet.type"
            :buckets="facet.buckets"
            :facet-type="facet.type"
            :search-index="props.searchIndex"
            :default-click-action-disabled="props.defaultClickActionDisabled"
            @bar-item-click="event => emit('bar-item-click', { event, facetType: facet.type })"
            @hovered="hoverId => emit('hovered', { hoverId, facetType: facet.type })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FeathersError } from '@feathersjs/errors'
import type { Filter } from '@/models'
import FacetModel from '@/models/Facet'
import type { FacetType } from '@/models/Facet'
import type { SearchFacet } from '@/models/generated/deprecated/models'
import type { FindQuery } from '@/services/types/searchFacets'
import LoadingBlock from '@/components/LoadingBlock.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import StackedBarsPanel from '@/components/modules/vis/StackedBarsPanel.vue'
import { getSearchFacetsService } from '@/services'

export interface ListOfSearchFacetsStackedBarsProps {
  title?: string
  searchIndex?: string
  facetTypes: FacetType[]
  filters?: Filter[]
  limit?: number
  orderBy?: FindQuery['order_by']
  fetchItemsWhenVisible?: boolean
  errorLoadingItemsMessage?: string
  listIsEmptyMessage?: string
  itemsClass?: string
  columnsClass?: string
  defaultClickActionDisabled?: boolean
}

export interface BarItemClickPayload {
  event: {
    params: {
      item: {
        id: string
      }
    }
  }
  facetType: FacetType
}

export interface HoveredPayload {
  hoverId: string
  facetType: FacetType
}

const props = withDefaults(defineProps<ListOfSearchFacetsStackedBarsProps>(), {
  title: '',
  searchIndex: 'search',
  filters: () => [],
  limit: 10,
  orderBy: () => ({ count: 'desc' }),
  fetchItemsWhenVisible: true,
  errorLoadingItemsMessage: 'errorLoadingItems',
  listIsEmptyMessage: 'listIsEmpty',
  itemsClass: 'p-2',
  columnsClass: 'col-lg-6 col-xl-4',
  defaultClickActionDisabled: false
})

const emit = defineEmits<{
  (e: 'bar-item-click', payload: BarItemClickPayload): void
  (e: 'hovered', payload: HoveredPayload): void
}>()

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const error = ref<FeathersError | null>(null)
const facets = ref<FacetModel[]>([])
const latestQueryFingerprint = ref('')
const requestCounter = ref(0)

const hasBuckets = computed(() => {
  return facets.value.some(facet => facet.buckets.length > 0)
})

const queryPayload = computed(() => {
  return {
    index: props.searchIndex,
    facets: props.facetTypes,
    limit: props.limit,
    order_by: props.orderBy,
    filters: props.filters
  }
})

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }

  const sortedEntries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)

  return `{${sortedEntries.join(',')}}`
}

const syncEmptyFacets = () => {
  facets.value = props.facetTypes.map(type => new FacetModel({ type }))
}

const fetchFacets = async () => {
  if (!props.fetchItemsWhenVisible) {
    return
  }

  if (!props.facetTypes.length) {
    facets.value = []
    status.value = 'success'
    return
  }

  const fingerprint = stableStringify(queryPayload.value)
  if (latestQueryFingerprint.value === fingerprint && status.value === 'success') {
    return
  }

  latestQueryFingerprint.value = fingerprint
  requestCounter.value += 1
  const currentRequest = requestCounter.value

  status.value = 'loading'
  error.value = null
  syncEmptyFacets()

  try {
    const service = getSearchFacetsService(props.searchIndex)
    const response = await service.find({
      query: {
        facets: props.facetTypes,
        limit: props.limit,
        filters: props.filters
      }
    })

    if (currentRequest !== requestCounter.value) {
      return
    }

    const byType = new Map<FacetType, FacetModel>()
    response.data.forEach((searchFacet: SearchFacet) => {
      byType.set(searchFacet.type as FacetType, FacetModel.fromSearchFacet(searchFacet))
    })

    facets.value = props.facetTypes.map(type => byType.get(type) ?? new FacetModel({ type }))
    status.value = 'success'
  } catch (err) {
    if (currentRequest !== requestCounter.value) {
      return
    }

    error.value = err as FeathersError
    status.value = 'error'
    console.error('[ListOfSearchFacetsStackedBars] Error', error.value?.message)
  }
}

watch(
  () => props.fetchItemsWhenVisible,
  value => {
    if (value && status.value === 'idle') {
      fetchFacets()
    }
  },
  { immediate: true }
)

watch(
  () => [props.searchIndex, props.facetTypes, props.filters, props.limit, props.orderBy],
  () => {
    fetchFacets()
  },
  { deep: true }
)
</script>
