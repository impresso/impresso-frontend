<template lang="html">
  <div ref="app" v-bind:id="id" class="app">
  </div>
</template>

<script>
import * as d3 from 'd3';

const uuid = require('uuid');

export default {
  props: {
    period: {
      default: 'day',
    },
  },
  data: () => ({
    app: null, // this holds de svg selection
    width: 433, // width of the svg
    height: 50, // height of the svg
    widthInterval: 1, // width if the dragable block, depends on day/week/month
    heightInterval: 40, // height of the dragable block
    duration: 100, // speed of animation
    widthBlock: 3,
    id: `ne-explorer-${uuid.v4()}`,
  }),
  methods: {
    translatePeriod(duration = 0) {
      this.app.period
        .transition()
        .duration(duration)
        .attr('transform', () => {
          const overlap = this.widthInterval / 2;
          let x = this.app.period.x;

          if (x < (0 + overlap)) {
            x = 0 + overlap;
          }

          if (x > (this.width - overlap)) {
            x = this.width - overlap;
          }

          return `translate(${x}, 0)`;
        });
    },
    setIntervalWidth() {
      const day = this.width / (365 / 2);

      if (this.period === 'day') {
        this.widthInterval = day;
      } else if (this.period === 'week') {
        this.widthInterval = day * 7;
      } else if (this.period === 'month') {
        this.widthInterval = day * 31;
      }

      // this.widthInterval = this.widthInterval < 5 ? 5 : this.widthInterval;

      this.app.period.interval
        .transition()
        .duration(this.duration)
        .attr('width', this.widthInterval)
        .attr('x', -1 * (this.widthInterval / 2))
        .on('start', this.translatePeriod(this.duration));

      this.app.period.blockLeft
        .transition()
        .duration(this.duration)
        .attr('x', (-1 * (this.widthInterval / 2)) - this.widthBlock);

      this.app.period.blockRight
        .transition()
        .duration(this.duration)
        .attr('x', this.widthInterval / 2);
    },
  },
  watch: {
    period() {
      this.setIntervalWidth();
    },
  },
  mounted() {
    this.app = d3.select(this.$refs.app)
      .append('svg')
      .attr('width', '100%')
      .attr('height', `${this.height}px`)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'none');

    this.app.slider = this.app.append('g').classed('slider', 1);
    this.app.period = this.app.append('g').classed('period', 1);
    this.app.center = this.app.append('g').classed('center', 1);
    this.app.arrow = this.app.center.append('g');

    this.app.center.append('rect')
      .attr('x', this.width / 2)
      .attr('y', 0)
      .attr('width', 1)
      .attr('height', this.height)
      .classed('line', 1);

    this.app.arrow.style('transform', `translate(${(this.width / 2) + 0.5}px)`);

    this.app.arrow.append('rect')
      .attr('x', -3)
      .attr('y', -3)
      .attr('width', 6)
      .attr('height', 6)
      .style('transform', 'rotate(45deg)')
      .classed('arrow', 1);

    this.app.slider.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.width)
      .attr('height', this.height)
      .classed('area', 1)
      .call(d3.drag().on('drag', () => {
        this.app.period.x = d3.event.x;
        this.translatePeriod();
      }));

    this.app.period.x = this.width / 2;
    this.translatePeriod();

    this.app.period.interval = this.app.period.append('rect')
      .attr('y', () => (this.height - this.heightInterval) / 2)
      .attr('height', this.heightInterval)
      .classed('interval', 1);

    this.app.period.blockLeft = this.app.period.append('rect')
      .attr('y', () => (this.height - this.heightInterval) / 2)
      .attr('height', this.heightInterval)
      .attr('width', this.widthBlock)
      .classed('block', 1);

    this.app.period.blockRight = this.app.period.append('rect')
      .attr('y', () => (this.height - this.heightInterval) / 2)
      .attr('height', this.heightInterval)
      .attr('width', this.widthBlock)
      .classed('block', 1);

    this.setIntervalWidth();
  },
};
</script>

<style lang="less">
@import "./../../assets/less/style.less";

.app {

    svg {
        .slider {
            .area {
                fill: rgba(0,0,0,0.1);
            }
        }

        .center {
            .line {}
            .arrow {}
        }

        .period {
            pointer-events: none;
            .interval {
                fill: @clr-white;
                stroke-width: 1px;
                stroke: @clr-black;
            }

            .block {
                fill: none;
                stroke-width: 1px;
                stroke: @clr-black;
            }
        }
    }
}
</style>
