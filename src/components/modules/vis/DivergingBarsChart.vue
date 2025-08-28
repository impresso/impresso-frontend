<template>
  <div class="pointer">
    <tooltip :tooltip="tooltip" :calculate-y="true">
      <slot :tooltip="tooltip">
        <div v-if="tooltip.isActive">
          {{ tooltip.item }}
        </div>
      </slot>
    </tooltip>
    <div
      ref="chart"
      class="diverging-bars-chart"
      :style="{ height: `${height}px` }"
      v-on:interaction="updateTooltipData"
    />
  </div>
</template>

<script>
import DivergingBarsChart from '@/d3-modules/DivergingBarsChart'
import Tooltip from '../tooltips/Tooltip.vue'

/**
 * @typedef {{ left: number, right, number, intersection: number, label: string }} Item
 */

export default {
  data: () => ({
    /** @type {DivergingBarsChart | undefined} */
    chart: undefined,
    tooltipData: undefined
  }),
  props: {
    /** @type {import('vue').PropOptions<Item[]>} */
    items: {
      type: Array,
      default: () => []
    },
    /** @type {import('vue').PropOptions<string>} */
    scale: {
      type: String,
      default: 'linear'
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
      return {
        ...(this.tooltipData ?? {}),
        isActive:
          this.tooltipData?.isActive &&
          this.tooltipData?.item != null &&
          Object.keys(this.tooltipData?.item).length > 0
      }
    }
  },
  mounted() {
    this.chart = new DivergingBarsChart({
      element: this.$refs.chart,
      roundValueFn: this.roundValueFn
    })
    this.render()
    // @ts-ignore
    window.addEventListener('resize', this.render.bind(this))
  },
  beforeUnmount() {
    // @ts-ignore
    window.removeEventListener('resize', this.render.bind(this))
  },
  watch: {
    items: {
      handler() {
        this.render()
      },
      deep: true
    },
    scale() {
      this.render()
    },
    tooltipData: {
      handler() {
        this.render()
      },
      deep: true
    }
  },
  methods: {
    render() {
      if (this.chart != null)
        this.chart.render(this.items, {
          scale: /** @type {'linear' | 'sqrt'} */ (this.scale)
        })
    },
    updateTooltipData() {
      this.tooltipData = this.chart
        ? this.chart.tooltipData()
        : {
            x: 0,
            y: 0,
            isActive: false,
            item: undefined
          }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.sass';

.pointer {
  cursor: pointer;
}

$color-a: $inspect-compare-left-panel-color;
$color-b: $inspect-compare-right-panel-color;
$color-text: #333;
$font-size: 0.6em;

.diverging-bars-chart {
  .y-axis {
    stroke: #ddd;
  }

  #diverging-bars-intersection-pattern,
  #diverging-bars-intersection-pattern-flipped {
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
