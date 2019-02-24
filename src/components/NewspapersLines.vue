<template lang="html">
  <div v-on:mousemove="onMousemove" ref="lines" class="lines small">
    <tooltip v-bind:tooltip="tooltip">

      <div v-if="tooltip.item">
        <h1>{{tooltip.item.name}}</h1>

        <p v-if="tooltip.item.startYear != tooltip.item.endYear">
          {{tooltip.item.startYear}} - {{tooltip.item.endYear}}
        </p>
        <p v-else>
          {{tooltip.item.startYear}}
        </p>
      </div>
    </tooltip>
    <div class='cursor' :style="{
      transform: `translate(${point.x}px, 0)`,
    }"></div>
    <div class="point" :style="{
      transform: `translate(${point.x}px, ${point.y}px)`,
    }"></div>
    <div v-for="newspaper in newspapers" :key="newspaper.uid" class="n"
      v-on:click="onClick(newspaper)"
      v-on:mouseover="onMouseover(newspaper, $event)"
      :class="{ selected: newspaper.isSelected }"
    >
      <div class="line" :style="{
          left: `${scale(newspaper.startYear)}px`,
          right: `${(width - scale(newspaper.endYear))}px`}">
          <div class="label-start">{{newspaper.startYear}}</div>
          <div v-if="newspaper.startYear != newspaper.endYear" class="label-end">
            {{ newspaper.endYear}}
          </div>
      </div>
      <div class="more" v-if="newspaper.isSelected">oh my it is selected!</div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import Tooltip from './modules/tooltips/Tooltip';

export default {
  model: {
    prop: 'newspapers',
    default: [],
  },
  data: () => ({
    tooltip: {
      x: 0,
      y: 0,
      isActive: true,
      item: {},
    },
    point: {
      x: 0,
      y: 0,
    },
    width: 0,
  }),
  props: ['newspapers'],
  methods: {
    onMousemove({ clientX, clientY, screenY, localY }) {
      const x = clientX - this.$refs.lines.offsetLeft;
      const y = clientY - this.$refs.lines.offsetTop;
      // const year = this.getNearestValue(parseInt(this.scale.invert(x), 10));
      //
      // console.log('toyear:', x, this.scale.invert(x), year);
      this.tooltip.x = x;
      this.tooltip.y = y - 60;
      console.log(screenY, y, localY);

      this.point = {
        x,
        y,
      };
    },
    onClick(newspaper) {
      console.log('@click', newspaper);
      newspaper.isSelected = !newspaper.isSelected;
      // force the instance to be re-rendered
      this.$forceUpdate();
    },
    onMouseover(newspaper, event) {
      console.log('@mouseover', event);
      this.point.y = event.target.offsetTop;
      this.tooltip.item = newspaper;
      event.stopPropagation();
    },
    onResize() {
      console.log('resized');
      this.width = this.$refs.lines.clientWidth;
      this.tooltip.hspace = this.width;
    },
    getNearestValue(year) {
      const idx = d3.bisectLeft(this.values, year);

      const d0 = this.values[idx - 1];
      const d1 = this.values[idx];

      return Math.abs(year - d0) > Math.abs(year - d1) ? d1 : d0;
    },
    // onMousemove(evt) {
    //   console.log('mousemove babe', evt);
    // },
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  },
  computed: {
    values() {
      return Object.keys(this.newspapers.reduce((obj, d) => {
        obj[d.startYear] = true;
        obj[d.endYear] = true;
        return obj;
      }, {}))
      .filter(d => !isNaN(d))
      .map(d => parseInt(d, 10))
      .sort();
    },
    scale() {
      return d3.scaleLinear()
        .range([0, this.width])
        .domain([
          d3.min(this.newspapers, d => d.startYear),
          d3.max(this.newspapers, d => d.endYear),
        ]);
    },


  },
  components: {
    Tooltip,
  },
};
</script>

<style scoped lang="scss">
  @import "impresso-theme/src/scss/variables.sass";

  $labelsize: 2.5rem;

  .lines{
    position: relative;
  }

  .cursor {
    position: absolute;
    height: 100%;
    width: 1px;
    background: $clr-accent-secondary;
    pointer-events: none;
    z-index: 2;
  }

  .point {
    position: absolute;
    height: .5rem;
    width: .5rem;
    margin-left: -.25rem;
    background: $clr-accent-secondary;
    border-radius: .25rem;
  }

  .n{
    position: relative;
    height: 1rem;
    border-bottom: 1px solid #eee;
    margin-top: 1px;
    margin-bottom: 1px;


    &.selected {
      height: 4rem;
    }

    &.selected .line {
      background-color: $clr-primary;
      border: 1px solid $clr-primary;
    }

    &.selected .label-start,
    &.selected .label-end {
      color: $clr-primary;
    }
  }

  .line{
    position: absolute;
    z-index: 1;
    top: 0.5rem;
    height: 2px;
    border: 2px solid;
    background-color: #a0a0a0;
  }

  .line > .label-start,
  .line > .label-end{
    padding: 0 .25rem;
    position: absolute;
    top: -0.5rem;
    height: 1rem;
    line-height: 0.9rem;
  }

  .line > .label-start {
    color: #a0a0a0;
    left: -$labelsize;
    width: $labelsize;
    text-align: right;
  }

  .line > .label-end {
    color: #a0a0a0;
    position: absolute;
    right: -$labelsize;
    width: $labelsize;
    text-align: left;
  }

  .more{
    position: absolute;
    top: 1rem;
    bottom: 0;
    left: 0;
    right: 0;

  }
</style>
