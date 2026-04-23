<template>
  <div class="FilterDecimalRange">
    <BaseTitleBar>
      {{ $t(`label.${facetType}.filterTitle`).toLowerCase() }}
      <InfoButton v-if="infoButtonId" :name="infoButtonId" class="ml-1" />
      <template #description>
        <slot name="description"></slot>
      </template>
      <template #options>
        <b-button v-show="isFiltered" size="sm" variant="outline-primary" @click="resetValues">
          {{ $t('actions.reset') }}
        </b-button>
      </template>
    </BaseTitleBar>

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
      <Tooltip :tooltip="tooltip">
        <slot :tooltip="tooltip">
          <div v-if="tooltip.item">
            <div v-html="tooltip.item.label"></div>
            <div
              v-html="$t(countLabel, { n: $n(tooltip.item?.count ?? 0) }, tooltip.item?.count ?? 0)"
            />
          </div>
        </slot>
      </Tooltip>
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
      <b-button size="sm" block variant="outline-primary" @click="applyValues">
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

export interface DecimalFacetSearchQueryParameters {
  filters: Filter[]
  group_by: string | null
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
export type DecimalFacetSearchDataProvider = FacetDataProvider<
  DecimalFacetSearchQueryParameters,
  FacetSearchResponse
>

export interface FilterDecimalRangeProps {
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
  precision?: number
  minValue?: number
  maxValue?: number
  rangeStep?: number
  statsProvider?: StatsDataProvider
  facetSearchProvider?: FacetDataProviderFactory<
    DecimalFacetSearchQueryParameters,
    FacetSearchResponse
  >
}

interface TooltipItem extends Bucket {
  label: string
  decimalLower?: number
  decimalUpper?: number
}

interface TooltipState {
  item: TooltipItem | null
  isActive: boolean
  x: number
  y: number
}

const props = withDefaults(defineProps<FilterDecimalRangeProps>(), {
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
  maxExpectedBuckets: 100,
  precision: 2,
  minValue: 0,
  maxValue: 1,
  rangeStep: 0.01,
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

const scaleFactor = computed(() => 10 ** props.precision)

function roundDecimal(value: number) {
  return Number(value.toFixed(props.precision))
}

function clampDecimal(value: number) {
  const clamped = Math.max(props.minValue, Math.min(props.maxValue, value))
  return roundDecimal(clamped)
}

function normalizeDecimal(value: number) {
  return Math.round(roundDecimal(value) * scaleFactor.value)
}

function denormalizeInt(value: number) {
  return roundDecimal(value / scaleFactor.value)
}

function toFilterString(value: number) {
  return roundDecimal(value).toFixed(props.precision)
}

function toDisplayValue(value: number) {
  if (!props.isPercentage) {
    return roundDecimal(value)
  }
  return roundDecimal(value * 100)
}

const loading = ref(false)
const loaded = ref(false)
const start = ref(0)
const end = ref(1)
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
  const lower = denormalizeInt(Math.min(sliderValue.value[0], sliderValue.value[1]))
  const upper = denormalizeInt(Math.max(sliderValue.value[0], sliderValue.value[1]))
  const rangeFilter = FilterFactory.create({
    type: props.facetType,
    q: [toFilterString(lower), toFilterString(upper)]
  })
  emit('changed', [...otherFilters.value, rangeFilter])
}

function resetValues() {
  emit('changed', [...otherFilters.value])
}

function getDecimalBounds(bucket: Bucket): { lower: number; upper: number } {
  const decimalLower =
    typeof (bucket as any).decimalLower === 'number'
      ? (bucket as any).decimalLower
      : denormalizeInt(Number(bucket.lower))
  const decimalUpper =
    typeof (bucket as any).decimalUpper === 'number'
      ? (bucket as any).decimalUpper
      : denormalizeInt(Number(bucket.upper))

  return {
    lower: roundDecimal(decimalLower),
    upper: roundDecimal(decimalUpper)
  }
}

function getTooltipLabel(bucket: Bucket) {
  if (isNaN(Number(bucket.upper)) || isNaN(Number(bucket.lower))) return ''

  const { lower, upper } = getDecimalBounds(bucket)
  const safeUpper = upper > lower ? upper : roundDecimal(lower + props.rangeStep)

  if (props.isPercentage) {
    return proxy.$t(props.valuePercentageLabel, {
      upper: proxy.$n(toDisplayValue(safeUpper)),
      lower: proxy.$n(toDisplayValue(lower))
    })
  }

  if (safeUpper !== lower) {
    return proxy.$t(props.valueAsRangeLabel, {
      upper: proxy.$n(safeUpper),
      lower: proxy.$n(lower)
    })
  }

  return proxy.$t(props.valueLabel, { val: proxy.$n(lower) })
}

function handleMouseMove(
  moveValue: { bucket: Bucket; pointer?: { x?: number; y?: number } } | null
) {
  if (!moveValue) {
    tooltip.value.item = null
    tooltip.value.isActive = false
    return
  }

  const label = getTooltipLabel(moveValue.bucket)

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
  const { lower, upper } = getDecimalBounds(bucket)
  const safeUpper = upper > lower ? upper : roundDecimal(lower + props.rangeStep)
  const rangeFilter = FilterFactory.create({
    type: props.facetType,
    q: [toFilterString(lower), toFilterString(safeUpper)]
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
    try {
      const response = await props.statsProvider(props.facetType, { query })
      const min = clampDecimal(parseFloat(String(response.statistics.min)))
      const max = clampDecimal(parseFloat(String(response.statistics.max)))
      total.value = parseInt(String(response.total), 10)

      start.value = min
      end.value = max

      const normalizedStart = normalizeDecimal(start.value)
      const normalizedEnd = normalizeDecimal(end.value)

      value.value = [normalizedStart, normalizedEnd]
      sliderValue.value = [normalizedStart, normalizedEnd]

      const range = roundDecimal(end.value - start.value)
      const step = roundDecimal(props.rangeStep)
      const bucketsLimit = Math.max(
        1,
        Math.min(props.maxExpectedBuckets, Math.round(range / step) + 1)
      )

      const facetSearchService = props.facetSearchProvider(props.index)
      const facetSearchServiceQuery: DecimalFacetSearchQueryParameters = {
        filters: props.facetFilters,
        group_by: props.groupby,
        rangeStart: start.value,
        rangeEnd: end.value,
        rangeGap: step,
        limit: bucketsLimit
      }

      const facetResponse = await facetSearchService(props.facetType, {
        query: facetSearchServiceQuery
      })

      buckets.value = facetResponse.buckets
        .sort((a, b) => {
          return parseFloat(String(a.value)) - parseFloat(String(b.value))
        })
        .map((bucket, i, arr) => {
          const bucketValue = roundDecimal(parseFloat(String(bucket.value)))
          const nextBucketValue =
            i < arr.length - 1
              ? roundDecimal(parseFloat(String(arr[i + 1].value)))
              : roundDecimal(bucketValue + step)
          const upper = roundDecimal(Math.max(bucketValue, nextBucketValue - step))

          return {
            ...bucket,
            value: normalizeDecimal(bucketValue),
            lower: normalizeDecimal(bucketValue),
            upper: normalizeDecimal(upper),
            decimalLower: bucketValue,
            decimalUpper: upper
          } as Bucket
        })
    } catch (error) {
      console.error('[FilterDecimalRange] error', error)
    } finally {
      loading.value = false
      loaded.value = true
    }
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
    "textReuseClusterLexicalOverlapValuePercentageLabel": "<span class='number'>{lower}% - {upper}%</span> lexical overlap"
  }
}
</i18n>
