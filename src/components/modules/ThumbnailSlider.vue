<template lang="html">
    <div id="thumbnail-slider"></div>
</template>

<script>
const d3 = require('d3');

export default {
  data: () => ({
    app: false,
    tile: false,
    tiles: false,
    lastValue: 1,
    center: true,
  }),
  props: {
    height: {
      type: Number,
      default: 200,
    },
    pages: {
      required: true,
    },
    value: {
      type: Number,
      default: 1,
    },
  },
  mounted() {
    this.app = d3.select('#thumbnail-slider');

    this.tiles = this.app.append('div')
      .classed('tiles', true);
  },
  methods: {
    selectThumbnail(num) {
      this.tile.classed('selected', d => d.num === num);

      if (this.center && this.tiles.select('.selected').nodes().length > 0) {
        this.app.node().scrollLeft =
          (this.tiles.select('.selected').node().offsetLeft +
          (this.tiles.select('.selected').node().getBoundingClientRect().width / 2))
          - (this.app.node().getBoundingClientRect().width / 2);
      }

      this.center = true;
    },
    drawPages() {
      this.tile = this.tiles.selectAll('div.tile')
        .data(this.pages)
        .enter()
        .append('div')
        .classed('tile', true)
        .classed('selected', (d, i) => i === 0)
        .on('click', (d) => {
          this.center = false; // dont want to center the thumb on manual press
          this.$emit('input', d.num);
        });

      this.selectThumbnail(this.value, true);

      this.tile.append('img')
        .attr('src', d => (`${d.iiif}/full/${this.height - 50},/0/default.jpg`))
        .style('height', `${this.height - 50}px`);
    },
  },
  watch: {
    pages: {
      handler() {
        this.drawPages();
      },
    },
    value: {
      handler(val) {
        this.selectThumbnail(val);
      },
    },
  },
};
</script>

<style lang="less">
#thumbnail-slider {
    border: 1px solid black;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    position: absolute;
    width: 100%;
    height: 100%;
    background: #eee;
    .tiles {
        padding: 10px;
        .tile {
            display: inline-block;
            margin: 5px;
            border: 5px solid rgba(0,0,0,0);
            border-radius: 5px;
            &.selected {
                border-color: #ccc;
            }
            &:last-child {
                margin-right: 10px;
            }
        }
    }
}
</style>
