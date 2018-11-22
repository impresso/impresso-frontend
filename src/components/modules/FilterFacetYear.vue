<template lang="html">
  <div v-bind:class="{'mb-4': expanded}">
    <base-title-bar>
      {{$t(`label.${filter.type}`)}}
      <b-button v-on:click="toggleExpanded" class="float-right" variant="link" size="sm">
        <icon v-bind:name="expanded ? 'chevron-up' : 'chevron-down'" />
      </b-button>
    </base-title-bar>
    <h4>----</h4>
    <div class="row" v-show="expanded">
      <b-input-group size="sm" v-bind:append="$t('label.start')" class="col">
        <flat-pickr v-bind:value="filter.start" v-on:on-close="setStart" class="form-control"></flat-pickr>
      </b-input-group>
      <b-input-group size="sm" v-bind:append="$t('label.end')" class="col">
        <flat-pickr v-bind:value="filter.end" v-on:on-close="setEnd" class="form-control"></flat-pickr>
      </b-input-group>
    </div>
    <pre>{{filter.start}}</pre>
    <pre>{{filter.end}}</pre>
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
      element: 'skyline',
    },
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
    },
    setEnd(end) {
      this.filter.end = new Date(end);
    },
    touch() {
      this.filter.touch();
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
        return this.$store.state.search.filterFacetYearExpanded;
      },
      set(val) {
        this.$store.commit('search/UPDATE_FILTER_FACET_YEAR_EXPANDED', val);
      },
    },
  },
  mounted() {
    const skyline = new SkyLine(this.config);
    console.log('object: ', skyline);
  },
  watch: {
    // filter(data) {
    // redraw the timeline
    // },
  },
  components: {
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
