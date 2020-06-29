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

    <div class="gutters" :style="{ top: `${this.chart ? this.chart.margin.top : 0}px`, left: `${this.chart ? this.chart.margin.left / 2 : 0}px` }">
      <div v-for="slotIndex in gutterSlotsIndexes"
           :key="slotIndex"
           :style="{ transform: `translate(0, ${getLabelTopOffset(slotIndex) + categoryYSpace}px)`, position: 'absolute' }">
        <slot name="gutter" :categoryIndex="slotIndex">
          <div>Gutter for category {{ slotIndex }}</div>
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
    labelsOffsets: /** @type {number[]} */ ([]),
    categoryYSpace: 0
  }),
  props: {
    /** @type {import('vue').PropOptions<ChartData>} */
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => {}
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
      const { height, yOffsets, categoryYSpace } = this.chart?.render(this.data, this.options) ?? { height: 0, yOffsets: [] }
      this.height = height
      this.labelsOffsets = yOffsets
      this.categoryYSpace = /** @type {number} */ (categoryYSpace)
    },
    getLabelTopOffset(index) {
      return (this.labelsOffsets[index] ?? 0);
    }
  },
  computed: {
    /** @returns {any} */
    chartData() {
      return {
        data: this.data,
        options: this.options
      }
    },
    /** @returns {number[]} */
    gutterSlotsIndexes() {
      return this.data.categories.reduce((acc, { isSubcategory }, index, items) => {
        const nextItem = index === items.length - 1 ? undefined : items[index + 1]
        if (isSubcategory && (nextItem == null || !nextItem.isSubcategory)) {
          acc.push(index)
        }
        return acc;
      }, /** @type {number[]} */ ([]))
    }
  },
  watch: {
    chartData: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
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
      immediate: true,
      deep: true
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