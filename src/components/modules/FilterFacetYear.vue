<template lang="html">
  <div class="mb-4">
    <base-title-bar>
    {{$t(`label.${filter.type}`)}}
      <b-button v-on:click="removeFilter" class="float-right" variant="link" size="sm" v-show="filter.touched">
        <icon name="times" />
      </b-button>
    </base-title-bar>
    <vue-c3 v-bind:handler="handler"></vue-c3>
    <div class="row">
      <b-input-group size="sm" v-bind:append="$t('label.start')" class="col">
        <flat-pickr v-model="start" v-on:on-close="setStart" class="form-control"></flat-pickr>
      </b-input-group>
      <b-input-group size="sm" v-bind:append="$t('label.end')" class="col">
        <flat-pickr v-model="end" v-on:on-close="setEnd" class="form-control"></flat-pickr>
      </b-input-group>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/times';
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
    start: new Date(),
    end: new Date(),
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    removeFilter() {

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
        this.setDomain(chart.zoom());
      });
    },
    setDomain(domain) {
      this.start = new Date(domain[0]);
      this.end = new Date(domain[1]);
    },
    setZoom() {
      this.handler.$emit('dispatch', (chart) => {
        chart.zoom([new Date(this.start), new Date(this.end)]);
      });
    },
    setStart(start) {
      this.start = new Date(start);
      this.setZoom();
    },
    setEnd(end) {
      this.end = new Date(end);
      this.setZoom();
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
  },
  mounted() {
    const options = {
      data: {
        x: 'x',
        columns: [
          ['x'],
          ['counts'],
        ],
      },
      zoom: {
        enabled: true,
        onzoom: this.setDomain,
        rescale: true,
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
        height: 150,
      },
      legend: {
        hide: true,
      },
      padding: {
        bottom: -20,
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
