<template lang="html">
  <div>
    <div id="thumbnail-slider"></div>
  </div>
</template>

<script>
const d3 = require('d3');

export default {
  data: () => ({
    app: false,
    tile: false,
    tiles: false,
  }),
  props: {
    height: {
      type: Number,
      default: 200,
    },
    value: {
      required: true,
    },
  },
  mounted() {
    this.app = d3.select('#thumbnail-slider');

    this.tiles = this.app.append('div')
      .classed('tiles', true);

    this.tile = this.tiles.selectAll('div.tile')
      .data(this.value.pages)
      .enter()
      .append('div')
      .classed('tile', true)
      .on('click', (d) => {
        this.selectThumbnail(d.num);
        this.$emit('input', {
          pages: this.value.pages,
          activePage: d.num,
        });
      });

    this.selectThumbnail(this.value.pages[0].num);

    this.tile.append('img')
      .attr('src', d => (`${d.iiif}/full/${this.height},/0/default.jpg`))
      .style('height', `${this.height}px`);
  },
  methods: {
    selectThumbnail(num, center = false) {
      this.tile.classed('selected', d => d.num === num);

      if (center) {
        this.app.node().scrollLeft =
          this.tiles.select('.selected').node().offsetLeft -
          (this.app.node().offsetWidth / 2) - (this.tiles.select('.selected').node().offsetWidth / 2);
      }
    },
  },
  watch: {
    value: {
      handler(val, oldVal) {
        this.selectThumbnail(val.activePage, val.activePage === oldVal.activePage);
      },
      deep: true,
    },
  },
};
</script>

<style lang="less">
#thumbnail-slider {
    border: 1px solid black;
    overflow-x: auto;
    white-space: nowrap;
    .tiles {
        background: white;
        .tile {
            display: inline-block;
            margin: 5px;
            border: 5px solid rgba(0,0,0,0);
            border-radius: 5px;
            &.selected {
                border-color: #ccc;
            }
        }
    }
}
</style>
