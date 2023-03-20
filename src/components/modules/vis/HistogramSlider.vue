<template>
  <b-container class="histogram-slider">
    <b-col>
      <b-row ref="chartContainer">
        <svg ref="chart" class="chart" preserveAspectRatio="none"></svg>
      </b-row>
      <b-row>
        <vue-slider
          class="slider"
          v-model="sliderValue"
          :min="sliderRange[0]"
          :max="sliderRange[1]"
          :marks="sliderMarks"
          :silent="true"
          :enable-cross="false"
          :tooltip-formatter="formatTooltip"
          :tooltip-placement="onlyRangeLabels ? 'bottom' : 'top'"
        />
      </b-row>
    </b-col>
  </b-container>
</template>

<script>
import * as d3 from 'd3'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

/**
 * NOTE: Only works with integers. If you need to do fractions you
 * will need to normalise them.
 */
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    /** @type {import('vue').PropOptions<Number[]>} */
    value: {
      type: Array,
    },
    /** @type {import('vue').PropOptions<Number[]>} */
    range: {
      type: Array,
    },
    /** @type {import('vue').PropOptions<import('@/models').Bucket[]>} */
    buckets: {
      type: Array,
    },
    chartHeight: {
      type: Number,
      default: 50,
    },
    onlyRangeLabels: {
      type: Boolean,
      default: false,
    },
    scaleType: {
      type: String,
      default: 'linear',
    },
  },
  mounted() {
    // @ts-ignore
    window.addEventListener('resize', this.renderChart.bind(this))
    this.renderChart()
  },
  beforeDestroy() {
    // @ts-ignore
    window.removeEventListener('resize', this.renderChart.bind(this))
  },
  computed: {
    sliderValue: {
      /** @returns {undefined|number[]} */
      get() {
        return this.value?.length === 2 ? this.value : [0, 0]
      },
      /** @param {undefined|number[]} value */
      set(value) {
        this.$emit('change', value)
      },
    },
    /** @returns {{[key:string]: string}|string[]|undefined} */
    sliderMarks() {
      if (this.onlyRangeLabels) {
        return this.sliderRange.reduce((acc, d) => {
          acc[d] = { label: this.$n(d) }
          return acc
        }, {})
      }

      const marksCount = 10

      if (this.buckets && this.buckets.length > 0) {
        const step = Math.floor(this.buckets.length / marksCount)
        return this.buckets
          .reduce(
            (acc, { val }, index) => {
              if (index % step === 0) acc.push(val)
              return acc
            },
            /** @type {string[]} */ ([]),
          )
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
  },
  methods: {
    renderChart() {
      const topMargin = 14
      const { width } = this.$refs.chartContainer.getBoundingClientRect()

      const svg = d3.select(this.$refs.chart)

      svg.attr('width', width)
      svg.attr('height', this.chartHeight)

      const counts = this.buckets.map(({ count }) => count)
      console.debug('renderChart()', this.buckets)
      const x = d3
        .scaleBand()
        .domain(this.buckets.map(({ val }) => val))
        .range([0, width])
        .paddingInner(0.05)

      const yScaler =
        {
          linear: d3.scaleLinear,
          sqrt: d3.scaleSqrt,
          symlog: d3.scaleSymlog,
        }[this.scaleType] ?? d3.scaleLinear

      const y = yScaler()
        .domain([Math.min(...counts), Math.max(...counts)])
        .range([0, this.chartHeight - topMargin])

      svg
        .selectAll('g.bars')
        .data([null])
        .join('g')
        .attr('class', 'bars')
        .selectAll('rect.bar')
        .data(this.buckets)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.val) ?? 0)
        .attr('width', x.bandwidth())
        .attr('y', d => this.chartHeight - y(d.count))
        .attr('height', d => y(d.count))

      const maxCountBucketIndex = counts.indexOf(Math.max(...counts))

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
            n : this.$n(Math.round(bucket.count)), 
            ... bucket 
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
        .attr('r', 1)
    },
    formatTooltip(d) {
      return this.$n(d)
    },
  },
  watch: {
    buckets() {
      this.renderChart()
    },
  },
  components: {
    VueSlider,
  },
}
</script>

<style lang="scss">
@import 'impresso-theme/src/scss/variables.sass';
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
    }
    .maxval {
      font-size: 12px;
      .point {
        fill: $clr-primary;
      }
    }
  }
}
</style>
<i18n>
{
  "en": {
    "maxval": "{v} ({n} results)",
    "maxvalrange": "{lower} - {upper} ({n} results)"
  }
}