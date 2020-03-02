<template lang="html">
  <div class="">
    <base-title-bar>
      {{$t(`label.${facet.type}.filterTitle`)}}
      <info-button class="ml-1" v-if="facet.type === 'person' || facet.type === 'location'"
        :target="facet.type"
        name="what-is-nep" />
      <info-button v-if="facet.type === 'newspaper'" name="which-newspapers" class="ml-1" />
      <info-button v-if="facet.type === 'topic'" name="how-to-read-the-topics" class="ml-1" />
      <div slot="options">
        <b-button v-show="filtered" size="sm" variant="outline-primary" @click="resetFilterType">
          {{ $t(`actions.reset`) }}
        </b-button>
        <b-button v-if="isCollapsible" size="sm" variant="outline-icon" @click="toggleVisibility">
          <span class="icon-link" :class="{ 'dripicons-plus': isCollapsed, 'dripicons-minus': !isCollapsed }"></span>
        </b-button>
      </div>
      <div slot="description">
        <span v-if="filtered">
          {{$t(`label.${facet.type}.filtered`)}}
        </span>
        <span v-else>
          <span v-if="selectedIds.length">
            <span v-html="$t(`label.${facet.type}.selected`, {count: selectedIds.length})" />
            <b-button size="sm" variant="outline-primary" @click="applyFilter">
              {{ $t(`actions.apply`) }}
            </b-button>
          </span>
          <span v-else>
            <span v-if="isLoadingResults">
              {{ $t('actions.loading') }}
            </span>
            <span v-if="!isLoadingResults && !this.facet.buckets.length">
              {{$t(`label.${facet.type}.empty`)}}
            </span>
            <span v-else>
              {{$t(`label.${facet.type}.description`)}}
            </span>
          </span>
        </span>
      </div>
    </base-title-bar>
    <div v-for="(filter, index) in included" :key="index" class="bg-light border p-2">
      <filter-monitor
        :items-to-add="selectedItems"
        :filter="filter"
        :operators="facet.operators"
        @changed="handleFilterChanged($event, filter)" />
    </div>
    <div v-for="(filter, index) in excluded" :key="index" class="bg-light border p-2">
      <filter-monitor
        :filter="filter"
        :operators="facet.operators"
        @changed="handleFilterChanged($event, filter)" />
    </div>
    <div v-if="showBuckets">
      <filter-facet-bucket v-for="bucket in unfiltered" :key="bucket.val"
        :loading="isLoadingResults"
        :bucket="bucket"
        :type="facet.type"
        @toggle-bucket="toggleBucket"/>
      <b-button
        v-if="facet.numBuckets > -1"
        v-html="$t('actions.more')"
        size="sm" variant="outline-secondary" class="mt-2 mr-1"
        @click="showModal" />
    </div>

    <explorer v-model="explorerFilters"
              :is-visible="explorerVisible"
              @onHide="handleExplorerHide"
              :searching-enabled="false"
              :initial-type="facet.type"/>
  </div>
</template>

<script>
import 'vue-awesome/icons/times';
import BaseTitleBar from '../base/BaseTitleBar';
import FilterFacetBucket from './FilterFacetBucket';
import FilterMonitor from './FilterMonitor';
import InfoButton from '../base/InfoButton';
import Explorer from '../Explorer';
import { toSerializedFilter } from '../../logic/filters'

