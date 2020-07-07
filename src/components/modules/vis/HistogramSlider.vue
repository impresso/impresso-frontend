<template>
  <b-container class="histogram-slider">
    <b-col>
      <b-row ref="chartContainer">
        <svg ref="chart" class="chart" preserveAspectRatio="none"/>
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
          :tooltip-placement="onlyRangeLabels ? 'bottom' : 'top'"
          @change="handleValueChanged"/>
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
  data: () => ({
    value: /** @type {undefined|number[]} */ (undefined)
  }),
  props: {
    /** @type {import('vue').PropOptions<Number[]>} */
    range: {
      type: Array
    },
    /** @type {import('vue').PropOptions<import('@/models').Bucket[]>} */
    buckets: {
      type: Array
    },
    /** @type {import('vue').PropOptions<Number[]>} */
    defaultValue: {
      type: Array
    },
    chartHeight: {
      type: Number,
      default: 50
    },
    onlyRangeLabels: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    if (this.defaultValue) {
      this.value = this.defaultValue
    } else {
      this.value = this.sliderRange
    }

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
        return this.value
      },
      /** @param {undefined|number[]} value */
      set(value) {
        this.value = value
      }
    },
    /** @returns {string[]|undefined} */
    sliderMarks() {
      if (this.onlyRangeLabels) return this.sliderRange.map(v => v.toString())

      const marksCount = 10

      if (this.buckets && this.buckets.length > 0) {
        const step = Math.floor(this.buckets.length / marksCount)
        return this.buckets.reduce((acc, { val }, index) => {
          if (index % step === 0) acc.push(val);
          return acc;
        }, /** @type {string[]} */ ([])).concat([this.sliderRange[1].toString()]);
      }
      const [min, max] = this.sliderRange
      const step = (max - min) / marksCount
      if (Number.isNaN(step)) return undefined

      return Array.from({length: marksCount + 1}, (_, i) =>  this.$n(min + i * step))
    },
    /** @returns {number[]} */
    sliderRange() {
      const vals = this.buckets.map(({ val }) => parseInt(val, 10))
      const min = Math.min(...vals)
      const max = Math.max(...vals)

      if (this.range == null) return [min, max]

      return [
        min < this.range[0] ? min : this.range[0],
        max > this.range[1] ? max : this.range[1],
      ]
    }
  },
  methods: {
    handleValueChanged(value) {
      this.$emit('changed', value)
    },
    renderChart() {
      const topMargin = 12
      const { width } = this.$refs.chartContainer.getBoundingClientRect()

      const svg = d3.select(this.$refs.chart)

      svg.attr('width', width)
      svg.attr('height', this.chartHeight)

      const counts = this.buckets.map(({ count }) => count)

      const x = d3.scaleBand()
        .domain(this.buckets.map(({ val }) => val))
        .range([0, width])
        .paddingInner(0.05)

      const y = d3.scaleLinear()
        .domain([Math.min(...counts), Math.max(...counts)])
        .range([0, this.chartHeight - topMargin])

      svg.selectAll('g.bars')
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
        .attr('height', d =>  y(d.count))

      const maxCountBucketIndex = counts.indexOf(Math.max(...counts))

      svg.selectAll('text.maxval')
        .data([this.buckets[maxCountBucketIndex]])
        .join('text')
        .attr('class', 'maxval')
        .attr('transform', bucket => {
          const xOffset = (x(bucket.val) ?? 0) + (x.bandwidth() / 2)
          const yOffset = this.chartHeight - y(bucket.count)
          return `translate(${xOffset}, ${yOffset})`
        })
        .attr('dy', -3)
        .text(bucket => Math.round(bucket.count))

    }
  },
  watch: {
    buckets() {
      this.renderChart()
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
      }
      .maxval {
        font-size: 12px;
        text-anchor: middle;
      }
    }
  }
</style>