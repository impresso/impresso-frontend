<template>
  <div class="SearchFacetTimeline">
    <slot name="beforeHeader"></slot>
    <slot name="header" :total="1">
      <h5 class="m-0 font-size-inherit" v-if="props.title">
        <span class="small-caps-bold" v-html="props.title"></span>
      </h5>
    </slot>
    <slot name="afterHeader"></slot>

    <div :class="props.itemsClass" style="min-height: 100px">
      <LoadingBlock v-if="status === 'loading'" :height="100" />

      <div v-if="status === 'error'" class="p-3">
        <Alert type="warning" :closable="false">
          <span v-html="$t(props.errorLoadingItemsMessage)"></span>
        </Alert>
      </div>

      <div v-if="status === 'success' && !timelineValues.length" class="p-3">
        <Alert
          type="info"
          class="border border-info"
          :closable="false"
          v-html="$t(props.listIsEmptyMessage)"
        />
      </div>

      <Timeline
        v-if="status === 'success' && timelineValues.length"
        :values="timelineValues"
        :height="props.height"
        :domain="props.domain"
        :brushable="false"
      >
        <template #default="{ tooltip }">
          <slot name="tooltip" :tooltip="tooltip">
            <div class="p-2">{{ tooltip }}</div>
          </slot>
        </template>
      </Timeline>
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
import LoadingBlock from '@/components/LoadingBlock.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import Timeline from '@/components/modules/Timeline.vue'
import { getSearchFacetsService } from '@/services'
import { facetToTimelineValues } from '@/logic/facets'
import type { TimelineValue } from '@/logic/facets'

export interface SearchFacetTimelineProps {
  title?: string
  searchIndex?: string
  facetType: FacetType
  filters?: Filter[]
  limit?: number
  fetchItemsWhenVisible?: boolean
  errorLoadingItemsMessage?: string
  listIsEmptyMessage?: string
  itemsClass?: string
  height?: string
  domain?: (string | number | Date)[]
}

const props = withDefaults(defineProps<SearchFacetTimelineProps>(), {
  title: '',
  searchIndex: 'search',
  filters: () => [],
  limit: 400,
  fetchItemsWhenVisible: true,
  errorLoadingItemsMessage: 'errorLoadingItems',
  listIsEmptyMessage: 'listIsEmpty',
  itemsClass: 'p-2',
  height: '85px'
})

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const error = ref<FeathersError | null>(null)
const facet = ref<FacetModel | null>(null)
const latestQueryFingerprint = ref('')
const requestCounter = ref(0)

const timelineValues = computed<TimelineValue[]>(() => {
  if (!facet.value) return []
  return facetToTimelineValues(facet.value)
})

const queryPayload = computed(() => ({
  index: props.searchIndex,
  facetType: props.facetType,
  limit: props.limit,
  filters: props.filters
}))

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const sortedEntries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
  return `{${sortedEntries.join(',')}}`
}

const fetchFacet = async () => {
  if (!props.fetchItemsWhenVisible) return

  const fingerprint = stableStringify(queryPayload.value)
  if (latestQueryFingerprint.value === fingerprint && status.value === 'success') return

  latestQueryFingerprint.value = fingerprint
  requestCounter.value += 1
  const currentRequest = requestCounter.value

  status.value = 'loading'
  error.value = null
  facet.value = null

  try {
    const service = getSearchFacetsService(props.searchIndex)
    const response = await service.find({
      query: {
        facets: [props.facetType],
        limit: props.limit,
        filters: props.filters
      }
    })
    console.debug('[SearchFacetTimeline] Fetched facet', response)
    if (currentRequest !== requestCounter.value) return

    const found = response.data.find((sf: SearchFacet) => sf.type === props.facetType)
    facet.value = found
      ? FacetModel.fromSearchFacet(found)
      : new FacetModel({ type: props.facetType })
    status.value = 'success'
  } catch (err) {
    if (currentRequest !== requestCounter.value) return
    error.value = err as FeathersError
    status.value = 'error'
    console.error('[SearchFacetTimeline] Error', error.value?.message)
  }
}

watch(
  () => props.fetchItemsWhenVisible,
  value => {
    if (value && status.value === 'idle') fetchFacet()
  },
  { immediate: true }
)

watch(
  () => [props.searchIndex, props.facetType, props.filters, props.limit],
  () => fetchFacet(),
  { deep: true }
)
</script>
