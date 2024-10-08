<template lang="html">
  <div ref="app" v-bind:id="id" class="app">
    <div class='center date text-capitalize'><div class='value'></div></div>
    <div class='selection start date text-capitalize'><div class='value'></div></div>
    <div class='selection end date text-capitalize'><div class='value'></div></div>
  </div>
</template>

<script>
/**
 * @deprecated Not used anywhere
 */

/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
import * as d3 from 'd3';

const uuid = require('uuid');

export default {
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
    height: 110, // height of the svg
    widthInterval: 1, // width if the dragable block, depends on day/week/month
    heightInterval: 40, // height of the dragable block
    duration: 100, // speed of animation
    widthBlock: 6,
    monthOffset: 2,
    sliderOffsetTop: 23,
    dateFieldWidth: 85,
    id: `ne-explorer-${uuid.v4()}`,
  }),
  methods: {
    translatePeriod(duration = 0) {
      if (!this.halfWidthInterval) {
        return;
      }
      const posx = Math.min(
        Math.max(this.halfWidthInterval, this.svg.period.x), this.width - this.halfWidthInterval);

      // console.info('translatePeriod');
      // console.info('  - event x:    ', this.svg.period.x);
      // console.info('  - posx:       ', posx);
      this.app.selection = [posx - this.halfWidthInterval, posx + this.halfWidthInterval];
      this.app.selectionStartDate = this.app.scaleTime.invert(this.app.selection[0]);
      this.app.selectionEndDate = this.app.scaleTime.invert(this.app.selection[1]);

      // console.info('  - left date:  ', this.app.selectionStartDate);
      // console.info('  - right date: ', this.app.selectionEndDate);

      this.svg.period
        .transition()
        .duration(duration)
        .attr('transform', `translate(${posx}, 0)`);

      this.updateTimeSelection(duration);
    },
    setIntervalWidth() {
      const day = this.app.oneDayInPx;

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
      // update day in Px
      this.app.oneDayInPx = Math.abs(this.app.scaleTime(this.app.date) -
        this.app.scaleTime(d3.utcDay.offset(this.app.date, 1)));
      // console.info('updateTimeBoundaries', this.app.oneDayInPx);

      // update date field
      this.app.dateField.html(this.timeFormat(this.app.date));
    },

    updateTimeSelection() {
      if (!this.app.selectionStartDate || !this.app.selectionEndDate) {
        return;
      }
      const startposx = Math.min(
        Math.max(this.dateFieldWidth, this.app.selection[0]),
        this.width - this.dateFieldWidth);
      // const startposy = startposx === this.dateFieldWidth ? 25 : 0;

      const endposx = Math.min(
        Math.max(
          this.dateFieldWidth - this.width,
          this.app.selection[1] - this.width),
        -this.dateFieldWidth);
      // const endposy = endposx === -100 ? 25 : 0;
      // console.info('updateTimeSelection > startposx', startposx);
      this.app.selectionStartDateFieldValue
        .html(this.timeFormat(this.app.selectionStartDate));
      this.app.selectionStartDateField
        .attr('style', `transform: translate(${startposx}px,0)`);

      this.app.selectionEndDateFieldValue
        .html(this.timeFormat(this.app.selectionEndDate));
      this.app.selectionEndDateField
        .attr('style', `transform: translate(${endposx}px,0)`);
    },
    afterResize() {
      this.width = this.$refs.app.parentNode.offsetWidth;
    },
    timeFormat(value, format = 'short') {
      return this.$d(value, format);
    },
    initialize() {
      if (this.app.isReady) {
        return;
      }
      this.app.isReady = true;
      this.app.date = new Date(this.issue.date);

      this.app.startDate = d3.timeMonth.offset(this.app.date, -this.monthOffset);
      this.app.endDate = d3.timeMonth.offset(this.app.date, this.monthOffset);
      // updates dates (e.g; whenever the edge dates change)
      // console.info(
      //  'initialize',
      //  this.issue.date, this.app.date, this.app.startDate, this.app.endDate
      // );

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
      handler() {
        // console.info('VALUE', val);
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

    // initialize date fields
    this.app.dateField = this.app.select('div.center .value').on('click', () => {
      this.svg.period.x = this.width / 2; // :D
      this.translatePeriod(0);
    });

    this.app.selectionStartDateField = this.app.select('div.selection.start').call(d3.drag().on('drag', () => {
      // this.svg.period.x = d3.event.x;
      // this.translatePeriod();

    }));
    this.app.selectionStartDateFieldValue = this.app.selectionStartDateField.select('.value');

    this.app.selectionEndDateField = this.app.select('div.selection.end');
    this.app.selectionEndDateFieldValue = this.app.selectionEndDateField.select('.value');
    // time ticks
    this.app.ticks = this.svg.append('g')
      .classed('ticks', 1)
      .attr('transform', `translate(0,${this.sliderOffsetTop})`);


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
      .attr('height', 83)
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
      .attr('y', this.sliderOffsetTop + 20)
      // .attr('y', () => (this.height - this.heightInterval) / 2)
      .attr('height', this.heightInterval)
      .classed('interval', 1);

    this.svg.period.blockLeft = this.svg.period.append('rect')
      .attr('y', this.sliderOffsetTop + 20)
      .attr('height', this.heightInterval)
      .attr('width', this.widthBlock)
      .classed('block', 1);

    this.svg.period.blockRight = this.svg.period.append('rect')
      .attr('y', this.sliderOffsetTop + 20)
      .attr('height', this.heightInterval)
      .attr('width', this.widthBlock)
      .classed('block', 1);
  },
};
</script>

<style lang="less">

.app {
    position: relative;
    font-size: 11px;

    .center {
        position: absolute;
        width: 100px;
        left: 50%;
        margin-left: -50px;
        text-align: center;

        .value {
            display: inline-block;
            background: white;
            line-height: 18px;
            padding: 0 5px;
            white-space: nowrap;
        }
    }
    .edge,
    .selection {
        position: absolute;

        &.start {
            border-left: 1px solid #BDBDBD;

            .value {
                left: 0;
            }
        }

        &.end {
            right: 0;
            border-right: 1px solid #BDBDBD;

            .value {
                right: 0;
            }
        }

        .value {
            position: absolute;
            color: #757575;
            line-height: 18px;
            padding: 0 5px;
            white-space: nowrap;

            > span {
                color: #BDBDBD;
            }
        }
    }

    .edge {
        top: 0;
        height: 100px; // till the bottom of the svg slider
    }

    .selection {
        position: absolute;
        top: 83px; // at the bottom of the svg slider

        &.start {
            .value {
                left: auto;
                border: 1px solid;
                right: 0;
            }
        }

        &.end {
            .value {
                border: 1px solid;
                left: 0;
                right: auto;
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
                fill: #ffeb78;
                stroke-width: 1px;
                stroke: #ffeb78;
            }

            .block {
                fill: none;
                stroke-width: 1px;
                stroke: #000000;
            }

            line {
                stroke: black;
            }
        }

        .tick {
            text {
                fill: #757575;
                text-anchor: start;
            }
            line {
                stroke: #BDBDBD;
            }
        }
    }
}
</style>
