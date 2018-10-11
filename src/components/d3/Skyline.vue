<template id="skyline">
<main>
  <svg @mousemove="onMousemove" @mouseenter="onMouseenter" @mouseleave="onMouseleave" :width="width" :height="height" class="skyline">
    <g class="background">
      <g ref="axisX" class="axisX" />
      <g ref="axisXlabels" class="axisXlabels" />
      <line :x1="margin.left" :y1="margin.bottom - padding.bottom" :x2="margin.left" :y2="margin.bottom" class="axes" />
      <line :x1="margin.right" :y1="margin.bottom - padding.bottom" :x2="margin.right" :y2="margin.bottom" class="axes" />
      <line x1="0" :y1="margin.bottom" :x2="width" :y2="margin.bottom" class="axes" />
      <text :x="margin.left" :y="margin.bottom" class="start date" text-anchor="end" dx="-6" dy="-6">{{ dateRangeLabels.start }}</text>
      <text :x="margin.right" :y="margin.bottom" class="end date" dx="6" dy="-6">{{ dateRangeLabels.end }}</text>
    </g>
    <path class="trendline" :d="paths.line" />
    <g v-if='pointer.show' :style='pointer.pointStyle'><circle r="3"></circle></g>
    <!-- d3 brush -->
    <g ref="brush" class="brush" />
  </svg>

  <div ref="tooltip" role="tooltip" :style="pointer.style" :class="pointerClass">
    <div class="arrow" style="left: 0px; "></div>

    <div class="tooltip-inner">
      <div class='d-inline-block px-1 tooltip-inner-wrapper'>
        <div class='border-right d-inline-block px-1 my-1'>{{value.x}}</div>
        <div class='d-inline-block px-1 my-1'>
          <strong>{{value.y}}</strong>
          <span class="small-caps">articles</span>
        </div>
      </div>
    </div>
  </div>

</main>
</template>

<script type="text/javascript">
import * as d3 from 'd3';

