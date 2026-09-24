<template>
  <div class="crosshair">
    <tooltip :tooltip="tooltip">
      <slot :tooltip="tooltip">
        <div v-if="tooltip.isActive">
          {{ tooltip.item }}
        </div>
      </slot>
    </tooltip>
    <div ref="chartEl" :style="{ height: `${height}px` }" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import TimeMultiLineChart from '@/d3-modules/TimeMultiLineChart'
import Tooltip from '../tooltips/Tooltip.vue'

export interface Item {
  value: number
  time: Date
}

export interface ItemsSet {
  items: Item[]
  label: string
}

interface TooltipState {
  x: number
  y: number
  isActive: boolean
  item: {
    items: { label: string; item: Item }[]
    colors: string[]
  }
}

const props = withDefaults(
  defineProps<{
    itemsSets?: ItemsSet[]
    height?: number
    roundValueFn?: (v: number) => string
  }>(),
  {
    itemsSets: () => [],
    height: 300,
    roundValueFn: () => (v: number) => String(v)
  }
)

defineSlots<{
  default(props: { tooltip: TooltipState }): unknown
}>()

const chartEl = ref<HTMLElement | null>(null)
const tooltip = ref<TooltipState>({
  x: 0,
  y: 0,
  isActive: false,
  item: { items: [], colors: [] }
})

let chart: TimeMultiLineChart | undefined

function render() {
  chart?.render(props.itemsSets)
}

onMounted(() => {
  chart = new TimeMultiLineChart({
    element: chartEl.value,
    roundValueFn: props.roundValueFn
  })
  chart.render(props.itemsSets)
  chartEl.value?.addEventListener('tooltip', (e: Event) => {
    // console.debug('[MultiLinePlot] tooltip', (e as CustomEvent<TooltipState>).detail)
    tooltip.value = (e as CustomEvent<TooltipState>).detail
  })
  window.addEventListener('resize', render)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', render)
})

watch(() => props.itemsSets, render, { deep: true })
</script>

<style lang="scss">
.crosshair {
  cursor: crosshair;
}
</style>
