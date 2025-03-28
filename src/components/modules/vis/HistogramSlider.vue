<template>
  <b-container class="histogram-slider">
    <b-col>
      <b-row ref="chartContainer">
        <svg ref="chart" class="chart" preserveAspectRatio="none"></svg>
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

<script>
import * as d3 from 'd3'
import VueSlider from 'vue-3-slider-component'
/**
 * NOTE: Only works with integers. If you need to do fractions you
 * will need to normalise them.
 */
export default {
  name: 'HistogramSlider',
  props: {
    /** @type {import('vue').PropOptions<Number[]>} */
    modelValue: {
      type: Array
    },
    /** @type {import('vue').PropOptions<Number[]>} */
    range: {
      type: Array
    },
    /** @type {import('vue').PropOptions<import('@/models').Bucket[]>} */
    buckets: {
      type: Array
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
      type: String,
      default: 'linear'
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
      /** @returns {undefined|number[]} */
      get() {
        return this.value?.length === 2 ? this.value : [this.sliderRange[0], this.sliderRange[1]]
      },
      /** @param {undefined|number[]} value */
      set(value) {
        this.$emit('change', value)
        this.$emit('update:modelValue', value)
      }
    },
    /** @returns {{[key:string]: string}|string[]|undefined} */
    sliderMarks() {
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
          }, /** @type {string[]} */ ([]))
          .concat([this.sliderRange[1].toString()])
      }
      const [min, max] = this.sliderRange
      const step = (max - min) / marksCount
      if (Number.isNaN(step)) return undefined
      return Array.from({ length: marksCount + 1 }, (_, i) => this.$n(min + i * step))
    },
    /** @returns {number[]} */
    sliderRange() {
      const vals = this.buckets.map(({ val }) => parseInt(val, 10))
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
      const { width } = this.$refs.chartContainer.$el.getBoundingClientRect()
      const svg = d3.select(this.$refs.chart)

      svg.attr('width', width)
      svg.attr('height', this.chartHeight)

      const counts = this.buckets.map(({ count }) => count)

      const maxCountBucketIndex = counts.indexOf(Math.max(...counts))
      // console.debug('renderChart()', this.buckets)
      const x = d3
        .scaleBand()
        .domain(this.buckets.map(({ val }) => val))
        .range([0, width])
        .paddingInner(0.05)

      const yScaler =
        {
          linear: d3.scaleLinear,
          sqrt: d3.scaleSqrt,
          symlog: d3.scaleSymlog
        }[this.scaleType] ?? d3.scaleLinear

      const y = yScaler()
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
        .attr('transform', d => `translate(${x(d.val) ?? 0}, ${this.chartHeight - y(d.count)})`)

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
        .attr('x', d => x(d.val) ?? 0)
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
            ({ val }) => x(val) <= xPos && xPos <= x(val) + x.bandwidth()
          )
          if (bucket) {
            const xBucket = x(bucket.val) ?? 0
            const yBucket = this.chartHeight - y(bucket.count)
            this.$emit('mousemove', {
              pointer: {
                x: xBucket + x.bandwidth() / 2,
                y: yBucket
              },
              hspace: this.chartWidth,
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
          } else {
            this.$emit('mousemove', null)
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
            ({ val }) => x(val) <= xPos && xPos <= x(val) + x.bandwidth()
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
          const xOffset = (x(bucket.val) ?? 0) + x.bandwidth() / 2
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
            ...bucket
          })
        })
        .attr('text-anchor', bucket => {
          const xOffset = (x(bucket.val) ?? 0) + x.bandwidth() / 2
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
    VueSlider
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
  }
}
</style>
<i18n lang="json">
{
  "en": {
    "maxval": "{val} ({n} results)",
    "maxvalrange": "{lower} - {upper} ({n} results)"
  }
}
</i18n>
