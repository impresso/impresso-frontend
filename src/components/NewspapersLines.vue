<template lang="html">
  <div v-on:mousemove="onMousemove" v-on:mouseout="onMouseout" ref="lines" class="lines small">
    <tooltip v-bind:tooltip="tooltip">
      <div v-if="tooltip.item">
        <h1>{{tooltip.item.name}}</h1>
        <p>
          <span class="available" v-if="tooltip.item.included" v-html="$t('dates.includedLifespan', {
            from: $d(getIssueDate(tooltip.item.firstIssue), 'short'),
            to: $d(getIssueDate(tooltip.item.lastIssue), 'short'),
          })"/>
          <span class="small-caps" v-else>{{ $t('dates.notYetAvailable')}}</span>
        </p>
        <p>
          <span v-if="tooltip.item.startYear != tooltip.item.endYear" v-html="$t('dates.publicationLifespan', {
            from: tooltip.item.startYear,
            to: tooltip.item.endYear,
          })"/>
          <span v-else v-html="$t('dates.publicationDate', {
            date: tooltip.item.startYear,
          })"/>
        </p>
      </div>
    </tooltip>
    <div class='cursor' :style="{
      transform: `translate(${point.x}px, 0)`,
      opacity: point.isActive ? 1 : 0,
    }">
      <label :style="{
        transform: `translate(0, ${scrollTop}px)`
      }">
        <span class='px-2 py-1'>{{point.year}}</span>
      </label>
    </div>
    <!-- <div class="point" :style="{
      transform: `translate(${point.x}px, ${point.y}px)`,
    }"></div> -->
    <div v-for="newspaper in newspapers" :key="newspaper.uid" class="n"
      v-on:mouseover="onMouseover(newspaper, $event)"
      v-on:click="selectNewspaper(newspaper)"
      :class="{ selected: newspaper.isSelected }"
    >
      <label :class="{ 'font-weight-bold': newspaper.included }" :style="{ maxWidth: margin.left + 'px' }">
        {{newspaper.name}}
      </label>
      <div v-if="!isNaN(newspaper.startYear) && !isNaN(newspaper.endYear)" class="line" :style="newspaperStyle(newspaper)">
          <div class="label-start">{{newspaper.startYear}}</div>
          <div v-if="newspaper.startYear != newspaper.endYear" class="label-end">
            {{ newspaper.endYear}}
          </div>
      </div>
      <div v-if="newspaper.firstIssue" class="line included" :style="newspaperIncludedStyle(newspaper)"/>
      <div class="more" v-if="newspaper.isSelected">...</div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import Tooltip from './modules/tooltips/Tooltip.vue';
import { mapStores } from 'pinia'
import { useMonitorStore } from '@/stores/monitor'

