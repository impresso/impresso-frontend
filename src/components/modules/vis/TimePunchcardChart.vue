<template>
  <div class="container-fluid">
    <div class="labels" :style="{ top: `${this.chart ? this.chart.margin.top : 0}px`, left: `${this.chart ? this.chart.margin.left / 2 : 0}px` }">
      <div v-for="(category, index) in data.categories" :key="index" :style="{ transform: `translate(0, ${getLabelTopOffset(index)}px)`, position: 'absolute' }">
        <slot :category="category" :index="index">
          <div :class="`label ${category.isSubcategory ? 'sub' : ''}`">
            Label for {{ category.isSubcategory ? 'sub' : '' }} category {{index}}
          </div>
        </slot>
      </div>
    </div>
    <div ref="chart" class="time-punchcard" :style="{ height: `${height}px` }" />
  </div>
</template>

<script>
import TimePunchcardChart from '@/d3-modules/TimePunchcardChart'

/**
 * @typedef {import('@/d3-modules/TimePunchcardChart').ChartData} ChartData
 */

export default {
  data: () => ({
    chart: /** @type {TimePunchcardChart | null} */ (null),
    height: 200,
    labelsOffsets: /** @type {number[]} */ ([])
  }),
  props: {
    /** @type {import('vue').PropOptions<ChartData>} */
    data: {
      type: Object,
      required: true
    }
  },
  mounted() {
    // @ts-ignore
    window.addEventListener('resize', this.render.bind(this))
  },
  beforeDestroy() {
    // @ts-ignore
    window.removeEventListener('resize', this.render.bind(this))
  },
  methods: {
    render() {
      const { height, yOffsets } = this.chart?.render(this.data) ?? { height: 0, yOffsets: [] }
      this.height = height
      this.labelsOffsets = yOffsets
    },
    getLabelTopOffset(index) {
      return (this.labelsOffsets[index] ?? 0);
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
          this.render()
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
      min-height: 9em;
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
          .highlight {
            // stroke-width: 2px;
            stroke: #fff;
          }
        }
        .sizer {
          width: 2px;
          fill: #777;
        }
        .highlight {
          // fill: #dddddd33;
        }
        &.sub {
          .sizer {
          }
          rect.highlight {
            fill: #dddddd77;
          }
        }
      }
    }
  }
  .labels {
    position: relative;
    .label {
      // position: absolute;
      background: rgb(194, 196, 192);
      min-width: 100px;
      white-space: nowrap;
      padding-left: .5em;
      padding-right: .5em;
      &.sub {
        margin-left: 8px;
        background: rgba(194, 196, 192, 0.3);
      }
    }
  }
</style>