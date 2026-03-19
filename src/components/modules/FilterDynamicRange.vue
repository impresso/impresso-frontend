<template>
  <div class="FilterDynamicRange">
    <BaseTitleBar>
      {{ $t(`label.${facetType}.filterTitle`).toLowerCase() }}
      <InfoButton v-if="infoButtonId" :name="infoButtonId" class="ml-1" />
      <template v-slot:description>
        <slot name="description"></slot>
      </template>
      <template v-slot:options>
        <b-button v-show="isFiltered" size="sm" variant="outline-primary" @click="resetValues">
          {{ $t(`actions.reset`) }}
        </b-button>
      </template>
    </BaseTitleBar>
    <!-- min 100px height -->
    <div v-if="loading" class="text-center" style="height: 100px">
      <Spinner />
    </div>

    <div v-else-if="loaded" class="position-relative mt-1">
      <HistogramSlider
        class="border-left border-right"
        v-model="sliderValue"
        :buckets="buckets"
        :only-range-labels="true"
        :scale-type="'symlog'"
        :sliderValue="value"
        @mousemove="handleMouseMove"
        :valueLabel="isPercentage ? 'valueAsPercentageLabel' : 'valueLabel'"
        @click="handleClick"
      />
      <tooltip :tooltip="tooltip">
        <slot :tooltip="tooltip">
          <div v-if="tooltip.item">
            <div v-html="tooltip.item.label"></div>
            <div
              v-html="$t(countLabel, { n: $n(tooltip.item?.count ?? 0) }, tooltip.item?.count ?? 0)"
            />
          </div>
        </slot>
      </tooltip>
    </div>
    <div v-if="loaded && start !== end" class="d-flex justify-content-between very-small">
      <div
        v-html="$t(isPercentage ? 'numbers.percentage' : 'numbers.number', { n: $n(start) })"
      ></div>
      <div
        v-html="$t(isPercentage ? 'numbers.percentage' : 'numbers.number', { n: $n(end) })"
      ></div>
    </div>
    <div class="p-2" v-if="hasChanged">
      <b-button size="sm" v-if="hasChanged" block variant="outline-primary" @click="applyValues">
        {{ $t(isFiltered ? 'actions.applyChanges' : 'actions.apply') }}
      </b-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import BaseTitleBar from '@/components/base/BaseTitleBar.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import Spinner from '@/components/layout/Spinner.vue'
import HistogramSlider from '@/components/modules/vis/HistogramSlider.vue'
import { serializeFilters } from '@/logic/filters'
import { Bucket, Facet, Filter } from '@/models'
import FilterFactory from '@/models/FilterFactory'
import { getSearchFacetsService, stats as statsService } from '@/services'
import { computed, getCurrentInstance, ref, watch } from 'vue'
import Tooltip from './tooltips/Tooltip.vue'

interface StatsQueryParams {
  index: string
  stats: string
  filters: string
  groupby?: string
}

interface StatsResponse {
  statistics: {
    min: string | number
    max: string | number
  }
  total: string | number
}

export interface FacetSearchQueryParameters {
  filters: Filter[]
  group_by: string
  rangeStart: number
  rangeEnd: number
  rangeGap: number
  rangeInclude?: string
  limit: number
}

type FacetSearchResponse = Facet

type FacetDataProvider<Q, R> = (type: string, params: { query: Q }) => Promise<R>
type FacetDataProviderFactory<Q, R> = (index: string) => FacetDataProvider<Q, R>

export type StatsDataProvider = FacetDataProvider<StatsQueryParams, StatsResponse>
export type FacetSearchDataProvider = FacetDataProvider<
  FacetSearchQueryParameters,
  FacetSearchResponse
>

export interface FilterDynamicRangeProps {
  isFiltered?: boolean
  countLabel?: string
  valueLabel?: string
  valueAsRangeLabel?: string
  valuePercentageLabel?: string
  isPercentage?: boolean
  infoButtonId?: string
  facetType: string
  facetFilters?: Filter[]
  groupby?: string | null
  index?: string
  maxExpectedBuckets?: number
  statsProvider?: StatsDataProvider
  facetSearchProvider?: FacetDataProviderFactory<FacetSearchQueryParameters, FacetSearchResponse>
}

