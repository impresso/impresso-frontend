<template>
  <b-container class="histogram-slider">
    <b-col>
      <b-row ref="chartContainer" class="position-relative">
        <svg ref="chart" class="chart" preserveAspectRatio="none"></svg>
        <Tooltip v-if="showTooltip" :tooltip="tooltipState">
          <template v-if="tooltipState.bucket">
            {{
              $t('tooltipContent', {
                val: tooltipState.bucket.val,
                count: $n(tooltipState.bucket.count)
              })
            }}
          </template>
        </Tooltip>
      </b-row>
      <b-row v-if="shouldEnableSlider">
        <VueSlider
          width="100%"
          v-model="sliderValue"
          v-bind="{
            modelValue: [sliderValue[0], sliderValue[1]],
            min: sliderRange[0],
            max: sliderRange[1]
          }"
          :tooltip-formatter="formatTooltip"
          :tooltip-placement="onlyRangeLabels ? 'bottom' : 'top'"
          data-testid="slider-control"
        />
      </b-row>
    </b-col>
  </b-container>
</template>

<script lang="ts">
import Bucket from '@/models/Bucket'
import * as d3 from 'd3'
import { PropType } from 'vue'
import VueSlider from 'vue-3-slider-component'
import Tooltip from '../tooltips/Tooltip.vue'
/**
 * NOTE: Only works with integers. If you need to do fractions you
 * will need to normalise them.
 */
