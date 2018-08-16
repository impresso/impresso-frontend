<template id="skyline">
<main>
  <svg @mousemove="onMousemove" @mouseleave="onMouseleave" :width="width" :height="height" class="skyline">
    <g class="background">
      <g ref="axisX" class="axisX" />
      <g ref="axisXlabels" class="axisXlabels" />
      <!-- <g v-axis:x="scale"></g> -->
      <line :x1="margin.left" :y1="margin.bottom - padding.bottom" :x2="margin.left" :y2="margin.bottom" class="axes" />
      <line :x1="margin.right" :y1="margin.bottom - padding.bottom" :x2="margin.right" :y2="margin.bottom" class="axes" />
      <line x1="0" :y1="margin.bottom" :x2="width" :y2="margin.bottom" class="axes" />
      <text :x="margin.left" :y="margin.bottom" class="start date" text-anchor="end" dx="-6" dy="-6">{{ dateRange.start }}</text>
      <text :x="margin.right" :y="margin.bottom" class="end date" dx="6" dy="-6">{{ dateRange.end }}</text>
      <g class="boundsX">
        <line :x1="boundsXscaled.min - 2" :y1="0" :x2="boundsXscaled.min -2" :y2="height" class="axes dark" />
        <line :x1="boundsXscaled.max + 2" :y1="0" :x2="boundsXscaled.max + 2" :y2="height" class="axes dark" />
        <text :x="boundsXscaled.min" :y="height" class="start date" text-anchor="end" dx="-6" dy="-8">{{ boundsX.min }}</text>
        <text :x="boundsXscaled.max" :y="height" class="end date" dx="6" dy="-8">{{ boundsX.max }}</text>
      </g>

    </g>
    <path class="trendline" :d="paths.line" />
    <line :x1="mouse.x" y1="0" :x2="mouse.x" :y2="height" class="pointer" />
  </svg>

  <div ref="tooltipb" class="tooltip fade bs-tooltip-bottom" role="tooltip">
    <div class="arrow " style="left: 0px; "></div>
    <div class="tooltip-inner ">{{value.x}}<br /><strong class="small-caps">{{value.y}}</strong></div>
  </div>

  <div ref="tooltipt" class="tooltip fade bs-tooltip-top" role="tooltip">
    <div class="arrow " style="left: 0px; "></div>
    <div class="tooltip-inner ">{{value.x}}<br /><strong>{{value.y}}</strong></div>
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
    height: {
      type: Number,
      default: 300,
    },
    data: Array,
  },
  data() {
    return {
      width: 0,
      value: {
        x: null,
        y: null,
      },
      mouse: {
        x: 0,
      },
      padding: {
        left: 50,
        right: 50,
        top: 20,
        bottom: 25,
      },
      paths: {
        line: '',
      },
      scaled: {
        x: null,
        y: null,
      },
      boundsXscaled: {
        min: 0,
        max: 0,
      },
      // dateRange: {
      //   start: 1222,
      //   end: 1999,
      // },
    };
  },
  mounted() {
    console.clear();
    this.onResize();
    this.init();
    window.addEventListener('resize', this.onResize);
    // this.update();
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
        min: d3.min(this.data, d => d.t),
        max: d3.max(this.data, d => d.t),
      };
    },
    boundsY() {
      return {
        min: d3.min(this.data, d => d.w),
        max: d3.max(this.data, d => d.w),
      };
    },
    // boundsXscaled() {
    //   return {
    //     min: this.scaled.x(this.boundsX.min),
    //     max: this.scaled.x(this.boundsX.max),
    //   };
    // },
    dateRange() {
      // use min and max values from data if date-start / date-end props are set
      return {
        start: this.dateStart !== undefined ? this.dateStart : this.boundsX.min,
        end: this.dateEnd !== undefined ? this.dateEnd : this.boundsX.max,
      };
    },
  },
  // directives: {
  //   axis(el, binding) {
  //     const axis = binding.arg;
  //     const axisMethod = {
  //       x: 'axisBottom',
  //       y: 'axisLeft',
  //     }[axis];
  //     const methodArg = binding.value[axis];
  //
  //     d3.select(el).call(d3[axisMethod](methodArg));
  //   },
  // },
  methods: {
    init() {
      // console.log('init', this.timeFormat(new Date()));


    },
    onResize() {
      if (this.width !== this.$el.offsetWidth) {
        // console.log('res', this.width, this.$el.offsetWidth);
        this.width = this.$el.offsetWidth;
        this.update();
      }
    },

    onMousemove({
      offsetX,
    }) {
      const x = this.scaled.x.invert(offsetX);
      this.value.x = Math.floor(x);

      const bisect = d3.bisector(d => d.t).left;
      const idx = bisect(this.data, this.value.x);
      console.log(x, idx, this.data[idx]);

      d3.select(this.$refs.tooltipb)
        .attr('style', `transform: translateX(${offsetX}px)`)
        .classed('show', true);

      // const bisect = d3.bisector(d => d.t).left;
      // const n = bisect(this.data, this.value.x) - 1;
      //
      // if (n >= 0 && n < this.data.length - 1) {
      //   this.value.y = this.data[n].w;
      //   d3.select(this.$refs.tooltipb)
      //     .attr('style', `left: ${offsetX}px`)
      //     .classed('show', true);
      // } else {
      //   d3.select(this.$refs.tooltipb)
      //     .classed('show', false);
      // }
    },

    onMouseleave() {
      d3.select(this.$refs.tooltipb)
        .classed('show', false);
    },

    timeFormat(value, format = 'short') {
      return this.$d(value, format);
    },

    update() {
      // update scaling
      this.scaled.x = d3.scaleLinear()
        .domain([this.dateRange.start, this.dateRange.end])
        .range([this.margin.left, this.margin.right]);

      this.scaled.y = d3.scaleLinear()
        .domain([this.boundsY.min, this.boundsY.max])
        .range([this.margin.bottom, this.margin.top]);

      this.boundsXscaled.min = this.scaled.x(this.boundsX.min);
      this.boundsXscaled.max = this.scaled.x(this.boundsX.max);

      const ticks = Math.round(this.width / 200);
      // draw x-axis
      d3.select(this.$refs.axisX)
        .call(d3
          .axisBottom(this.scaled.x)
          .ticks(ticks)
          .tickPadding(this.margin.top)
          .tickSize(this.margin.bottom)
          .tickFormat(''),
        );
      // draw x-axis labels
      d3.select(this.$refs.axisXlabels)
        .call(d3
          .axisBottom(this.scaled.x)
          .ticks(ticks)
          .tickSize(0)
          .tickFormat(d3.format('d')),
        );

      // draw the trendline
      this.path = d3.line()
        .defined(d => d.w !== null) // identify data gaps
        // .curve(d3.curveStep)
        .x(d => this.scaled.x(d.t))
        .y(d => this.scaled.y(d.w));

      // console.log(this.data);
      this.paths.line = this.path(this.data);
    },
  },
  watch: {
    data(value) {
      this.data = value;
      console.log('@update', this.data);
      this.update();
    },
  },
};
</script>

<style lang="less">
svg.skyline {
    shape-rendering: crispEdges;
    background: #eee;
    font: normal 13px source-sans-pro;
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
            fill: #ccc;
            font: normal 13px source-sans-pro;
        }
    }
    text {}
}

.bs-tooltip-bottom {
    padding-top: 0;
    .arrow {
        top: -0.4em;
        margin-left: -0.5em;
    }
    .tooltip-inner {
        width: 50px;
        margin-left: -25px;
    }
}
</style>