interface TooltipItem extends Bucket {
  label: string
}

interface TooltipState {
  item: TooltipItem | null
  isActive: boolean
  x: number
  y: number
}

const props = withDefaults(defineProps<FilterDynamicRangeProps>(), {
  isFiltered: false,
  countLabel: 'numbers.results',
  valueLabel: 'value',
  valueAsRangeLabel: 'valueAsRange',
  valuePercentageLabel: 'valuePercentage',
  isPercentage: false,
  infoButtonId: undefined,
  facetFilters: () => [],
  groupby: null,
  index: 'search',
  maxExpectedBuckets: 50,
  statsProvider: statsService.get.bind(statsService),
  facetSearchProvider: (index: string) => {
    const service = getSearchFacetsService(index)
    return service?.get?.bind(service)
  }
})

const emit = defineEmits<{
  (e: 'changed', filters: Filter[]): void
  (e: 'clicked', filter: Filter): void
}>()

const { proxy } = getCurrentInstance() as { proxy: any }

const loading = ref(false)
const loaded = ref(false)
const start = ref(0)
const end = ref(0)
const gap = ref(1)
const numBuckets = ref(0)
const value = ref<number[]>([])
const sliderValue = ref<number[]>([])
const buckets = ref<Bucket[]>([])
const total = ref(0)
const tooltip = ref<TooltipState>({
  item: null,
  isActive: false,
  x: 0,
  y: 0
})

const hasChanged = computed(() => value.value.join(',') !== sliderValue.value.join(','))

const otherFilters = computed(() => {
  return props.facetFilters.filter(filter => filter.type !== props.facetType)
})

const statsApiQueryParameters = computed(() => {
  const query: StatsQueryParams = {
    index: props.index,
    stats: 'min,max',
    filters: serializeFilters(props.facetFilters)
  }
  if (props.groupby) {
    query.groupby = props.groupby
  }
  return {
    query,
    hash: JSON.stringify(query).split('').sort().join('')
  }
})

function applyValues() {
  const rangeFilter = FilterFactory.create({
    type: props.facetType,
    q: sliderValue.value.map(v => v.toString())
  })
  emit('changed', [...otherFilters.value, rangeFilter])
}

function resetValues() {
  emit('changed', [...otherFilters.value])
}

function getTooltipLabel(bucket: Bucket) {
  if (isNaN(bucket.upper) || isNaN(bucket.lower)) return ''

  if (props.isPercentage) {
    if (bucket.upper !== bucket.lower) {
      return proxy.$t(props.valuePercentageLabel, {
        upper: proxy.$n(bucket.upper),
        lower: proxy.$n(bucket.lower)
      })
    }
    return proxy.$t(props.valuePercentageLabel, {
      upper: proxy.$n(bucket.upper + 0.999),
      lower: proxy.$n(bucket.lower)
    })
  }

  if (bucket.upper !== bucket.lower) {
    return proxy.$t(props.valueAsRangeLabel, {
      upper: proxy.$n(bucket.upper),
      lower: proxy.$n(bucket.lower)
    })
  }

  const bucketValue: number =
    typeof bucket.value === 'number' ? bucket.value : parseInt(String(bucket.value), 10)
  return proxy.$t(props.valueLabel, { val: proxy.$n(bucketValue) })
}

function handleMouseMove(
  moveValue: { bucket: Bucket; pointer?: { x?: number; y?: number } } | null
) {
  if (!moveValue) {
    tooltip.value.item = null
    tooltip.value.isActive = false
    return
  }

  const bucket = moveValue.bucket
  const label = getTooltipLabel(bucket)

  tooltip.value = {
    item: {
      label,
      ...moveValue.bucket
    },
    isActive: true,
    x: -10 + (moveValue.pointer?.x ?? 0),
    y: -50 + (moveValue.pointer?.y ?? 0)
  }
}

