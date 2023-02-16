<template>
  <div v-if="isActive" class="SelectionMonitor  rounded drop-shadow bg-light" :class="monitor.type" v-on:click.stop>
    <div class="d-flex flex-column h-100">
      <!-- top -->
      <section>
        <!-- header -->
        <div class="d-flex my-2 align-items-center">
          <b-tabs pills class="px-2" style="flex-grow:1">
            <template v-slot:tabs-end>
              <b-nav-item class="active">
                <span v-html="$t(`tabs.${monitor.type}.${monitor.scope}`)" />
              </b-nav-item>
            </template>
          </b-tabs>
          <div class="pr-3 SelectionMonitor_close">
            <span class="dripicons-cross" v-on:click="hide" />
          </div>
        </div>
        <!-- end header -->
        <!-- title -->
        <h2 class="mx-3" v-if="monitor.item">
          <ItemLabel :item="monitor.item" :type="monitor.type" />
          <span class="small-caps pl-2">{{ monitor.type }}</span>
        </h2>
        <div class="mx-3">
          {{ minDate.getFullYear()}} to {{ maxDate.getFullYear() }}
        </div>
        <!-- end title -->
        <!-- timeline -->
        <div class="mx-2">
          <timeline class="bg-light"
                :domain="[startYear, endYear]"
                :contrast="false"
                :values="timelineValues">
            <div slot-scope="tooltipScope">
              <div v-if="tooltipScope.tooltip.item">
                {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
                <b>{{ tooltipScope.tooltip.item.w }}</b>
              </div>
            </div>
          </timeline>
        </div>
        <!-- end timeline -->
        <!-- filters -->
        <div class="mx-3">
          <b-form-group class="m-0">
            <b-form-checkbox v-model="applyCurrentSearchFilters">
              <span v-html="$t('labels.applyCurrentSearchFilters', { count: this.supportedFilters.length })"/>
            </b-form-checkbox>
          </b-form-group>
          <p class="ml-1">
            <span v-html="statsLabel" />
            <SearchQuerySummary v-if="applyCurrentSearchFilters" class="d-inline" :search-query="{ filters: monitorFilters}" />
          </p>
        </div>
        <!-- end filters -->
        <!-- actions -->
        <div class="p-2 border-tertiary border-top d-flex justify-content-between">
          <button v-on:click.prevent.stop="applyFilter" class="btn btn-sm btn-outline-primary">{{ $t(monitorFilterExists ? 'actions.removeFromCurrentFilters':'actions.addToCurrentFilters') }}</button>
          <button v-on:click.prevent.stop="hide" class="btn btn-sm btn-outline-primary">{{ $t('actions.close') }}</button>
        </div>
        <!-- end actions -->
      </section>
      <!-- end top -->
      <!-- bottom -->
      <TextReuseClusterMonitor 
        :filters="applyCurrentSearchFilters? monitorFilters: []" :item="monitor.item" v-if="monitor.type === 'textReuseCluster'" class="flex-grow-1 bg-dark" />
      <!-- end bottom -->
    </div>
  </div>
</template>

<script>
import Helpers from '@/plugins/Helpers'
import ItemLabel from './modules/lists/ItemLabel.vue'
import SearchQuerySummary from './modules/SearchQuerySummary.vue'
import { SupportedFiltersByContext, SupportedIndexByContext } from '@/logic/filters'
import { searchFacets } from '@/services'
import Timeline from '@/components/modules/Timeline'
import FilterFactory from '@/models/FilterFactory'
import TextReuseClusterMonitor from './TextReuseClusterMonitor.vue'

export default {
  props:{
    filters: {
      type: Array,
      default: () => [],
    },
    startYear: {
      type: Number,
    },
    endYear: {
      type: Number,
    }
  },
  components: {
    Timeline,
    SearchQuerySummary,
    ItemLabel,
    TextReuseClusterMonitor
  },
  name: 'SelectionMonitor',
  computed: {
    supportedFilters() {
      return this.filters.filter(filter =>
        SupportedFiltersByContext[this.context].includes(filter.type),
      )
    },
    monitorFilter() {
      return FilterFactory.create({
        type: this.monitor.type,
        q: [this.monitor.item.id ?? this.monitor.item.uid],
        items: this.monitor.items.length ? this.monitor.items : [this.monitor.item],
      })
    },
    monitorFilters() {
      return [...this.supportedFilters, this.monitorFilter]
    },
    monitorFilterExists() {
      return this.filters.some(filter => filter.type === this.monitor.type)
    },
    /** @returns {{ query: any, hash: string }} */
    timelineApiQueryParams() {
      const query = {
        index: SupportedIndexByContext[this.context],
        limit: 500,
        filters: []
      }
      if (this.applyCurrentSearchFilters) {
        query.filters = [...this.supportedFilters]
      }
      // add curent item in filters
      if (this.monitor.item) {
        query.filters.push({
          type: this.monitor.type,
          q: this.monitor.item.id ?? this.monitor.item.uid,
        })
      }

      return {
        query,
        hash: JSON.stringify(query)
          .split('')
          .sort()
          .join(''),
      }
    },
    isActive() {
      return this.$store.state.selectionMonitor.isActive
    },
    context() {
      return this.$store.state.selectionMonitor.context
    },
    monitor() {
      return this.$store.state.selectionMonitor
    },
    /** @returns {string} */
    statsLabel() {
      if (this.isLoading) {
        return this.$t('actions.loading')
      }
      let key = 'itemStats';

      if (this.applyCurrentSearchFilters && this.filters.length) {
        key = 'itemStatsFiltered';
      }
      return this.$t(key, {
        count: this.$n(this.total),
        context: this.context,
        // from: this.itemTimelineDomain[0],
        // to: this.itemTimelineDomain[1],
      })
    },
    /** @returns {Date} */
    minDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce(
          (min, d) => (d.t < min ? d.t : min),
          this.timelineValues[0].t,
        )
        return new Date(`${y}-01-01`)
      }
      return new Date(`${this.startYear}-01-01`)
    },
    /** @returns {Date} */
    maxDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce(
          (max, d) => (d.t > max ? d.t : max),
          this.timelineValues[0].t,
        )
        return new Date(`${y}-12-31`)
      }
      return new Date(`${this.endYear}-12-31`)
    },

  },
  data: () => ({
    total: 0,
    timelineValues: [],
    applyCurrentSearchFilters: false,
    isLoading: false,
  }),
  methods: {
    hide() {
      this.$store.dispatch('selectionMonitor/hide')
    },
    applyFilter() {
      const filterExists = this.filters.some(f => f.type === this.monitorFilter.type)
      // if the filter type is already in the list, we need to merge the values
      const updatedFilters = this.monitorFilterExists ? this.filters.filter(f => f.type !== this.monitorFilter.type): this.monitorFilters
      // eslint-disable-next-line
      console.debug('[SelectionMonitor] applyFilter', updatedFilters)
      this.$emit('change', updatedFilters)
    },
    loadTimeline() {
      // eslint-disable-next-line
      console.debug('[ItemSelector] loadTimeline')
      searchFacets
        .get('year', {
          query: this.timelineApiQueryParams.query,
        })
        .then(response => {
          // eslint-disable-next-line no-console
          console.debug('[ItemSelector] loadTimeline success', response)
          this.timelineValues = Helpers.timeline.fromBuckets(response[0].buckets);
          this.total = response[0].buckets.reduce((acc, bucket) => acc + bucket.count, 0)
        })
    }
  },
  watch: {
    timelineApiQueryParams: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug('[ItemSelector] @searchApiQueryParameters \n query:', query)
        if (this.isActive) {
          this.loadTimeline()
        }
      },
      immediate: true,
      deep: false,
    },
  },
}
</script>

