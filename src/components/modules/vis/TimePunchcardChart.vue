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
           :style="{ transform: `translate(0, ${getLabelTopOffset(slotIndex) + categoryYSpace}px)` }">
        <slot name="gutter" :categoryIndex="slotIndex">
          <div>Gutter for category {{ slotIndex }}</div>
        </slot>
      </div>
    </div>

    <tooltip :tooltip="tooltip">
      <slot name="tooltip" :tooltip="tooltip">
        <div v-if="tooltip.isActive" v-html="tooltip.item" />
      </slot>
    </tooltip>
    <div ref="chart" class="time-punchcard" :style="{ height: `${height}px` }" />
  </div>
</template>

<script>
import TimePunchcardChart from '@/d3-modules/TimePunchcardChart'
import Tooltip from '@/components/modules/tooltips/Tooltip'

/**
 * @typedef {import('@/d3-modules/TimePunchcardChart').ChartData} ChartData
 */

export default {
  components: {
    Tooltip
  },
  data: () => ({
    chart: /** @type {TimePunchcardChart | null} */ (null),
    height: 200,
    labelsOffsets: /** @type {number[]} */ ([]),
    categoryYSpace: 0,
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
    },
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
    },
    /** @returns {any} */
    tooltip() {
      return {
        isActive: this.chart?.getTooltipDetails() != null,
        item: this.$d(this.chart?.getTooltipDetails()?.datapoint.time, 'year')
          + ' &middot; <b>' + this.chart?.getTooltipDetails()?.datapoint.value + '</b>',
        x: this.chart?.getTooltipDetails()?.x,
        y: this.chart?.getTooltipDetails()?.y + 275
      }
    },
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
            this.chart.on('punch.click', (e) => this.$emit('punch-click', e));
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
      .x {
        .domain {
          // hide axes
          stroke-width: 0;
        }
        g.tick {
          line {
            stroke-width: 0.5px;
            stroke: #ddd;
          }
        }
        g.tick.major {
          line {
            stroke-width: 1px;
            // stroke: #bbb;
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
          width: 4px;
          fill: #7772;
        }
        .highlight {
          // fill: #dddddd33;
        }
        &.sub {
          .sizer {
          }
          rect.highlight {
            fill: #dddddd77;
            //stroke: #ff0000;
          }
        }
      }
    }
  }
  .labels {
    position: relative;
    .label {
      position: absolute;
      white-space: nowrap;
      &.sub {
        margin-left: 8px;
      }
    }
  }
</style>