function handleClick({ bucket }: { bucket: Bucket }) {
  if (isNaN(bucket.upper) || isNaN(bucket.lower)) {
    const numValue =
      typeof bucket.value === 'number' ? bucket.value : parseInt(String(bucket.value), 10)
    if (!isNaN(numValue)) {
      const rangeFilter = FilterFactory.create({
        type: props.facetType,
        q: [numValue, numValue]
      })
      emit('clicked', rangeFilter)
    }
    return
  }

  const rangeFilter = FilterFactory.create({
    type: props.facetType,
    q: [bucket.lower, bucket.upper]
  })
  emit('clicked', rangeFilter)
}

watch(
  statsApiQueryParameters,
  async ({ query, hash }, previousValue) => {
    if (previousValue && previousValue.hash === hash) {
      return
    }

    loading.value = true
    console.info(
      '[FilterDynamicRange] loading stats with query',
      props.facetType,
      props.facetFilters
    )
    await props
      .statsProvider(props.facetType, { query })
      .then(response => {
        start.value = parseInt(String(response.statistics.min), 10)
        end.value = parseInt(String(response.statistics.max), 10)
        total.value = parseInt(String(response.total), 10)
        value.value = [start.value, end.value]
        sliderValue.value = [start.value, end.value]
        const range = end.value - start.value
        gap.value = Math.max(1, Math.round(range / (props.maxExpectedBuckets + 1)))
        numBuckets.value = props.isPercentage ? 100 : Math.floor(range / gap.value)
        console.debug('[FilterDynamicRange]', response.statistics)
        console.debug(
          '[FilterDynamicRange] range:',
          range,
          'numuckets:',
          numBuckets.value,
          'gap:',
          gap.value
        )
      })
      .catch(error => {
        console.error('[FilterDynamicRange] error', error)
      })

    const facetSearchService = props.facetSearchProvider(props.index)
    const facetSearchServiceQuery = {
      filters: props.facetFilters,
      group_by: props.groupby,
      rangeStart: start.value,
      rangeEnd: end.value + 1,
      rangeGap: gap.value,
      limit: numBuckets.value || 1
    }

    console.info(
      '[FilterDynamicRange] loading facet data with query',
      props.facetType,
      facetSearchServiceQuery
    )

    await facetSearchService(props.facetType, {
      query: facetSearchServiceQuery
    })
      .then(response => {
        buckets.value = response.buckets
          .sort((a, b) => {
            return (a.value as number) - (b.value as number)
          })
          .map((bucket, i, arr) => {
            const bucketValueAsNumber =
              typeof bucket.value === 'number' ? bucket.value : parseInt(String(bucket.value), 10)
            return {
              lower: bucketValueAsNumber,
              upper: Math.max((arr[i + 1]?.value as any as number) - 1, bucketValueAsNumber),
              ...bucket
            }
          })
        console.debug('[FilterDynamicRange] loadFacet', props.facetType, [...response.buckets])
      })
      .catch(error => {
        console.error('[FilterDynamicRange] loadFacet error', error)
      })

    loading.value = false
    loaded.value = true
  },
  { immediate: true }
)
</script>
<i18n lang="json">
{
  "en": {
    "value": "value: <span class='number'>{val}</span>",
    "valuePercentage": "value: <span class='number'>{lower}% - {upper}%</span>",
    "valueAsRange": "range: <span class='number'>{lower} - {upper}</span>",
    "textReuseClusterSizeValueLabel": "cluster size: <span class='number'>{val}</span> passages per cluster",
    "textReuseClusterSizeValueAsRangeLabel": "cluster size: <span class='number'>{lower} - {upper}</span>",
    "textReuseClusterLexicalOverlapValuePercentageLabel": "<span class='number'>{lower}% - {upper}%</span> lexical overlap",
    "textReuseClusterDayDeltaValueLabel": "<span class='number'>{val}</span> days",
    "textReuseClusterDayDeltaValueAsRangeLabel": "<span class='number'>{lower} - {upper}</span> days"
  }
}
</i18n>
