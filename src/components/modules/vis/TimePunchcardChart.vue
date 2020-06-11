<template>
  <div ref="chart" class="time-punchcard container"/>
</template>

<script>
import TimePunchcardChart from '@/d3-modules/TimePunchcardChart'

/**
 * @typedef {import('@/d3-modules/TimePunchcardChart').ChartData} ChartData
 */

export default {
  data: () => ({
    chart: /** @type {TimePunchcardChart | null} */ (null)
  }),
  props: {
    /** @type {import('vue').PropOptions<ChartData>} */
    data: {
      type: Object,
      required: true
    }
  },
  methods: {
    render() {
    }
  },
  watch: {
    data: {
      handler() {
        // Next tick is here to make sure that `$refs.chart` is already available.
        this.$nextTick(() => {
          if (this.chart == null) {
            const element = this.$refs.chart
            element.textContent = ''
            this.chart = new TimePunchcardChart({ element })
          }
          this.chart.render(this.data)
        })
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss">
  .time-punchcard {
    &.container {
      border: 1px dashed red;
      min-height: 3em;
    }

    .axes {
      // hide axes
      .x {
        .domain {
          stroke: #ffffff00
        }
      }
      .y {
        .domain {
          stroke: #ffffff00
        }
        .tick {
          line {
            stroke: #eeeeee77
          }
          text {
            fill: #ffffff00
          }
        }
      }
    }

    .categories {
      .category {
        .bar {
          .punch {}
        }
      }
    }
  }
</style>