export default {
  data: () => ({
    selectedIds: [],
    selectedItems: [],
    operators: ['or', 'and'],
    exploreFacet: {},
    isCollapsed: true,
    explorerVisible: false,
  }),
  props: {
    store: {
      type: String,
      default: 'search',
    },
    facet: Object,
    collapsible: Boolean,
  },
  computed: {
    showBuckets() {
      if (!this.isCollapsible) {
        return true;
      }
      return !this.isCollapsed;
    },
    isCollapsible() {
      return this.collapsible && !this.filtered;
    },
    currentStore() {
      return this.$store.state[this.store];
    },
    isLoadingResults() {
      return this.currentStore.isLoadingResults;
    },
    filtered() {
      return this.currentStore.search.filtersIndex[this.facet.type];
    },
    included() {
      if (!this.filtered) {
        return [];
      }
      const included = this.currentStore.search
        .filtersIndex[this.facet.type]
        .filter(d => d.context !== 'exclude');
      // enrich included filter with matching buckets.
      included.forEach((filter) => {
        filter.items.forEach((d, i) => {
          const bucket = this.facet.buckets.find(b => b.val === d.uid);

          if (bucket && filter.items[i]) {
            filter.items[i].count = bucket.count;
          }
        });
      });
      return included;
    },
    includedIds() {
      return this.included.reduce((acc, filter) => acc.concat(Array.isArray(filter.q) ? filter.q : [filter.q]), []);
    },
    excluded() {
      if (!this.filtered) {
        return [];
      }
      return this.filtered.filter(d => d.context === 'exclude');
    },
    /**
     * List facet buckets NOT included in a filter
     * @return {Array} array of buckets
     */
    unfiltered() {
      if (!this.filtered || !this.included) {
        return this.facet.buckets;
      }
      return this.facet.buckets.filter(b => this.includedIds.indexOf(b.val) === -1);
    },
    explorerFilters: {
      get() { return this.currentStore.search.filters.map(f => ({ ...f.getQuery(), items: f.items })) },
      /** @param {import('../../models/models').Filter[]} filters */
      set(filters) {
        const currentFilters = this.currentStore.search.filters.map(f => ({ ...f.getQuery(), items: f.items }))
        filters.forEach(filter => {
          const exists = currentFilters.filter(f => JSON.stringify(f) === JSON.stringify(filter)).length
          if (!exists) {
            this.updateFilter(filter)
          }
        })
      }
    }
  },
  methods: {
    handleFilterChanged(filter, oldFilter) {
      if (toSerializedFilter(filter) !== toSerializedFilter(oldFilter)) {
        if (!filter.q || filter.q.length === 0) {
          return this.$store.dispatch(`${this.store}/RESET_FILTER`, { type: filter.type })
        }

        this.$store.dispatch(`${this.store}/UPDATE_FILTER`, {
          filter: oldFilter,
          q: filter.q,
          op: filter.op,
          context: filter.context,
          precision: filter.precision,
          distance: filter.distance
        })
        this.selectedItems = [];
        this.$store.dispatch(`${this.store}/PUSH_SEARCH_PARAMS`, {})
      }
    },
    toggleVisibility() {
      this.isCollapsed = !this.isCollapsed;
    },
    toggleBucket(bucket) {
      const idx = this.selectedIds.indexOf(bucket.val);
      if (idx !== -1 && !bucket.checked) { // remove.
        this.selectedIds.splice(idx, 1);
        this.selectedItems.splice(idx, 1);
        bucket.checked = false;
      } else if (idx === -1 && bucket.checked) { // add.
        bucket.checked = true;
        this.selectedIds.push(bucket.val);
        if (bucket.item) {
          this.selectedItems.push({
            checked: true,
            ...bucket.item,
            count: bucket.count,
          });
        } else {
          this.selectedItems.push(bucket);
        }
      } // nothing else matters
    },
    clearSelectedItems() {
      this.selectedIds = [];
      this.selectedItems = [];
      this.$store.dispatch(`${this.store}/PUSH_SEARCH_PARAMS`, {})
    },
    applyFilter() {
      console.info('submit', this.facet.type, this.selectedIds);
      this.$emit('submit-buckets', {
        type: this.facet.type,
        q: this.selectedIds,
      });
      this.clearSelectedItems();
    },
    updateFilter(filter) {
      this.$emit('submit-buckets', filter);
      // this.$emit('update-filter', filter);
    },
    resetFilterType() {
      this.clearSelectedItems();
      this.$emit('reset-filter', this.facet.type);
    },
    showModal() {
      this.explorerVisible = true
    },
    handleExplorerHide() {
      this.explorerVisible = false
    }
  },
  components: {
    BaseTitleBar,
    FilterFacetBucket,
    FilterMonitor,
    InfoButton,
    Explorer
  },
};
</script>

<style scoped lang="less">
</style>
<i18n>
{
  "en": {
    "show-more": "Show More",
    "explore": "Explore {type}"
  }
}
</i18n>
