<template>
  <div class="d-flex flex-column crosshair">
    <tooltip :tooltip="tooltip">
      <slot :tooltip="tooltip">
        <div v-if="tooltip.isActive">
          {{tooltip.item}}
        </div>
      </slot>
    </tooltip>
    <div ref="chart" :style="{ height: `${height}px` }"/>
  </div>
</template>

<script>
import TimeMultiLineChart from '@/d3-modules/TimeMultiLineChart'
import Tooltip from '../tooltips/Tooltip'

/**
 * @typedef {{ value: number, time: Date }} Item
 * @typedef {{ items: Item[], label: string }} ItemsSet
 */

export default {
  data: () => ({
    /** @type {TimeMultiLineChart | undefined} */
    chart: undefined
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
    }
  },
  components: {
    Tooltip
  },
  computed: {
    /** @returns {any} */
    tooltip() {
      return this.chart
        ? this.chart.tooltipData()
        : {
          x: 0,
          y: 0,
          isActive: false,
          item: { items: [] }
        }
    }
  },
  mounted() {
    this.chart = new TimeMultiLineChart({ element: this.$refs.chart })
    this.chart.render(this.itemsSets)
    // @ts-ignore
    window.addEventListener('resize', this.render.bind(this))
  },
  beforeDestroy() {
    // @ts-ignore
    window.removeEventListener('resize', this.render.bind(this))
  },
  watch: {
    itemsSets: {
      handler() { this.render() },
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
