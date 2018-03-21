<template lang="html">
  <div>
    <div id="thumbnail-slider"></div>
    <br>
    <pre>{{this.value}}</pre>
  </div>
</template>

<script>
const d3 = require('d3');

export default {
  data: () => ({
    app: false,
  }),
  props: {
    height: {
      type: Number,
      default: 200,
    },
    tile_width: {
      type: Number,
      default: 120,
    },
    margin: {
      type: Number,
      default: 20,
    },
    spacing: {
      type: Number,
      default: 20,
    },
    value: {
      required: true,
    },
  },
  mounted() {
    this.app = d3.select('#thumbnail-slider')
      .append('svg')
      .attr('width', '100%')
      .attr('height', `${this.height}px`);

    this.app.on('mousemove', this.handleMouseMove);

    const tiles = this.app.append('g').classed('tiles', true);

    const tile = tiles.selectAll('g.tile')
      .data(this.value.pages)
      .enter()
      .append('g')
      .classed('tile', true);

    tile.append('svg:image')
      .attr('xlink:href', d => (`${d.iiif}/full/120,/0/default.jpg`))
      .attr('transform', (d, i) =>
    `translate(${((120 + this.spacing) * i) + this.margin}, ${this.margin})`);
  },
  methods: {
    handleMouseMove: (e, i, l) => {
      console.log(d3.mouse(l[0]));
    },
  },
};
</script>

<style lang="less">
#thumbnail-slider {
    border: 1px solid black;
}
</style>
