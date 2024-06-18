<template>
  <div class="container-fluid position-relative">
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

    <tooltip :tooltip="tooltip" :class="{ fadeOut: tooltip.fadeOut }">
      <slot name="tooltip" :tooltip="tooltip">
        <div v-if="tooltip.item" class="text-center small-caps">
          <span v-html="$tc('numbers.articles', tooltip.item.value, {
            n: $n(tooltip.item.value),
          })"/> &middot; {{ tooltipFormattedTime }}
          <br/>
          <b>{{tooltip.item.label}}</b>
        </div>
        <div v-else>
          {{ $tc('numbers.resultsParenthesis', 0) }}
        </div>
      </slot>
    </tooltip>
    <div ref="chart" class="time-punchcard" :style="{ height: `${height}px` }" />
    <line-pointer v-if="tooltip.item"
      :label="tooltipFormattedTime"
      :x="tooltip.x"
      :height="height" :class="{ fadeOut: tooltip.fadeOut }"/>
  </div>
</template>

<script>
import TimePunchcardChart from '@/d3-modules/TimePunchcardChart'
import Tooltip from '@/components/modules/tooltips/Tooltip.vue'
import LinePointer from '@/components/modules/tooltips/LinePointer'
/**
 * @typedef {import('@/d3-modules/TimePunchcardChart').ChartData} ChartData
 */
const TooltipOffsetTop = -50;
export default {
  components: {
    Tooltip,
    LinePointer
  },
  data: () => ({
    chart: /** @type {TimePunchcardChart | null} */ (null),
    height: 200,
    labelsOffsets: /** @type {number[]} */ ([]),
    categoryYSpace: 0,
    tooltip: {
      x: 0,
      y: 0,
      isActive:false,
      item: null,
      fadeOut: false,
    },
    timerTooltipFadeOut: 0,
  }),
  props: {
    /** @type {import('vue').PropOptions<ChartData>} */
    data: {
      type: Object,
      required: true,
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
  beforeUnmount() {
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
    fadeOutTooltip() {
      this.tooltip = {
        ...this.tooltip,
        fadeOut: true,
      }
      clearTimeout(this.timerTooltipFadeOut);
      this.timerTooltipFadeOut = setTimeout(() => {
        this.tooltip = {
          ...this.tooltip,
          isActive: false,
          fadeOut: false,
        };
      }, 1000);
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
    tooltipFormattedTime() {
      return this.tooltip.item?.formattedTime
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
    // /** @returns {any} */
    // tooltip() {
    //   return {
    //     isActive: this.chart?.getTooltipDetails() != null,
    //     item: this.$d(this.chart?.getTooltipDetails()?.datapoint.time, 'year')
    //       + ' &middot; <b>' + this.chart?.getTooltipDetails()?.datapoint.value + '</b>',
    //     x: this.chart?.getTooltipDetails()?.x,
    //     y: this.chart?.getTooltipDetails()?.y + 275
    //   }
    // },
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
            this.chart.on('punch.click', (e) => {
              this.$emit('punch-click', e)
              this.fadeOutTooltip();
            });
            this.chart.on('punch.mousemove', ({ x, y, item }) => {
              clearTimeout(this.timerTooltipFadeOut);
              this.tooltip = { x, y: y - TooltipOffsetTop, item, isActive: true };
            });
            this.chart.on('category.mousemove', ({ x, y, item }) => {
              clearTimeout(this.timerTooltipFadeOut);
              this.tooltip = { x, y: y - TooltipOffsetTop, item, isActive: true };
            });
            this.chart.on('category.mouseout', () => this.fadeOutTooltip());
            this.chart.on('punch.mouseout', () => this.fadeOutTooltip());
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

    circle.punch {
      cursor: pointer;
      fill: #000000;
      &:hover{
        fill: blue;
      }
    }

    rect.pointer{
      fill: magenta;
      pointer-events: none;
    }

    .axes {
      .x {
        .domain {
          // hide axes
          stroke-width: 0;
        }
        g.tick {
          line {
            stroke-width: 0.8px;
            stroke: #ddd;
          }
        }
        g.tick.major {
          line {
            stroke-width: 1px;
            stroke: #aaa;
          }
        }
      }
    }

    .categories {
      .category {
        .bar {
          .punch {}
          .highlight {
            stroke-width: 1.5px;
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
