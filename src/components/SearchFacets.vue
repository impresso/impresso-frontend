<template lang="html">
  <div id="search-facets">
    <div class="border-top mx-3 py-2 mb-2">
      <!--  timeline title -->
      <base-title-bar>{{$t(`label.timeline.${groupByLabel}`)}}
        <div slot="options">
          <b-button v-show="daterangeFilters.length" size="sm" variant="outline-primary" @click="resetFilter('daterange')">
            {{ $t('actions.reset') }}
          </b-button>
        </div>
        <div slot="description">
          <span v-if="daterangeFilters.length">
            {{$t(`label.timelineDescription.${groupByLabel}.filtered`)}}
          </span>
          <span v-else>
              {{$t(`label.timelineDescription.${groupByLabel}.description`)}}
          </span>
        </div>
      </base-title-bar>

      <!--  timeline vis -->
      <timeline class='bg-light pb-2'
        :values="values"
        :brush="[startDaterange, endDaterange]"
        :domain="[startYear, endYear]"
        @brushed="onTimelineBrushed">
        <div slot-scope="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
            <b>{{ tooltipScope.tooltip.item.w }}</b> {{ groupByLabel }}
            <!-- <br />
            <span class="contrast" v-if="tooltipScope.tooltip.item.w1 > 0">
            &mdash; <b>{{ percent(tooltipScope.tooltip.item.w1, tooltipScope.tooltip.item.w) }}%</b>
            ({{ tooltipScope.tooltip.item.w1 }}) {{ contrastLabel }}
            </span> -->
          </div>
        </div>
      </timeline>

      <div v-for="(filter, index) in daterangeFilters" :key="index" class="bg-light border p-2 mt-2">
        <filter-monitor :store="store" :filter="filter" type="daterange" />
      </div>
      <div v-if="!daterangeFilters.length">
        <b-button size="sm" variant="outline-primary" @click="addDaterangeFilter">
        {{ $t('label.daterange.pick') }}
        </b-button>
      </div>
      <!--  daterange filters -->
      <div v-if="daterange.isActive">
        <div class="p-2">
          <div class="row">
            <div class="col-6">
              <label>{{$t('label.daterange.start')}}</label>
              <b-form-input v-model="startDaterange"></b-form-input>
              <!-- <flat-pickr :config="{startDate, endDate, allowInput: true}"  v-model="daterange.start"  class="form-control"></flat-pickr> -->
            </div>
            <div class="col-6">
              <label>{{$t('label.daterange.end')}}</label>
              <b-form-input v-model="endDaterange"></b-form-input>
              <!-- <flat-pickr :config="{startDate, endDate, allowInput: true}" v-model="daterange.end" class="form-control"></flat-pickr> -->
            </div>
            <div class="col-12 mt-2">
              <b-button block size="sm" variant="outline-primary" @click="submitDaterange">{{$t('label.daterange.apply')}}</b-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-for="(facet, index) in facets" class="border-top mx-3 py-2 mb-2">
      <filter-facet :facet="facet"
        :store="store"
        @submit-buckets="submitBuckets"
        @update-filter="updateFilter"
        @reset-filter="resetFilter"/>
    </div>
  </div>
</template>

<script>
// import 'flatpickr/dist/flatpickr.css';
// import flatPickr from 'vue-flatpickr-component';
import Daterange from '@/models/Daterange';

import FilterFacet from './modules/FilterFacet';
import FilterMonitor from './modules/FilterMonitor';
import BaseTitleBar from './base/BaseTitleBar';
import Timeline from './modules/Timeline';

const fillYears = (initialValues = []) => {
  if (!initialValues.length) {
    return [];
  }
  // add zeroes to values array. Use the current extent.
  const sorted = initialValues.sort((a, b) => a.t - b.t);

  const values = [sorted[0]];

  for (let i = 1, l = sorted.length; i < l; i += 1) {
    // if year ...
    const diff = sorted[i].t - sorted[i - 1].t;
    for (let j = 1; j < diff; j += 1) {
      values.push({
        t: sorted[i - 1].t + j,
        w: 0,
        w1: 0,
      });
    }
    values.push(sorted[i]);
  }
  return values;
};

