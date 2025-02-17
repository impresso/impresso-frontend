<template>
  <div class="chart flex-grow-1 overflow-auto" ref="chart"></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import LineChart from '@/d3-modules/LineChart'
import CategoricalMultiValueBarChart from '@/d3-modules/CategoricalMultiValueBarChart'
import CategoricalMultiValueBarChartHorizontal from '@/d3-modules/CategoricalMultiValueBarChartHorizontal'

import CategoricalCircleChart from '@/d3-modules/CategoricalCircleChart'

type ChartClass =
  | typeof LineChart
  | typeof CategoricalCircleChart
  | typeof CategoricalMultiValueBarChart
type ChartType = 'multivalue' | 'circle' | 'line'

const getChartClass = (type: ChartType | string, horizontal?: boolean): ChartClass => {
  switch (type) {
    case 'circle':
      return CategoricalCircleChart
    case 'line':
      return LineChart
    default:
      if (horizontal) return CategoricalMultiValueBarChartHorizontal
      return CategoricalMultiValueBarChart
  }
}

export default defineComponent({
  name: 'PowerChart',
  props: {
    chartType: {
      type: String, // as PropType<ChartType>,
      default: 'multivalue'
    },
    data: {
      type: Array, // DataItem[]
      default: () => []
    },
    lineMetrics: {
      type: Array,
      default: () => []
    },
    areaMetrics: {
      type: Array,
      default: () => []
    },
    itemsDictionary: {
      type: Object,
      default: () => {}
    },
    colorPalette: {
      type: Object,
      default: () => {}
    },
    horizontal: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => {}
    }
  },
  emits: ['item:click', 'mousemove'],
  setup(props, { emit }) {
    const chart = ref()
    const instance = ref()

    const render = () => {
      instance.value.render(props.data, props.lineMetrics, props.areaMetrics, {
        itemsDictionary: props.itemsDictionary,
        colorPalette: props.colorPalette,
        onClick: e => emit('item:click', e),
        onMouseMove: e => emit('mousemove', e),
        ...props.options
      })
    }

    onMounted(() => {
      const Chart = getChartClass(props.chartType, props.horizontal)
      instance.value = new Chart({ element: chart.value })
      render()
      window.addEventListener('resize', render)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', render)
    })

    watch(
      () => props.chartType,
      () => {
        if (instance.value != null) {
          instance.value.element.textContent = ''
        }
        const Chart = getChartClass(props.chartType, props.horizontal)
        instance.value = new Chart({ element: chart.value })
        render()
      }
    )

    watch(
      () => ({
        data: JSON.stringify(props.data),
        lineMetrics: props.lineMetrics,
        areaMetrics: props.areaMetrics,
        colorPalette: props.colorPalette
      }),
      () => {
        if (instance.value == null) return
        render()
      },
      { deep: true }
    )

    return { chart }
  }
})
</script>

<style scoped>
.chart {
  display: block;
  flex-grow: 1;
  height: 100%;
}
</style>