export default {
  template: '#skyline',
  props: {
    dateStart: Number,
    dateEnd: Number,
    timeDetail: {
      type: String,
      default: 'year',
    },
    height: {
      type: Number,
      default: 300,
    },
    data: {
      type: Array,
      default: [{
        t: 1950,
        w: 130,
      }, {
        t: 1970,
        w: 180,
      }],
    },
  },
  data() {
    return {
      axisX: null,
      width: 0,
      bisectLeft: null,
      brush: null,
      value: {
        x: null,
        y: null,
      },
      padding: {
        left: 50,
        right: 50,
        top: 15,
        bottom: 25,
      },
      paths: {
        line: '',
      },
      timeParse: null,
      scaled: {
        x: null,
        y: null,
      },
      pointer: {
        pointStyle: '',
        style: '',
        show: false,
      },
      boundsXscaled: {
        min: 0,
        max: 0,
      },
      values: [],
    };
  },
  mounted() {
    this.init();
    window.addEventListener('resize', this.onResize);
    this.onResize();

    this.update();
  },
  computed: {
    margin() {
      return {
        left: this.padding.left,
        right: this.width - this.padding.right,
        top: this.padding.top,
        bottom: this.height - this.padding.bottom,
      };
    },
    boundsX() {
      return {
        min: d3.min(this.values, d => d.t),
        max: d3.max(this.values, d => d.t),
      };
    },
    boundsLabels() {
      return {
        min: this.timeFormat(this.boundsX.min, this.timeDetail),
        max: this.timeFormat(this.boundsX.max, this.timeDetail),
      };
    },
    boundsY() {
      return {
        min: 0,
        max: d3.max(this.values, d => d.w),
      };
    },
    pointerClass() {
      return {
        show: this.pointer.show,
        'tooltip fade bs-tooltip-bottom no': true,
      };
    },
    dateRange() {
      // use min and max values from data if date-start / date-end props are set
      return {
        start: this.dateStart !== undefined ? new Date(String(this.dateStart)) : this.boundsX.min,
        end: this.dateEnd !== undefined ? new Date(String(this.dateEnd)) : this.boundsX.max,
      };
    },

    dateRangeLabels() {
      return {
        start: this.timeFormat(this.dateRange.start, this.timeDetail),
        end: this.timeFormat(this.dateRange.end, this.timeDetail),
      };
    },

    dateValues() {
      return this.data.map(d => ({
        ...d,
        // v: d.t, // keep the original value
        t: this.scaled.timeParse(d.t),
      }));
    },
  },
  methods: {
    init() {
      // console.log('init', this.timeFormat(new Date()));
      this.scaled.x = d3.scaleTime();
      this.scaled.timeParse = d3.timeParse('%Y');
      this.scaled.y = d3.scaleLinear();

      this.axisX = d3.axisBottom();
      // initialize bisector
      this.bisectLeft = d3.bisector(d => d.t).left;

      // initialize brush
      this.brush = d3.brushX();

      d3.select(this.$refs.brush)
        .call(this.brush);
    },
    onResize() {
      if (this.width !== this.$el.offsetWidth) {
        // console.log('res', this.width, this.$el.offsetWidth);
        this.width = this.$el.offsetWidth;

        // update ranges of functions.
        this.scaled.x.range([this.margin.left, this.margin.right]);
        this.scaled.y.range([this.margin.bottom, this.margin.top]);

        // update axis
        this.updateAxis();
      }
    },
    onMousemove({
      offsetX,
    }) {
      if (!this.values.length) {
        return;
      }
      // scaled offsetX, in order to calculate the nearest value in data
      const osx = this.scaled.x.invert(offsetX);

      // get leftmost data index, plus one.
      const idx = this.bisectLeft(this.values, osx, 1);

      // nearest value candidates
      // See 'X-Value Mouseover' https://bl.ocks.org/mbostock/3902569
      const d0 = this.values[idx - 1];
      const d1 = this.values[idx];

      // nearest data row to be written in the tooltip
      let d;

      if (idx < this.values.length) {
        d = osx - d0.t > d1.t - osx ? d1 : d0;
      } else {
        d = d0;
      }

      this.value.x = this.timeFormat(d.t, this.timeDetail);
      this.value.y = d.w;

      const pointX = this.scaled.x(d.t);
      const pointY = this.scaled.y(d.w);

      this.pointer.style = `transform: translateX(${pointX}px)`;
      this.pointer.pointStyle = `transform: translate(${pointX}px, ${pointY}px)`;
    },

    onMouseleave() {
      this.pointer.show = false;
    },

    onMouseenter() {
      this.pointer.show = true;
    },

    timeFormat(value, format = 'short') {
      return this.$d(value, format);
    },

    // update function watches data changes only.
    // Ranges should be updated on resize.
    update() {
      // update scaling, fn have bbenn initialized in init ;)
      this.scaled.x.domain([this.dateRange.start, this.dateRange.end]);
      this.scaled.y.domain([this.boundsY.min, this.boundsY.max]);

      // update axis
      this.updateAxis();

      // draw the trendline
      this.path = d3.line()
        .defined(d => d.w !== null) // identify data gaps
        // .curve(d3.curveStep)
        .x(d => this.scaled.x(d.t))
        .y(d => this.scaled.y(d.w));

      // console.log(this.data);
      this.paths.line = this.path(this.values);
    },

    updateAxis() {
      this.axisX
        .scale(this.scaled.x)
        .ticks(3)
        .tickFormat(d3.timeFormat('%Y'))
        .tickPadding(this.margin.top + 20)
        .tickSize(this.margin.bottom);

      d3.select(this.$refs.axisX)
        .call((g) => {
          g.call(this.axisX);
          g.selectAll('.tick text')
            .attr('dx', 5)
            .attr('dy', -this.height);
        });
    },
  },
  watch: {
    data(values) {
      this.values = values.map(d => ({
        ...d,
        bt: d.t, // original t, for bisect function
        t: this.scaled.timeParse(d.t),
      }));
      this.update();
    },
  },
};
</script>

<style lang="less">
svg.skyline {
    // shape-rendering: crispEdges;
    background: transparent;
    font-size: 0.8em;
    // font: normal 13px source-sans-pro;
    fill: #333;

    cursor: crosshair;
    .trendline {
        stroke: black;
        stroke-width: 1px;
        fill: none;
        stroke-linecap: butt;
    }

    .axes {
        stroke: #ccc;
        stroke-width: 1px;
    }
    g.axisX {}
    g.axisXlabels {
        transform: translate(4px, 2px);
    }
    .dark {
        stroke: #000;
    }
    .pointer {
        stroke: #56ccf2;
    }
    .start {}
    path.domain {
        stroke: transparent;
    }
    .tick {
        line {
            stroke: #ccc;
            stroke-width: 1px;
        }
        text {
            text-anchor: start;
            fill: #333;
            font-family: 'questa-sans';
            font-size: 1.25em;
        }
    }
    text {}
}

.bs-tooltip-bottom {
    pointer-events: none;
    padding-top: 0;
    .arrow {
        top: -0.4em;
        margin-left: -0.5em;
    }

    .v-line{
      position: absolute;
      content: '';
      background: black;
      height: 82px;
      top: -80px;
      width: 1px;
      margin-left: -1px;
      left: 0;
      pointer-events: none;
    }

    .tooltip-inner {
        width: 200px;
        margin-left: -100px;
        background: transparent;
        padding: 0;
        color: #ccc;

        strong{
          color: white;

        }
    }

    .tooltip-inner-wrapper{
      background: black;
    }
}
</style>
