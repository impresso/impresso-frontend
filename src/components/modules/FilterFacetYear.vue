<template lang="html">
  <div v-bind:class="{ 'mb-3': expanded }">
    <div class="border-top border-tertiary pt-1px" style="margin:auto -1em">
      <div class="border-top" />
    </div>
    <base-title-bar class="pt-2 w-100">
      {{ $t(`label.${filter.type}`) }}
      <b-button v-on:click="toggleExpanded" class="float-right d-none" variant="link" size="sm">
        <span v-bind:class="expanded ? 'dripicons-chevron-up' : 'dripicons-chevron-down'" />
      </b-button>
    </base-title-bar>
    <div class="skyline-outer-wrapper w-100" v-bind:class="{ expanded: expanded }">
      <tooltip v-model="tooltip" />
      <div class="skyline-inner-wrapper">
        <div id="skyline">
        </div>
      </div>
    </div>
    <div class="row" v-show="expanded">
      <div v-bind:append="$t('label.start')" class="input-group input-group-sm col">
        <flat-pickr :modelValue="filter.start" @on-close="setStart" class="form-control"></flat-pickr>
      </div>
      <div v-bind:append="$t('label.end')" class="input-group input-group-sm col">
        <flat-pickr :modelValue="filter.end" @on-close="setEnd" class="form-control"></flat-pickr>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @deprecated Not used anywhere
 */

import flatPickr from 'vue-flatpickr-component';
import SkyLine from '@/d3-modules/SkyLine';

import 'flatpickr/dist/flatpickr.css';

import BaseTitleBar from '@/components/base/BaseTitleBar.vue';
import Tooltip from '@/components/modules/FilterFacetYearTooltip.vue';

export default {
  data: () => ({
    config: {
      element: '#skyline',
      height: 220,
      timeFormat: '%Y',
    },
    tooltip: {
      x: 0,
      y: 0,
      year: new Date(),
      count: 0,
    },
    skyline: false,
  }),
  props: ['filter'],
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    setStart(start) {
      this.filter.start = new Date(start); // eslint-disable-line
      this.skyline.zoomTo(this.filter.start, this.filter.end);
    },
    setEnd(end) {
      this.filter.end = new Date(end); // eslint-disable-line
      this.skyline.zoomTo(this.filter.start, this.filter.end);
    },
    setStartEnd(start, end) {
      this.filter.start = new Date(start); // eslint-disable-line
      this.filter.end = new Date(end); // eslint-disable-line
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
        return true;
      },
      set(/* val */) {
        // Since getter is not used - setter is not needed
      },
    },
  },
  mounted() {
    this.skyline = new SkyLine(this.config);

    this.skyline.on('zoomEnd', (domain) => {
      this.filter.start = new Date(domain[0]);  // eslint-disable-line
      this.filter.end = new Date(domain[1]);  // eslint-disable-line
    });

    this.skyline.on('mouseover', (d) => {
      this.tooltip = d;
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
    Tooltip,
    flatPickr,
  },
};
</script>

<style lang="less">
.skyline-outer-wrapper {
  position: relative;

  .skyline-inner-wrapper {
    overflow: hidden;
    height: 80px;
    position: relative;

    #skyline {
      top: -150px;
    }
  }

  &.expanded {
    .skyline-inner-wrapper {
      height: auto;

      #skyline {
        top: 0;
      }
    }
  }
}

#skyline {
  position: relative;

  .area {
    stroke-width: 1;
    stroke: black;
    fill: none;
    clip-path: url(#clip);
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

<i18n lang="json">{
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
}</i18n>