export default {
  name: 'HistogramSlider',
  props: {
    modelValue: {
      type: Array as PropType<number[]>
    },
    range: {
      type: Array as PropType<number[]>
    },
    buckets: {
      type: Array as PropType<Bucket[]>
    },
    chartHeight: {
      type: Number,
      default: 50
    },
    onlyRangeLabels: {
      type: Boolean,
      default: false
    },
    scaleType: {
      type: String as PropType<'linear' | 'sqrt' | 'symlog'>,
      default: 'linear'
    },
    valueLabel: {
      type: String,
      default: 'valueLabel'
    },
    showTooltip: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change', 'mousemove', 'click'],
  mounted() {
    // @ts-ignore
    window.addEventListener('resize', this.renderChart.bind(this))
    this.renderChart()
  },
  beforeUnmount() {
    // @ts-ignore
    window.removeEventListener('resize', this.renderChart.bind(this))
  },
  computed: {
    value() {
      return this.modelValue
    },
    sliderValue: {
      get() {
        return this.value?.length === 2 ? this.value : [this.sliderRange[0], this.sliderRange[1]]
      },
      set(value?: number[]) {
        this.$emit('change', value)
        this.$emit('update:modelValue', value)
      }
    },
    sliderMarks(): { [key: string]: string } | string[] | undefined {
      if (this.onlyRangeLabels) {
        return this.sliderRange.reduce((acc, d) => {
          let label = ''
          try {
            label = this.$n(d)
          } catch {
            /* noop */
          }
          acc[d] = { label }
          return acc
        }, {})
      }
      const marksCount = 10
      if (this.buckets && this.buckets.length > 0) {
        const step = Math.floor(this.buckets.length / marksCount)
        return this.buckets
          .reduce((acc, { val }, index) => {
            if (index % step === 0) acc.push(val)
            return acc
          }, [])
          .concat([this.sliderRange[1].toString()])
      }
      const [min, max] = this.sliderRange
      const step = (max - min) / marksCount
      if (Number.isNaN(step)) return undefined
      return Array.from({ length: marksCount + 1 }, (_, i) => this.$n(min + i * step))
    },
    sliderRange() {
      const vals = this.buckets.map(({ val }) =>
        typeof val === 'string' ? parseInt(val, 10) : val
      )
      const min = Math.min(...vals)
      const max = Math.max(...vals)
      if (this.range == null) return [min, max]

      return [min < this.range[0] ? min : this.range[0], max > this.range[1] ? max : this.range[1]]
    },
    shouldEnableSlider() {
      if (
        !isNaN(this.sliderRange[0]) &&
        isFinite(this.sliderRange[0]) &&
        !isNaN(this.sliderRange[1]) &&
        isFinite(this.sliderRange[1]) &&
        !isNaN(this.sliderValue[0]) &&
        !isNaN(this.sliderValue[1])
      ) {
        return true
      }
      return false
    }
  },
  methods: {
    renderChart() {
      const topMargin = 14
      const { width } = (this.$refs.chartContainer as any).$el.getBoundingClientRect()
      const svg = d3.select(this.$refs.chart as SVGSVGElement)

      svg.attr('width', width)
      svg.attr('height', this.chartHeight)

      const counts = this.buckets.map(({ count }) => count)

      const maxCountBucketIndex = counts.indexOf(Math.max(...counts))
      // console.debug('renderChart()', this.buckets)
      const x = d3
        .scaleBand()
        .domain(this.buckets.map(({ val }) => String(val)))
        .range([0, width])
        .paddingInner(0.05)

      const yScaler = {
        linear: d3.scaleLinear(),
        sqrt: d3.scaleSqrt(),
        symlog: d3.scaleSymlog()
      }[this.scaleType ?? 'linear']

      const y = yScaler
        .domain([Math.min(...counts), Math.max(...counts)])
        .range([0, this.chartHeight - topMargin])

      // return the index of the bar with the maximum value
      const barIndexWithMaximumValue = this.buckets.reduce((acc, d, i) => {
        if (acc === -1) return i
        if (d.count > this.buckets[acc].count) return i
        return acc
      }, -1)

      const bars = svg
        .selectAll('g.bars')
        .data([null])
        .join('g')
        .attr('class', 'bars')
        .selectAll('g.bar')
        .data(this.buckets)
        .join('g')
        .attr('class', (d, i) => (i === barIndexWithMaximumValue ? 'bar max' : 'bar'))
        .attr(
          'transform',
          d => `translate(${x(String(d.val)) ?? 0}, ${this.chartHeight - y(d.count)})`
        )

      // add rects to the bars
      bars
        .append('rect')
        .attr('width', x.bandwidth())
        .attr('height', d => Math.max(1, y(d.count)))

      // add a black line on top of the bars
      bars
        .append('line')
        .attr('x1', 0)
        .attr('x2', x.bandwidth())
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', 'black')

      bars
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => x(String(d.val)) ?? 0)
        .attr('width', x.bandwidth())
        .attr('y', d => this.chartHeight - y(d.count))
        .attr('height', d => Math.max(1, y(d.count)))
        // add black lines to the top of the bars
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x.bandwidth())
        .attr('y2', 0)
        .attr('stroke', 'black')

      const hoveredBar = svg.selectAll('g.hovered-bar').data([null]).join('g')

      const hoveredBackground = hoveredBar
        .append('rect')
        .attr('class', 'hovered-background')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', x.bandwidth())
        .attr('height', 0)
      const hoveredValue = hoveredBar
        .append('rect')
        .attr('class', 'hovered-value')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', x.bandwidth())
        .attr('height', 0)

      // emit mouse events based on mouse position

      svg
        .on('mousemove', event => {
          const [xPos] = d3.pointer(event)
          const bucket = this.buckets.find(
            ({ val }) => x(String(val)) <= xPos && xPos <= x(String(val)) + x.bandwidth()
          )
          if (bucket) {
            const xBucket = x(String(bucket.val)) ?? 0
            const yBucket = this.chartHeight - y(bucket.count)
            this.$emit('mousemove', {
              pointer: {
                x: xBucket + x.bandwidth() / 2,
                y: yBucket
              },
              // hspace: this.chartWidth,
              bucket
            })
            // translate the hovered bar to the correct position using transform for x and y
            hoveredBar.attr('transform', `translate(${xBucket}, ${yBucket})`)

            hoveredValue
              // assign height
              .attr('height', Math.max(2, this.chartHeight - yBucket - 1))
            hoveredBackground
              // assign height
              .attr('height', this.chartHeight - topMargin)

            // Update tooltip state
            if (this.showTooltip) {
              this.tooltipState = {
                x: xBucket + x.bandwidth() / 2,
                y: this.chartHeight - y(bucket.count) - 50,
                isActive: true,
                bucket
              }
            }
          } else {
            this.$emit('mousemove', null)
            if (this.showTooltip) {
              this.tooltipState.isActive = false
            }
          }
        })
        .on('mouseleave', () => {
          this.$emit('mousemove', null)
          hoveredValue.attr('height', 0)
          hoveredBackground.attr('height', 0)
        })
        .on('click', event => {
          const [xPos] = d3.pointer(event)
          const bucket = this.buckets.find(
            ({ val }) => x(String(val)) <= xPos && xPos <= x(String(val)) + x.bandwidth()
          )
          if (bucket) {
            this.$emit('click', { bucket })
          }
        })

      const maxval = svg
        .selectAll('g.maxval')
        .data(maxCountBucketIndex >= 0 ? [this.buckets[maxCountBucketIndex]] : [])
        .join('g')
        .attr('class', 'maxval')
        .attr('transform', bucket => {
          const xOffset = (x(String(bucket.val)) ?? 0) + x.bandwidth() / 2
          const yOffset = this.chartHeight - y(bucket.count)
          return `translate(${xOffset}, ${yOffset})`
        })

      maxval
        .selectAll('text')
        .data(d => [d])
        .join('text')
        .attr('dy', -5)
        .text(bucket => {
          const tlabel = bucket.upper && bucket.upper !== bucket.lower ? 'maxvalrange' : 'maxval'
          return this.$t(tlabel, {
            n: this.$n(Math.round(bucket.count)),

            ...bucket,
            val: this.$t(this.valueLabel, {
              val: bucket.val,
              valAsNumber: this.$n(parseFloat('' + bucket.val))
            })
          })
        })
        .attr('text-anchor', bucket => {
          const xOffset = (x(String(bucket.val)) ?? 0) + x.bandwidth() / 2
          const oneThirdWidth = width / 3
          if (xOffset <= oneThirdWidth) return 'start'
          if (xOffset >= 2 * oneThirdWidth) return 'end'
          return 'middle'
        })

      maxval
        .selectAll('circle.point')
        .data(d => [d])
        .join('circle')
        .attr('class', 'point')
        .attr('r', 2) // 3
    },
    formatTooltip(d) {
      return this.$n(d)
    }
  },
  watch: {
    buckets() {
      // if is mounted
      if (this.$refs.chart) {
        this.renderChart()
      }
    }
  },
  components: {
    VueSlider,
    Tooltip
  },
  data() {
    return {
      tooltipState: {
        x: 0,
        y: 50,
        isActive: false,
        bucket: null
      }
    }
  }
}
</script>

<style lang="scss">
.histogram-slider {
  .slider {
    width: 100% !important;
    margin-bottom: 1.4em; // slider ticks
  }

  .chart {
    .bars {
      .bar {
        fill: #d8d8d8;
      }

      .bar.max {
        fill: #999999;
      }
    }

    .hovered-value {
      fill: #999999;
    }

    .hovered-background {
      fill: #b65656;
    }

    .maxval {
      font-size: 12px;

      .point {
        fill: var(--impresso-color-black);
      }
    }

    /* Tooltip styles are now handled by the Tooltip component */
  }
}
</style>
<i18n lang="json">
{
  "en": {
    "maxval": "{val} ({n} results)",
    "maxvalrange": "{lower} - {upper} ({n} results)",
    "valueLabel": "{n}",
    "valueAsPercentageLabel": "{val}%",
    "tooltipContent": "{val}: {count} results"
  }
}
</i18n>
