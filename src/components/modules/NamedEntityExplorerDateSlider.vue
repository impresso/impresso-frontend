<template lang="html">
  <div ref="app" v-bind:id="id" class="app">
    <div class='center date text-capitalize'><div class='value'></div></div>
    <div class='edge start date text-capitalize'><div class='value'></div></div>
    <div class='edge end date text-capitalize'><div class='value'></div></div>
    <div class='selection start date text-capitalize'><div class='value'></div></div>
    <div class='selection end date text-capitalize'><div class='value'></div></div>
  </div>
</template>

<script>
/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
import * as d3 from 'd3';

const uuid = require('uuid');

export default {
  model: {
    prop: 'issue',
  },
  props: {
    period: {
      default: 'day',
    },
    issue: {
      default: null,
    },
  },
  data: () => ({
    app: null, // this holds de svg selection
    width: 200, // width of the svg. Should be calculated on resize
    height: 150, // height of the svg
    widthInterval: 1, // width if the dragable block, depends on day/week/month
    heightInterval: 40, // height of the dragable block
    duration: 100, // speed of animation
    widthBlock: 6,
    monthOffset: 2,
    sliderOffsetTop: 40,

    id: `ne-explorer-${uuid.v4()}`,
  }),
  methods: {
    translatePeriod(duration = 0) {
      if (!this.halfWidthInterval) {
        return;
      }
      const posx = Math.min(
        Math.max(this.halfWidthInterval, this.svg.period.x), this.width - this.halfWidthInterval);

      console.log('translatePeriod');
      console.log('  - event x:    ', this.svg.period.x);
      console.log('  - posx:       ', posx);
      this.app.selection = [posx - this.halfWidthInterval, posx + this.halfWidthInterval];
      this.app.selectionStartDate = this.app.scaleTime.invert(this.app.selection[0]);
      this.app.selectionEndDate = this.app.scaleTime.invert(this.app.selection[1]);

      console.log('  - left date:  ', this.app.selectionStartDate);
      console.log('  - right date: ', this.app.selectionEndDate);

      this.svg.period
        .transition()
        .duration(duration)
        .attr('transform', `translate(${posx}, 0)`);

      this.updateTimeSelection(duration);
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

      this.halfWidthInterval = this.widthInterval / 2;
      // this.widthInterval = this.widthInterval < 5 ? 5 : this.widthInterval;

      this.svg.period.interval
        .transition()
        .duration(this.duration)
        .attr('width', this.widthInterval)
        .attr('x', -this.halfWidthInterval)
        .on('start', this.translatePeriod(this.duration));

      this.svg.period.blockLeft
        .transition()
        .duration(this.duration)
        .attr('x', (-1 * this.halfWidthInterval) - this.widthBlock);

      this.svg.period.blockRight
        .transition()
        .duration(this.duration)
        .attr('x', this.halfWidthInterval);
    },

    updateTimeBoundaries() {
      if (!this.app.scaleTime) {
        this.app.scaleTime = d3.scaleUtc();
      }
      // scale function
      this.app.scaleTime = this.app.scaleTime
        .domain([this.app.startDate, this.app.endDate])
        .range([0, this.width]);

      // update ticks
      const xAxis = d3.axisBottom(this.app.scaleTime)
        .ticks(d3.utcMonth)
        .tickPadding(0)
        .tickFormat(date => this.timeFormat(date, 'month'));

      this.app.ticks.call((g) => {
        g.call(xAxis);
        g.select('.domain').remove();
        g.selectAll('line').attr('y1', 18).attr('y2', 60);
      });

      this.app.startDateField.html(this.timeFormat(this.app.startDate));
      this.app.endDateField.html(this.timeFormat(this.app.endDate));
      this.app.centerDateField.html(this.timeFormat(this.date));
    },

    updateTimeSelection() {
      if (!this.app.selectionStartDate || !this.app.selectionEndDate) {
        return;
      }
      const startposx = Math.max(100, this.app.selection[0]);
      const startposy = startposx === 100 ? 25 : 0;

      const endposx = Math.min(-100, this.app.selection[1] - this.width);
      const endposy = endposx === -100 ? 25 : 0;

      // this.selectionStartDateField.value
      //   .html(this.timeFormat(this.app.selectionStartDate));
      this.app.selectionStartDateField
        .attr('style', `transform: translate(${startposx}px,${startposy}px)`);

      // this.app.selectionEndDateField.value
      //   .html(this.timeFormat(this.app.selectionEndDate));
      this.app.selectionEndDateField
        .attr('style', `transform: translate(${endposx}px,${endposy}px)`);
    },
    afterResize() {
      this.width = this.$refs.app.parentNode.offsetWidth;
    },
    timeFormat(value, format = 'short') {
      return this.$d(value, format);
    },
    initialize() {
      this.app.startDate = d3.timeMonth.offset(this.issue.date, -this.monthOffset);
      this.app.endDate = d3.timeMonth.offset(this.issue.date, this.monthOffset);
      console.log('initialize', this.date, this.app.startDate, this.app.endDate);

      // updates dates (e.g; whenever the edge dates change)
      this.updateTimeBoundaries();
      this.setIntervalWidth();
      this.translatePeriod();
    },
  },
  watch: {
    period() {
      this.setIntervalWidth();
    },
    issue: {
      handler(val) {
        console.log('HEY I VE GOT THE DATA', val);
        this.initialize();
      },
    },
  },
  mounted() {
    // recalculate initial width based on the container width
    this.afterResize();

    this.app = d3.select(this.$refs.app);
    this.svg = this.app
      .append('svg')
      .attr('width', `${this.width}px`)
      .attr('height', `${this.height}px`);
      // deprecated viewbox, easier to listen to events .attr('width', '100%')
      // .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      // .attr('preserveAspectRatio', 'none');

    // dates below.

    this.app.centerDateField = this.app.select('div.center .value').on('click', () => {
      this.svg.period.x = this.width / 2; // :D
      this.translatePeriod(0);
    });

    this.app.startDateField = this.app.select('div.edge.start .value');
    this.app.endDateField = this.app.select('div.edge.end .value');
    this.app.selectionStartDateField = this.app.select('div.selection.start');

    this.app.selectionStartDateField.call(d3.drag().on('drag', () => {
      // this.svg.period.x = d3.event.x;
      // this.translatePeriod();

    }));
    this.app.selectionStartDateField.value = this.app.selectionStartDateField.select('.value');
    this.app.selectionEndDateField = this.app.select('div.selection.end');
    this.app.selectionEndDateField.value = this.app.selectionEndDateField.select('.value');
    // time ticks
    this.app.ticks = this.svg.append('g')
      .classed('ticks', 1)
      .attr('transform', 'translate(0,40)');


    this.svg.slider = this.svg.append('g')
      .classed('slider', 1)
      .attr('transform', `translate(0, ${this.sliderOffsetTop})`);

    this.svg.period = this.svg.append('g').classed('period', 1);
    this.svg.center = this.svg.append('g').classed('center', 1);


    this.svg.arrow = this.svg.center.append('g');

    this.svg.center.append('rect')
      .attr('x', this.width / 2)
      .attr('y', 0)
      .attr('width', 1)
      .attr('height', 100)
      .classed('line', 1);

    this.svg.arrow.style('transform', `translate(${(this.width / 2) + 0.5}px)`);

    this.svg.arrow.append('rect')
      .attr('x', -3)
      .attr('y', -3)
      .attr('width', 6)
      .attr('height', 6)
      .style('transform', 'rotate(45deg)')
      .classed('arrow', 1);

    this.svg.slider.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.width)
      .attr('height', 60)
      .classed('area', 1)
      .call(d3.drag().on('drag', () => {
        this.svg.period.x = d3.event.x;
        this.translatePeriod();
      }));

    this.svg.period.x = this.width / 2;

    this.svg.period.interval = this.svg.period.append('rect')
      .attr('y', 60)
      // .attr('y', () => (this.height - this.heightInterval) / 2)
      .attr('height', this.heightInterval)
      .classed('interval', 1);

    this.svg.period.blockLeft = this.svg.period.append('rect')
      .attr('y', 60)
      .attr('height', this.heightInterval)
      .attr('width', this.widthBlock)
      .classed('block', 1);

    this.svg.period.blockRight = this.svg.period.append('rect')
      .attr('y', 60)
      .attr('height', this.heightInterval)
      .attr('width', this.widthBlock)
      .classed('block', 1);
  },
};
</script>