<style lang="css">
.SelectionMonitor {
  border: 1px solid #343a40;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  margin-left: -200px;
  margin-top: -175px;
  pointer-events: auto;
}

.SelectionMonitor.textReuseCluster {

  width: 800px;
  top: 10%;
  bottom: 10%;
  margin-top: auto;
  margin-left:-400px;
}

.SelectionMonitor_body {
  max-height: 300px;
  overflow-y: scroll;
}
.SelectionMonitor_close {
  cursor: pointer;
}
.SelectionMonitor_close:hover {
  color: var(--primary);
}
.SelectionMonitor h2 {
  font-size: inherit;
}
</style>
<i18n>
{
  "en": {
    "labels": {
      "applyCurrentSearchFilters": "Apply current search filters (<span class='number'>{count}</span>)"
    },
    "tabs": {
      "textReuseCluster": {
        "overview": "cluster of text reuse"
      },
      "newspaper": {
        "overview": "newspaper"
      },
      "topic": {
        "overview": "topic"
      },
      "partner": {
        "overview": "partner"
      },
      "accessRight": {
        "overview": "access right"
      },
      "language": {
        "overview": "language"
      },
      "type": {
        "overview": "article type"
      },
      "country": {
        "overview": "country of publication"
      },
      "person": {
        "overview": "person"
      },
      "location"  : {
        "overview": "location"
      }
    },
    "itemStatsEmpty": "No results apparently",
    "itemStats": "<b class='number'>{count}</b> results in {context}",
    "itemStatsFiltered": "<b class='number'>{count}</b> results in {context}, using current available search filters"
  }
}
