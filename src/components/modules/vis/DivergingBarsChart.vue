<template>
  <div class="pointer">
    <tooltip :tooltip="tooltip" :calculate-y="true">
      <slot :tooltip="tooltip">
        <div v-if="tooltip.isActive">
          {{tooltip.item}}
        </div>
      </slot>
    </tooltip>
    <div ref="chart" class="diverging-bars-chart" :style="{ height: `${height}px` }"/>
  </div>
</template>

<script>
import DivergingBarsChart from '@/d3-modules/DivergingBarsChart'
import Tooltip from '../tooltips/Tooltip'

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
    },
    /** @type {import('vue').PropOptions<{ colorLeft?: string, colorRight?: string }>} */
    colors: {
      type: Object,
      default: () => ({})
    },
    /** @type {import('vue').PropOptions<(number) => string>} */
    roundValueFn: {
      type: Function,
      default: undefined
    }
  },
  components: {
    Tooltip
  },
  computed: {
    /** @returns {number} */
    height() {
      if (this.chart == null) return 0
      return this.chart.getLastHeight()
    },
    /** @returns {any} */
    tooltip() {
      const tooltipData = this.chart
        ? this.chart.tooltipData()
        : {
          x: 0,
          y: 0,
          isActive: false,
          item: undefined
        }
      return {
        ...tooltipData,
        isActive: tooltipData.isActive && tooltipData.item != null && tooltipData.item !== {}
      }
    }
  },
  mounted() {
    this.chart = new DivergingBarsChart({
      element: this.$refs.chart,
      roundValueFn: this.roundValueFn
    })
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
  .pointer {
    cursor: pointer;
  }

  $color-a: #2e80c9;
  $color-b: #FC5C53;
  $color-text: #333;
  $font-size: 0.6em;

  .diverging-bars-chart {
    .y-axis {
      stroke: #ddd;
    }

    #diverging-bars-intersection-pattern {
      .path-a {
        stroke-width: 1.5;
        stroke: $color-a;
      }
      .path-b {
        stroke-width: 1.5;
        stroke: $color-b;
      }
    }

    .labels {
      text {
        fill: $color-text;
        font-size: $font-size;
      }
    }

    .bars {
      .side {

        .bar {
          text {
            fill: $color-text;
            font-size: $font-size;
          }
        }

        &.left {
          .bar {
            rect {
              fill: $color-a;
            }
          }
        }

        &.right {
          .bar {
            rect {
              fill: $color-b;
            }
          }
        }
      }
    }
  }

</style>
