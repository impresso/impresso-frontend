<template>
  <div class="chart-container d-flex flex-column full-height">
    <!-- slot:header -->
    <div class="flex-shrink-1">
      <slot name="header"> </slot>
    </div>
    <!-- slot:body -->
    <div v-if="loading || chartType == null">
      <em>{{ $t('actions.loading') }}</em>
    </div>
    <PowerChart
      class="flex-grow-1 overflow-auto position-relative"
      v-else
      :data="chartData.items"
      :chart-type="chartType"
      :line-metrics="chartData.lineMetrics"
      :area-metrics="chartData.areaMetrics"
      :color-palette="chartData.colorPalette"
      :items-dictionary="chartData.itemsDictionary"
      :horizontal="chartData.horizontal"
      @item:click="(e: Event) => $emit('item:click', e)"
      @mousemove="(e: Event) => $emit('mousemove', e)"
      @mouseleave="(e: Event) => $emit('mouseleave', e)"
      :options="options"
    />
    <!-- slot:footer -->
    <div class="flex-shrink-1 border-top">
      <slot name="footer" class="border-top p-2 pb-3" style="max-height: 180px; overflow: scroll">
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { schemeCategory10, schemeAccent } from 'd3'
import { computed, defineComponent } from 'vue'
import { withMissingDates } from '@/logic/time'
import PowerChart from './PowerChart.vue'

function colorForLineMetric(index: number) {
  if (index < 0) return '#ffffffff'
  return schemeCategory10[index % schemeCategory10.length]
}

function colorForAreaMetric(index: number) {
  if (index < 0) return '#ffffffff'
  return `${schemeAccent[index % schemeAccent.length]}33`
}

export interface LineMetricExtractor {
  id: string
  extractor: (any: any) => number
}

interface AreaMetricExtractor {
  id: string
  extractor: (any: any) => [number, number]
}

const lineMetricExtractorFactory = (metric: string): LineMetricExtractor => ({
  id: metric,
  extractor: value => (value || {})[metric]
})

const stdAreaMetricExtractorFactory = (metric: string): AreaMetricExtractor => ({
  id: metric,
  extractor: value => {
    const { mean, stddev } = value || {}
    return [mean - stddev, mean + stddev]
  }
})

const itemCountLineMetricExtractorFactory = (metric: string): LineMetricExtractor => ({
  id: metric,
  extractor: value => {
    const { items = [] } = value
    const item = items.find(({ term }: { term: any }) => term === metric)
    return item ? item.count : undefined
  }
})

const getChartType = (domain?: string, facetType?: string): string => {
  if (domain === 'time') return 'line'
  if (facetType === 'term') return 'circle'
  return 'multivalue'
}

export const MetricsByFacetType = {
  numeric: {
    line: () => [
      lineMetricExtractorFactory('min'),
      lineMetricExtractorFactory('max'),
      lineMetricExtractorFactory('mean'),
      lineMetricExtractorFactory('p99_7')
    ],
    area: () => [stdAreaMetricExtractorFactory('onesigma')]
  },
  term: {
    line: (response: any) => {
      const { domain, facetType } = response.meta ?? {}

      let itemsIds: string[] | undefined = Object.keys(response.itemsDictionary)
      if (domain === 'newspaper' && facetType == 'term') {
        itemsIds = response.items?.[0]?.value?.items?.map(({ term }: { term: any }) => term)
      }
      return itemsIds?.map(itemCountLineMetricExtractorFactory) ?? []
    },
    area: () => []
  }
}

export interface Data {
  meta: any
  items: any
  itemsDictionary: Record<string, any>
}

export default defineComponent({
  components: { PowerChart },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object, // as PropType<Data>,
      default: () => {}
    },
    idFilters: {
      type: Object, // as PropType<Record<string, boolean>>,
      required: false,
      default: null
    },
    options: {
      type: Object,
      required: false,
      default: null
    }
  },
  emits: ['item:click', 'mousemove', 'mouseleave'],
  setup(props) {
    const chartData = computed(() => {
      const data: Data = (props.data != null ? props.data : {}) as Data
      const { meta = {}, items: statsItems, itemsDictionary } = data

      const items =
        meta.domain === 'time'
          ? statsItems.map(({ domain, value }: { domain: any; value: any }) => ({
              domain: new Date(domain),
              value
            }))
          : statsItems

      const entrichedItems =
        meta.domain === 'time'
          ? withMissingDates(
              items,
              meta.resolution,
              (item: any) => item.domain,
              (date: any) => ({ domain: date, value: {} })
            )
          : items

      if (meta == null)
        return {
          items: entrichedItems,
          lineMetrics: [],
          areaMetrics: []
        }

      const metrics =
        MetricsByFacetType[meta.facetType as keyof typeof MetricsByFacetType] ||
        MetricsByFacetType['numeric']
      const lineMetrics = metrics.line(props.data)
      const areaMetrics = (metrics.area as any)(props.data as any)

      const getId = ({ id }: { id: any }) => id
      const paletteReducer =
        (fn: (any: any) => any, base = 0) =>
        (acc: Record<string, any>, id: string, index: number) => ({
          ...acc,
          [id]: fn(base + index)
        })

      const linePalette = lineMetrics.map(getId).reduce(paletteReducer(colorForLineMetric), {})
      const areaPalette = areaMetrics
        .map(getId)
        .reduce(paletteReducer(colorForAreaMetric, lineMetrics.length), {})

      const colorPalette = { ...linePalette, ...areaPalette }

      const idFilters = props.idFilters || {}
      const hasFilters = props.idFilters != null

      const filteredLineMetrics = lineMetrics.filter(metric => !hasFilters || idFilters[metric.id])
      const filteredAreaMetrics = areaMetrics.filter(
        (metric: any) => !hasFilters || idFilters[metric.id]
      )

      return {
        items: entrichedItems,
        lineMetrics: filteredLineMetrics,
        areaMetrics: filteredAreaMetrics,
        itemsDictionary,
        colorPalette,
        horizontal: meta.horizontal
      }
    })

    const chartType = computed(() => {
      if (props.data == null || props.data.meta == null) return undefined
      return getChartType(props.data.meta.domain, props.data.meta.facetType)
    })

    return { chartData, chartType }
  }
})
</script>

<style scoped>
.chart {
  display: block;
  flex-grow: 1;
  height: 100%;
}
.full-height {
  height: 100%;
}
</style>
