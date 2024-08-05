<template>
  <div class="crosshair">
    <tooltip :tooltip="tooltip">
      <slot :tooltip="tooltip">
        <div v-if="tooltip.isActive">
          {{ tooltip.item }}
        </div>
      </slot>
    </tooltip>
    <div ref="chart" :style="{ height: `${height}px` }" />
  </div>
</template>

<script>
import TimeMultiLineChart from '@/d3-modules/TimeMultiLineChart'
import Tooltip from '../tooltips/Tooltip.vue'

/**
 * @typedef {{ value: number, time: Date }} Item
 * @typedef {{ items: Item[], label: string }} ItemsSet
 */

export default {
  data: () => ({
    /** @type {TimeMultiLineChart | undefined} */
    chart: undefined,
    tooltip: {
      x: 0,
      y: 0,
      isActive: false,
      item: { items: [] }
    }
  }),
  props: {
    /** @type {import('vue').PropOptions<ItemsSet[]>} */
    itemsSets: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 300
    },
    /** @type {import('vue').PropOptions<(number) => string>} */
    roundValueFn: {
      type: Function,
      default: () => v => v
    }
  },
  components: {
    Tooltip
  },
  mounted() {
    this.chart = new TimeMultiLineChart({
      element: this.$refs.chart,
      roundValueFn: this.roundValueFn
    })
    this.chart.render(this.itemsSets)
    this.$refs.chart.addEventListener('tooltip', e => {
      console.debug('[MultiLinePlot] tooltip', e.detail)
      this.tooltip = e.detail
    })
    // @ts-ignore
    window.addEventListener('resize', this.render.bind(this))
  },
  beforeUnmount() {
    // @ts-ignore
    window.removeEventListener('resize', this.render.bind(this))
  },
  watch: {
    itemsSets: {
      handler() {
        this.render()
      },
      deep: true
    }
  },
  methods: {
    render() {
      if (this.chart != null) this.chart.render(this.itemsSets)
    }
  }
}
</script>

<style lang="scss">
.crosshair {
  cursor: crosshair;
}
</style>