<style lang="less">
@import "./../../assets/less/style.less";

.app {
    position: relative;
    font-size: 11px;

    .center {
        position: absolute;
        width: 100px;
        left: 50%;
        margin-left: -50px;
        text-align: center;

        .value{
          display: inline-block;
          background: white;
          line-height: 18px;
          padding: 0 5px;
          white-space: nowrap;
        }
    }
    .edge, .selection {
        position: absolute;

        &.start {
            border-left: 1px solid @clr-grey-400;

            .value {
                left:0;
            }
        }

        &.end {
            right: 0;
            border-right: 1px solid @clr-grey-400;

            .value {
                right: 0;
            }
        }

        .value {
            position: absolute;
            color: @clr-grey-600;
            line-height: 18px;
            padding: 0 5px;
            white-space: nowrap;

            > span {
                color: @clr-grey-400;
            }
        }
    }

    .edge {
        top: 0;
        height: 100px; // till the bottom of the svg slider
    }

    .selection {
        position: absolute;
        top: 100px; // at the bottom of the svg slider

        .value {
          border: 1px solid;
        }

        &.start {
           .value {
              left:auto;
              right:0;
           }
        }

        &.end {
           .value {
              left:0;
              right:auto;
           }
        }
    }

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
                fill: @impresso-yellow;
                stroke-width: 1px;
                stroke: @impresso-yellow;
            }

            .block {
                fill: none;
                stroke-width: 1px;
                stroke: @clr-black;
            }

            line{
              stroke: black;
            }
        }

        .tick {
          text {
            font-family: OpenSans, "helvetica neue", Arial, sans-serif;
            fill: @clr-grey-600;
            text-anchor: start;
          }
          line{
            stroke: @clr-grey-400;
          }
        }
    }
}
</style>