export default {
  props: {
    store: {
      type: String,
      default: 'search',
    },
    startYear: {
      type: Number,
      default: 1737,
    },
    endYear: {
      type: Number,
      default: 2020,
    },
  },
  data: () => ({
    daterange: {
      context: 'include',
      isActive: false,
      start: null,
      end: null,
    },
    facetsOrder: ['language', 'newspaper', 'topic'],
  }),
  computed: {
    currentStore() {
      if (this.store === 'searchImages') {
        return this.$store.state.searchImages;
      }
      return this.$store.state.search;
    },
    daterangeFilters() {
      return this.currentStore.search.filters.filter(d => d.type === 'daterange');
    },
    daterangeIncluded() {
      return this.daterangeFilters.filter(d => d.context === 'include');
    },
    startDate() {
      return new Date(`${this.startYear}-01-01`);
    },
    endDate() {
      return new Date(`${this.endYear}-12-31`);
    },
    startDaterange: {
      get() {
        let d;
        if (!this.daterange.start) {
          d = this.minDate.toISOString();
        } else {
          d = this.daterange.start.toISOString();
        }
        return d.split('T').shift();
      },
      set(val) {
        // if value is complete
        if (!/^\d{4}-[0-1]\d-[0-3]\d$/.test(val)) {
          // ignore non finished dates!
          // YYYY-MM-dd
          return;
        }
        const d = new Date(val);
        // check that the date is valid
        if (isNaN(d.valueOf())) {
          // invalid date, just ignore
          return;
        }
        this.daterange.start = d;
      },
    },
    endDaterange: {
      get() {
        let d;
        if (!this.daterange.end) {
          d = this.maxDate.toISOString();
        } else {
          d = this.daterange.end.toISOString();
        }
        return d.split('T').shift();
      },
      set(val) {
        // if value is complete
        if (!/^\d{4}-[0-1]\d-[0-3]\d$/.test(val)) {
          // ignore non finished dates!
          // YYYY-MM-dd
          return;
        }
        const d = new Date(val);
        // check that the date is valid
        if (isNaN(d.valueOf())) {
          // invalid date, just ignore
          return;
        }
        this.daterange.end = d;
      },
    },
    minDate() {
      if (this.values.length) {
        const y = this.values.reduce((min, d) => (d.t < min ? d.t : min), this.values[0].t);
        return new Date(`${y}-01-01`);
      }
      return new Date(`${this.startYear}-01-01`);
    },
    maxDate() {
      if (this.values.length) {
        const y = this.values.reduce((max, d) => (d.t > max ? d.t : max), this.values[0].t);
        return new Date(`${y}-12-31`);
      }
      return new Date(`${this.endYear}-12-31`);
    },
    groupByLabel: {
      get() {
        return this.$t(`groupBy.${this.currentStore.groupBy}`);
      },
    },
    values: {
      get() {
        const facet = this.currentStore.facets.find(d => d.type === 'year');
        if (!facet) {
          return [];
        }
        const values = facet.buckets.map(d => ({
          ...d,
          w: d.count,
          w1: 0,
          t: parseInt(d.val, 10),
        }));
        // add zeroes
        return fillYears(values);
      },
    },
    facets: {
      get() {
        return this.currentStore.facets
          .filter(d => d.type !== 'year')
          .sort((a, b) => {
            const indexA = this.facetsOrder.indexOf(a.type);
            const indexB = this.facetsOrder.indexOf(b.type);

            if (indexA < indexB) {
              return -1;
            }

            if (indexA > indexB) {
              return 1;
            }

            return 0;
          });
      },
    },
  },
  methods: {
    onTimelineBrushed(data) {
      if (this.startDaterange !== data.minValue) {
        this.startDaterange = data.minValue;
      }
      if (this.endDaterange !== data.maxValue) {
        this.endDaterange = data.maxValue;
      }
    },
    addDaterangeFilter() {
      // this.daterange.start = new Date(this.minDate);
      // this.daterange.end = new Date(this.maxDate);
      // this.daterange.isActive = !this.daterange.isActive;
      // create new daterangefilter if theres none
      if (!this.daterangeIncluded.length) {
        const dr = new Daterange({
          start: this.startDaterange,
          end: this.endDaterange,
        });

        this.$store.commit(`${this.store}/ADD_FILTER`, {
          type: 'daterange',
          q: dr.getValue(),
        });
      }
    },
    updateFilter(filter) {
      this.$emit('update-filter', filter);
    },
    resetFilter(type) {
      this.$emit('reset-filter', type);
    },
    submitBuckets({ type, context, ids }) {
      this.$emit('submit-facet', {
        type,
        context,
        q: ids,
        exclusive: true,
      });
    },
    submitDaterange() {
      console.log('submit-facet', this.daterange.start, this.daterange.end);
      this.$emit('submit-facet', {
        type: 'daterange',
        start: new Date(this.daterange.start),
        end: new Date(this.daterange.end),
        context: this.daterange.context,
      });
    },
    /**
     * Add facet to data
     * @param {[type]} facet               [description]
     * @param {[type]} bucket              [description]
     * @param {String} [context='include'] [description]
     */
    // addFacet(facet, bucket, context = 'include'){
    //
    // },
    submitFacet(facet, bucket, context = 'include') {
      if (facet.type === 'topic') {
        this.$emit('submit-facet', {
          type: facet.type,
          item: bucket.item,
          h: bucket.val,
          q: bucket.val,
          context,
        });
      } else if (facet.type === 'newspaper') {
        this.$emit('submit-facet', {
          q: bucket.val,
          type: facet.type,
          item: bucket.item,
          context,
        });
      } else if (facet.type === 'language') {
        this.$emit('submit-facet', {
          q: bucket.val,
          type: facet.type,
          item: bucket.item,
          context,
        });
      } else if (facet.type === 'collection') {
        this.$emit('submit-facet', {
          q: bucket.val,
          type: facet.type,
          item: bucket.item,
          context,
        });
      }
    },
  },
  components: {
    BaseTitleBar,
    Timeline,
    // flatPickr,
    FilterFacet,
    FilterMonitor,
  },
};
</script>

<style scoped lang="scss">
.facet-filter{
  display: grid;
  grid-template-columns: auto min-content;
  grid-template-areas: "left" "right";
  .left{
    grid-area: "left"
  }
  .right{
    opacity: 0;
    grid-area: "right"
  }
  &:hover{
    .right{
      opacity: 1;
    }
  }
}

.filter-opts{
  position: absolute;
  width: 240px;
  left: auto;
  right: -1px;
  top: -2px;
  background: white;
  border: 1px solid;
  box-shadow: 0.3em 0.3em 0 rgba(17, 17, 17, 0.2);
}

</style>
<i18n>
  {
    "en": {
      "label": {
        "timeline": {
          "articles": "publication date",
          "images": "publication date"
        },
        "timelineDescription": {
          "articles": {
            "description": "Number of articles per year",
            "filtered": "Number of articles per year (filtered)"
          },
          "images": {
            "description": "Number of images extracted per year",
            "filtered": "Number of images per year (filtered)"
          }
        },
        "daterange": {
          "pick": "add filter ...",
          "start": "from",
          "end": "to",
          "apply": "add as filter"
        }
      },
      "groupBy": {
        "articles": "articles",
        "images": "images"
      }
    }
  }
</i18n>
