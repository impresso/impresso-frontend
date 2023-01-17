<template>
  <div class="chart h-100 w-100 position:relative" ref="chart"></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch, PropType } from 'vue'
import LineChart from '@/d3-modules/LineChart'
import CategoricalMultiValueBarChart from '@/d3-modules/CategoricalMultiValueBarChart'
import CategoricalCircleChart from '@/d3-modules/CategoricalCircleChart'

type ChartClass = typeof LineChart | typeof CategoricalCircleChart | typeof CategoricalMultiValueBarChart
type ChartType = 'multivalue' | 'circle' | 'line'

const getChartClass = (type: ChartType): ChartClass => {
  switch(type) {
  case 'circle':
    return CategoricalCircleChart
  case 'line':
    return LineChart
  default:
    return CategoricalMultiValueBarChart
  }
}


export default defineComponent({
  name: 'MultiChart',
  props: {
    chartType: {
      type: String as PropType<ChartType>,
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
    }
  },
  emits: ['item:click'],
  setup(props, { emit }) {
    const chart = ref()
    const instance = ref()

    const render = () => {
      instance.value.render(
        props.data,
        props.lineMetrics,
        props.areaMetrics,
        {
          itemsDictionary: props.itemsDictionary,
          colorPalette: props.colorPalette,
          onClick: e => emit('item:click', e)
        }
      )
    }

    onMounted(() => {
      const Chart = getChartClass(props.chartType)
      instance.value = new Chart({ element: chart.value })
      render()
      window.addEventListener('resize', render);
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', render);
    })

    watch(() => props.chartType, () => {
      if (instance.value != null) {
        instance.value.element.textContent = ''
      }
      const Chart = getChartClass(props.chartType)
      instance.value = new Chart({ element: chart.value })
      render()
    })

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
  }
</style>
