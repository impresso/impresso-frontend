<template>
  <div>
    <!-- slot:header -->
    <div slot="header">
      <span>Header rendered here. For example, dropdown box(es)</span>
      <p>Below are sample TR passages where every rendered item (circle) is clickable</p>
    </div>
    <!-- slot:body -->
    <div><em v-if="loading">{{ $t('actions.loading') }}</em></div>
    <PowerChart
      :data="chartData.items"
      :chart-type="chartType"
      :line-metrics="chartData.lineMetrics"
      :area-metrics="chartData.areaMetrics"
      :color-palette="chartData.colorPalette"
      :items-dictionary="chartData.itemsDictionary"
      @item:click="e => $emit('item:click', e)"
    />
    <!-- slot:footer -->
    <div slot="footer" class="border-top p-2 pb-3" style="max-height: 180px;overflow:scroll">
      <span>footer rendered here. for example, checkboxes</span>
    </div>
  </div>
</template>

<script lang="ts">
import { schemeCategory10, schemeAccent } from 'd3'
import { computed, defineComponent } from 'vue'
import { withMissingDates } from '@/logic/time'
import PowerChart from './PowerChart.vue'

function colorForLineMetric(index) {
  if (index < 0) return '#ffffffff'
  return schemeCategory10[index % schemeCategory10.length]
}

function colorForAreaMetric(index) {
  if (index < 0) return '#ffffffff'
  return `${schemeAccent[index % schemeAccent.length]}33`
}


interface LineMetricExtractor {
  id: string,
  extractor: (any) => number
}

interface AreaMetricExtractor {
  id: string,
  extractor: (any) => [number, number]
}

const lineMetricExtractorFactory = (metric: string): LineMetricExtractor => ({ id: metric, extractor: value => (value || {})[metric] })

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
    const item = items.find(({ term }) => term === metric)
    return item ? item.count : undefined
  }
})

const getChartType = (domain?: string, facetType?: string): string => {
  if (domain === 'time') return 'line'
  if (facetType === 'term') return 'circle'
  return 'multivalue'
}


const MetricsByFacetType = {
  numeric: {
    line: () => [
      lineMetricExtractorFactory('min'),
      lineMetricExtractorFactory('max'),
      lineMetricExtractorFactory('mean'),
      lineMetricExtractorFactory('p99_7')
    ],
    area: () => [
      stdAreaMetricExtractorFactory('onesigma')
    ]
  },
  term: {
    line: response => {
      const itemsIds = Object.keys(response.itemsDictionary)
      return itemsIds.map(itemCountLineMetricExtractorFactory)
    },
    area: () => []
  }
}

// interface Data {
//   meta: any
//   items: any
//   itemsDictionary: Record<string, any>
// }

const DefaultNumberOfItemsInChart = 10


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
    }
  },
  emits: ['item:click'],
  setup(props) {
    const chartData = computed(() => {
      const { meta = {}, items: statsItems, itemsDictionary } = props.data != null ? props.data : {}

      const items = meta.domain === 'time'
        ? statsItems.map(({ domain, value }) => ({
          domain: new Date(domain),
          value
        }))
        : statsItems

      const entrichedItems = meta.domain === 'time'
        ? withMissingDates(
          items,
          meta.resolution,
          item => item.domain,
          date => ({ domain: date, value: {} })
        )
        : items

      if (meta == null) return {
        items: entrichedItems,
        lineMetrics: [],
        areaMetrics: []
      }

      const metrics = MetricsByFacetType[meta.facetType] || MetricsByFacetType['numeric']
      const lineMetrics = metrics.line(props.data)
      const areaMetrics = metrics.area(props.data)

      const getId = ({ id }) => id
      const paletteReducer = (fn, base = 0) => (acc, id, index) => ({ ...acc, [id]: fn(base + index)})

      const linePalette = lineMetrics.map(getId).reduce(paletteReducer(colorForLineMetric), {})
      const areaPalette = areaMetrics.map(getId).reduce(paletteReducer(colorForAreaMetric, lineMetrics.length), {})

      const colorPalette = { ...linePalette, ...areaPalette }

      const selectedItems = lineMetrics.map(({ id }) => id)
        .concat(areaMetrics.map(({ id }) => id))
        .reduce((acc, id, index) => {
          if (index > DefaultNumberOfItemsInChart) return acc
          acc[id] = true
          return acc
        }, {})

      const filteredLineMetrics = lineMetrics.filter(metric => selectedItems[metric.id])
      const filteredAreaMetrics = areaMetrics.filter(metric => selectedItems[metric.id])

      return {
        items: entrichedItems,
        lineMetrics: filteredLineMetrics,
        areaMetrics: filteredAreaMetrics,
        itemsDictionary,
        colorPalette
      }
    })

    return { chartData, chartType: getChartType(props.data.meta.domain, props.data.meta.facetType) }
  }
})
</script>