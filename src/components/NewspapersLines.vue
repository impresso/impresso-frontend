<template lang="html">
  <div v-on:mousemove="onMousemove" v-on:mouseout="onMouseout" ref="lines" class="lines small">
    <tooltip v-bind:tooltip="tooltip">

      <div v-if="tooltip.item">
        <h1>{{tooltip.item.name}}</h1>
        <p>
          <span v-if="tooltip.item.startYear != tooltip.item.endYear">
            {{tooltip.item.startYear}} - {{tooltip.item.endYear}}
          </span>
          <span v-else>
            {{tooltip.item.startYear}}
          </span>
           &mdash;
          <span>{{tooltipProperties}}</span>
        </p>
      </div>
    </tooltip>
    <div class='cursor' :style="{
      transform: `translate(${point.x}px, 0)`,
      opacity: tooltip.isActive ? 1 : 0,
    }"></div>
    <!-- <div class="point" :style="{
      transform: `translate(${point.x}px, ${point.y}px)`,
    }"></div> -->
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
      <div class="more" v-if="newspaper.isSelected">...</div>
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
      isActive: false,
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
    onMousemove({ clientX, clientY }) {
      const x = clientX - this.$refs.lines.offsetLeft;
      const y = clientY - this.$refs.lines.offsetTop;
      this.tooltip.x = x;
      this.tooltip.y = y - 40;
      this.point = {
        x,
        y,
      };
      this.$emit('highlight', {
        mouse: {
          x,
          y,
        },
        datum: {
          t: parseInt(this.scale.invert(x), 10),
        },
      });
    },
    onMouseout() {
      this.tooltip.isActive = false;
    },
    onClick(newspaper) {
      console.log('@click', newspaper);
      // newspaper.isSelected = !newspaper.isSelected;
      // force the instance to be re-rendered
      // this.$forceUpdate();
      this.$router.push({
        name: 'newspaper_metadata',
        params: {
          newspaper_uid: newspaper.uid,
        },
      });
    },
    onMouseover(newspaper, event) {
      // console.log('@mouseover', event);
      this.point.y = event.target.offsetTop;
      this.tooltip.item = newspaper;
      this.tooltip.isActive = true;
      event.stopPropagation();
    },
    onResize() {
      this.width = this.$refs.lines.clientWidth;
      this.tooltip.hspace = this.width;
    },
    getNearestValue(v) {
      const idx = d3.bisectLeft(this.values, v);

      if (idx === 0) {
        return {
          index: 0,
          nearest: this.values[0],
        };
      }

      const d0 = this.values[idx - 1];
      const d1 = this.values[idx];

      if (Math.abs(v - d0) > Math.abs(v - d1)) {
        return {
          index: idx,
          nearest: d1,
        };
      }
      return {
        index: idx - 1,
        nearest: d0,
      };
    },
    // onMousemove(evt) {
    //   console.log('mousemove babe', evt);
    // },
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  computed: {
    tooltipProperties() {
      if (!this.tooltip.item || !this.tooltip.item.properties) {
        return '';
      }
      const place = {};
      this.tooltip.item.properties.forEach((d) => {
        if (d.name === 'countryCode') {
          place.country = this.$t(`countryCode.${d.value}`);
        } else if (d.name === 'provinceCode') {
          place.province = this.$t(`provinceCode.${d.value}`);
        }
      });
      if (!place.province && !place.country) {
        return '';
      }
      return [place.province, place.country].filter(d => !!d).join(', ');
    },
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
    height: 15px;

    &::after{
      content: "";
      position: absolute;
      height: 1px;
      background-color: #ededed;
      top: 5px;
      left:0;
      right: 0;
    }
    &.selected {
      height: 4rem;
    }

    &:hover {
      &::after{
        background-color: #a0a0a0;
      }
    }

    &:hover .line, &.selected .line {
      background-color: $clr-primary;
    }

    &:hover .label-start, &.selected .label-start,
    &:hover .label-end, &.selected .label-end {
      color: $clr-primary;
    }
  }

  .line{
    position: absolute;
    z-index: 1;
    top: 3px;
    height: 6px;
    border-radius: 6px;
    background-color: #a0a0a0;
  }

  .line > .label-start,
  .line > .label-end{
    padding: 0 .25rem;
    position: absolute;
    top: -0.5rem;
    height: 1.25rem;
    line-height: 1.25rem;
    background-color: #f8f9fa;
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
<i18n>
  {
    "en": {
      "provinceCode": {
        "AG": "Canton of Aargau",
        "AR": "Canton of Appenzell Ausserrhoden",
        "AI": "Canton of Appenzell Innerrhoden",
        "BL": "Canton of Basel-Landschaft",
        "BS": "Canton of Basel-Stadt",
        "BE": "Canton of Bern",
        "FR":	"Canton of Fribourg",
        "GE": "Canton of Geneva",
        "GL": "Canton of Glarus",
        "GR":	"Canton of Grisons",
        "JU":	"Canton of Jura",
        "LU": "Canton of Luzern",
        "NE":	"Canton of Neuchâtel",
        "OW": "Canton of Obwalden",
        "NW": "Canton of Nidwalden",
        "SH":	"Canton of Schaffhausen",
        "SZ": "Canton of Schwytz",
        "SO": "Canton of Solothurn",
        "SG": "Canton of St. Gallen",
        "TG": "Canton of Thurgau",
        "TI": "Canton of Ticino",
        "UR": "Canton of Uri",
        "VS": "Canton of Valais",
        "VD": "Canton of Vaud",
        "ZG": "Canton of Zug",
        "ZH": "Canton of Zürich"
      },
      "countryCode": {
        "CH": "Switzerland"
      }
    }
  }
</i18n>
