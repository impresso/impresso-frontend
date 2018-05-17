<template lang="html">
<div ref="app" class="issue-viewer-zoom-slider"></div>
</template>

<script>
import * as d3 from 'd3';

export default {
  model: {
    prop: 'position',
  },
  props: {
    position: {
      default: 0, // location of the slider from 0 to 1
    },
  },
  data: () => ({
    app: null, // this holds de svg selection
    width: 50, // width of the svg
    height: 200, // height of the svg
    dot_radius: 8,
    stroke_width: 2,
  }),
  methods: {
    moveSlider(location) {
      const y = location * this.getLength();

      this.app.slider
        .style('transform', `translate(0, ${y}px)`);
    },
    getDotSize() {
      return this.dot_radius + this.stroke_width;
    },
    getLength() {
      return this.height - (this.getDotSize() * 2);
    },
    setPosition(position) {
      position = Math.max(0, position);
      position = Math.min(1, position);

      this.$emit('input', position.toFixed(2));
    },
  },
  mounted() {
    const dotSize = this.getDotSize();
    const length = this.getLength();

    this.app = d3.select(this.$refs.app)
      .append('svg')
      .attr('width', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'none');

    this.app.indicator = this.app.append('g').classed('indicator', 1);
    this.app.slider = this.app.append('g').classed('slider', 1);

    this.moveSlider(this.position, false);

    this.app.indicator.append('rect')
      .attr('x', this.width / 2)
      .attr('y', dotSize)
      .attr('width', 1)
      .attr('height', length)
      .classed('line', 1);

    this.app.indicator.append('rect')
      .attr('x', 0)
      .attr('y', dotSize)
      .attr('width', this.width)
      .attr('height', length)
      .classed('area', 1)
      .on('click', () => {
        const num = (d3.event.offsetY - this.getDotSize()) / this.getLength();
        this.setPosition(num);
      })
      .call(d3.drag().on('drag', () => {
        const num = (d3.event.y - this.getDotSize()) / this.getLength();
        this.setPosition(num);
      }));

    this.app.slider.append('circle')
      .attr('cx', this.width / 2)
      .attr('cy', dotSize)
      .attr('r', this.dot_radius)
      .style('stroke-width', this.stroke_width)
      .classed('dot', 1);

    this.app.slider.append('circle')
      .attr('cx', this.width / 2)
      .attr('cy', dotSize)
      .attr('r', this.dot_radius / 2.5)
      .style('stroke-width', this.stroke_width)
      .classed('inner', 1);
  },
  watch: {
    position: {
      handler(val) {
        this.moveSlider(val, true);
      },
    },
  },
};
</script>

<style lang="less">
@import "./../../assets/less/style.less";

.issue-viewer-zoom-slider {
    .indicator {
        .line {
            fill: @clr-grey-800;
        }

        .area {
            opacity: 0;
        }
    }

    .slider {
        pointer-events: none;
        .dot {
            stroke: @clr-grey-800;
            fill: @clr-yellow;
        }

        .inner {
            fill: @clr-grey-800;
        }
    }
}
</style>
