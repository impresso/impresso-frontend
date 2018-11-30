<template lang="html">
  <div v-bind:class="{'mb-4': expanded}">
    <base-title-bar>
      {{$t(`label.${filter.type}`)}}
      <b-button v-on:click="toggleExpanded" class="float-right" variant="link" size="sm">
        <icon v-bind:name="expanded ? 'chevron-up' : 'chevron-down'" />
      </b-button>
    </base-title-bar>
    <div class="skyline-wrapper" v-bind:class="{expanded: expanded}">
      <div id="skyline"></div>
    </div>
    <div class="row" v-show="expanded">
      <b-input-group size="sm" v-bind:append="$t('label.start')" class="col">
        <flat-pickr v-bind:value="filter.start" v-on:on-close="setStart" class="form-control"></flat-pickr>
      </b-input-group>
      <b-input-group size="sm" v-bind:append="$t('label.end')" class="col">
        <flat-pickr v-bind:value="filter.end" v-on:on-close="setEnd" class="form-control"></flat-pickr>
      </b-input-group>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/times';
import 'vue-awesome/icons/chevron-down';
import 'vue-awesome/icons/chevron-up';
import Icon from 'vue-awesome/components/Icon';

import SkyLine from '@/d3-modules/SkyLine';

import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

import BaseTitleBar from './../base/BaseTitleBar';

export default {
  data: () => ({
    config: {
      element: '#skyline',
      height: 300,
      timeFormat: '%Y',
    },
    skyline: false,
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    setStart(start) {
      this.filter.start = new Date(start);
      this.skyline.zoomTo(this.filter.start, this.filter.end);
    },
    setEnd(end) {
      this.filter.end = new Date(end);
      this.skyline.zoomTo(this.filter.start, this.filter.end);
    },
    setStartEnd(start, end) {
      this.filter.start = new Date(start);
      this.filter.end = new Date(end);
      this.skyline.zoomTo(this.filter.start, this.filter.end);
    },
    touch() {
      this.filter.touch();
    },
    draw() {
      this.skyline.draw(this.filter.buckets.map(bucket => ({
        year: new Date(bucket.val, 0, 1),
        count: parseInt(bucket.count, 10),
      })));

      this.skyline.zoomTo(this.filter.start, this.filter.end);
    },
  },
  computed: {
    tooltip() {
      return {
        background: 'orange',
      };
    },
    columns: {
      get() {
        return this.filter.buckets.map(bucket => new Date(bucket.val));
      },
    },
    counts: {
      get() {
        return this.filter.buckets.map(bucket => bucket.count);
      },
    },
    expanded: {
      get() {
        return this.$store.state.search.filterFacetYearExpanded;
      },
      set(val) {
        this.$store.commit('search/UPDATE_FILTER_FACET_YEAR_EXPANDED', val);
      },
    },
  },
  mounted() {
    this.skyline = new SkyLine(this.config);

    this.skyline.on('zoomEnd', (domain) => {
      this.filter.start = new Date(domain[0]);
      this.filter.end = new Date(domain[1]);
    });

    this.skyline.on('mouseover', (d, i) => {
      // tooltip here?
      console.log(d, i);
    });

    this.skyline.on('mousedown', (d) => {
      this.setStartEnd(
        new Date(d.year.getFullYear(), 0, 1),
        new Date(d.year.getFullYear(), 11, 31));
    });

    this.draw();
  },
  watch: {
    filter: {
      handler() {
        this.draw();
      },
    },
  },
  components: {
    BaseTitleBar,
    Icon,
    flatPickr,
  },
};
</script>

<style lang="less">

.skyline-wrapper{
  overflow: hidden;
  height: 80px;
  // top:-230px;
  &.expanded{
    height: auto;
    #skyline{
      top:0;
    }
  }

  #skyline{
    top:-230px;
  }
}

#skyline{
  position: relative;
  .area {
    stroke-width: 1;
    stroke: black;
    fill: none;
    clip-path: url(#clip);
  }

  .points {
    clip-path: url(#clip);
    .point{
      opacity: 0;
      cursor: pointer;
      &:hover{
        opacity: 1;
      }
    }
  }

  .zoom {
    cursor: move;
    fill: none;
    pointer-events: all;
  }

  .tick line {
    opacity: 0.1;
  }
}
</style>

<i18n>
{
  "en": {
    "label": {
      "year": "Year",
      "start": "Start",
      "end": "End"
    }
  },
  "nl": {
    "label": {
      "year": "Jaar",
      "start": "Van",
      "end": "Tot"
    }
  }
}
</i18n>
