<template lang="html">
  <div v-bind:class="{'mb-4': expanded}">
    <base-title-bar>
      {{$t(`label.${filter.type}`)}}
      <b-button v-on:click="toggleExpanded" class="float-right" variant="link" size="sm">
        <icon v-bind:name="expanded ? 'chevron-up' : 'chevron-down'" />
      </b-button>
    </base-title-bar>
    <div>
      <div v-bind:style="chartClass">
        <vue-c3 v-bind:handler="handler"></vue-c3>
      </div>
    </div>
    <div class="row" v-show="expanded">
      <b-input-group size="sm" v-bind:append="$t('label.start')" class="col">
        <flat-pickr v-model="filter.start" v-on:on-close="setStart" class="form-control"></flat-pickr>
      </b-input-group>
      <b-input-group size="sm" v-bind:append="$t('label.end')" class="col">
        <flat-pickr v-model="filter.end" v-on:on-close="setEnd" class="form-control"></flat-pickr>
      </b-input-group>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/times';
import 'vue-awesome/icons/chevron-down';
import 'vue-awesome/icons/chevron-up';
import Icon from 'vue-awesome/components/Icon';
import Vue from 'vue';

import VueC3 from 'vue-c3';
import 'c3/c3.css';

import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

import BaseTitleBar from './../base/BaseTitleBar';

export default {
  data: () => ({
    handler: new Vue(),
    chartHeight: 350,
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    updateChart() {
      this.handler.$emit('dispatch', (chart) => {
        // https://c3js.org/reference.html#api-load
        chart.load({
          columns: [
            ['x'].concat(this.columns),
            ['counts'].concat(this.counts),
          ],
        });
        this.setDomain();
      });
    },
    setDomain() {
      this.handler.$emit('dispatch', (chart) => {
        const domain = chart.zoom();
        this.filter.start = new Date(domain[0]);
        this.filter.end = new Date(domain[1]);
      });
    },
    setZoom() {
      this.handler.$emit('dispatch', (chart) => {
        chart.zoom([new Date(this.filter.start), new Date(this.filter.end)]);
      });
    },
    setStart(start) {
      this.filter.start = new Date(start);
      this.setZoom();
    },
    setEnd(end) {
      this.filter.end = new Date(end);
      this.setZoom();
    },
    zoom() {
      this.filter.touch();
      this.setDomain();
    },
    touch() {
      this.filter.touch();
    },
  },
  computed: {
    chartClass: {
      get() {
        return {
          'margin-top': this.expanded ? 0 : `-${this.chartHeight - 110}px`,
        };
      },
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
    const options = {
      onrendered: this.setDomain,
      data: {
        x: 'x',
        columns: [
          ['x'],
          ['counts'],
        ],
      },
      subchart: {
        show: true,
        onbrush: this.touch,
      },
      zoom: {
        enabled: true,
        rescale: true,
        onzoom: this.touch,
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%Y',
          },
        },
        y: {
          inner: true,
        },
      },
      size: {
        height: this.chartHeight,
      },
      legend: {
        hide: true,
      },
      color: {
        pattern: ['#000'],
      },
      grid: {
        x: {
          show: true,
        },
        y: {
          show: true,
        },
      },
      point: {
        show: false,
      },
    };

    this.handler.$emit('init', options);
    this.updateChart();
  },
  watch: {
    filter() {
      this.updateChart();
    },
  },
  components: {
    VueC3,
    BaseTitleBar,
    Icon,
    flatPickr,
  },
};
</script>

<style lang="less">
  .c3 svg {
    overflow:visible !important;
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