export default {
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
      isActive: false,
      year: 2019,
    },
    width: 0,
  }),
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    highlight: Object,
    scrollTop: Number,
    margin: {
      type: Object,
      default: () => ({
        left: 190,
        right: 60,
      }),
    },
  },
  methods: {
    newspaperStyle(newspaper) {
      return {
        background: !newspaper.firstIssue ? 'lightgray' : '',
        left: `${this.scale(newspaper.startYear)}px`,
        right: `${(this.width - this.scale(newspaper.endYear))}px`,
      };
    },
    newspaperIncludedStyle(newspaper) {
      return {
        left: `${this.scale(this.firstIssueYear(newspaper))}px`,
        right: `${(this.width - this.scale(this.lastIssueYear(newspaper)))}px`,
      };
    },
    firstIssueYear(n) {
      return n.firstIssue ? n.firstIssue.date.getFullYear() : null;
    },
    lastIssueYear(n) {
      if (n.lastIssue) {
        return Number(this.$d(n.lastIssue.date, 'year'));
      }
      return 'not set';
    },
    getIssueDate(n) {
      if (n && n.date) return n.date;
    },
    onMousemove({ clientX, clientY }) {
      const x = clientX - this.$refs.lines.offsetLeft - this.$refs.lines.offsetParent.offsetLeft;
      const y = clientY - (this.$refs.lines.offsetTop - this.scrollTop);

      const year = parseInt(this.scale.invert(x), 10);
      const domain = this.domain;
      const isActive = year >= domain[0] && year <= domain[1];

      this.tooltip = {
        ...this.tooltip,
        x,
        y: y - 40,
      };
      if (isActive) {
        this.point = {
          x,
          y,
          year,
          isActive,
        };
      } else {
        this.point = {
          ...this.point,
          x: year <= domain[0] ? this.margin.left : this.width - this.margin.right,
        };
      }
      this.$emit('highlight', {
        mouse: {
          x,
          y,
        },
        datum: {
          t: year,
        },
      });
    },
    onMouseout() {
      this.tooltip.isActive = false;
    },
    selectNewspaper(item) {
      this.monitorStore.activate({
        item,
        type: 'newspaper',
        disableFilterModification: true
      });
    },
    onClick(newspaper) {
      console.info('@click', newspaper);
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
      // console.info('@mouseover', event);
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
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  computed: {
    ...mapStores(useMonitorStore),
    newspapers() { return this.modelValue },
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
        .range([this.margin.left, this.width - this.margin.right])
        .domain(this.domain);
    },
    domain() {
      return [
        d3.min(this.newspapers, d => d.startYear),
        d3.max(this.newspapers, d => d.endYear),
      ];
    },
  },
  watch: {
    highlight: {
      immediate: false,
      handler(val) {
        // console.info('@highlight', val, val.t.getFullYear());
        // const highlighted = this.getNearestValue(val.t.getFullYear());
        const year = val.t.getFullYear();
        this.point = {
          ...this.point,
          x: this.scale(year),
          isActive: true,
          year,
        };
      },
    },
  },
  components: {
    Tooltip,
  },
};
</script>

<style scoped lang="scss">
  @import "impresso-theme/src/scss/variables.sass";


  $clr-white: #ffffff;
  $clr-grey-100: #17191c;
  $clr-grey-300: #424a52;
  $clr-grey-400: #5a6672;
  $clr-grey-800: #c6ccd2;

  $labelsize: 2.5rem;

  .lines{
    position: relative;

  }

  .available{
    color: white;
  }


  .cursor {
    position: absolute;
    height: 100%;
    width: 1px;
    background: $clr-grey-100;
    pointer-events: none;
    z-index: 2;

    label {
      position: absolute;
      margin-left: -25px;
      width: 50px;
      text-align: center;
      font-size: 1.25em;
      span {
        background-color: $clr-grey-100;
        color: $clr-white;
      }
    }
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
    height: 25px;

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

  .n label {
    position: absolute;
    font-variant: normal;
    text-transform: none;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    left: 0;
    background-color: #F8F9FA;
    z-index: 1;
    top: -6px;
    padding-right: 5px;
  }

  .line{
    position: absolute;
    z-index: 1;
    top: 4px;
    height: 4px;
    padding: 0 1px;
    background: red;
  }
  .line.included {
    background: $clr-accent-secondary;
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
<i18n lang="json">
  {
    "en": {
      "provinceCode": {
        "AG": "Canton of Aargau",
        "AR": "Canton of Appenzell Ausserrhoden",
        "AI": "Canton of Appenzell Innerrhoden",
        "BL": "Canton of Basel-Landschaft",
        "BS": "Canton of Basel-Stadt",
        "BE": "Canton of Bern",
        "FR": "Canton of Fribourg",
        "GE": "Canton of Geneva",
        "GL": "Canton of Glarus",
        "GR": "Canton of Grisons",
        "JU": "Canton of Jura",
        "LU": "Canton of Luzern",
        "NE": "Canton of Neuchâtel",
        "OW": "Canton of Obwalden",
        "NW": "Canton of Nidwalden",
        "SH": "Canton of Schaffhausen",
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
