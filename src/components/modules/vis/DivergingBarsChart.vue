<template>
  <div class="crosshair">
    <div ref="chart" :style="{ height: `${height}px`, border: '1px solid #999' }"/>
  </div>
</template>

<script>
import DivergingBarsChart from '@/d3-modules/DivergingBarsChart'

/**
 * @typedef {{ left: number, right, number, intersection: number, label: string }} Item
 */

export default {
  data: () => ({
    /** @type {DivergingBarsChart | undefined} */
    chart: undefined
  }),
  props: {
    /** @type {import('vue').PropOptions<Item[]>} */
    items: {
      type: Array,
      default: () => []
    }
  },
  components: {
  },
  computed: {
    /** @returns {number} */
    height() {
      if (this.chart == null) return 0
      return this.chart.getLastHeight()
    }
  },
  mounted() {
    this.chart = new DivergingBarsChart({ element: this.$refs.chart })
    this.chart.render(this.items)
    // @ts-ignore
    window.addEventListener('resize', this.render.bind(this))
  },
  beforeDestroy() {
    // @ts-ignore
    window.removeEventListener('resize', this.render.bind(this))
  },
  watch: {
    items: {
      handler() { this.render() },
      deep: true
    }
  },
  methods: {
    render() {
      if (this.chart != null) this.chart.render(this.items)
    }
  }
}
</script>

<style lang="scss">
  .crosshair {
    cursor: crosshair;
  }
</style>
