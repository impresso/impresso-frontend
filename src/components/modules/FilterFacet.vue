<template lang="html">
  <div class="filter-facet">
    <base-title-bar>
      {{
        $t(`label.${facet.type}.filterTitle`)
      }}
      <span v-if="facet.numBuckets > -1" v-html="$tc('numbers.options', facet.numBuckets, {
        n: $n(facet.numBuckets),
      })" />
      <info-button class="ml-1" v-if="facet.type === 'person' || facet.type === 'location'"
        :target="facet.type"
        name="what-is-nep" />
      <info-button v-if="facet.type === 'newspaper'" name="which-newspapers" class="ml-1" />
      <info-button v-if="facet.type === 'topic'" name="how-to-read-the-topics" class="ml-1" />
      <div slot="options">
        <b-button v-show="isFiltered" size="sm" variant="outline-primary" @click="resetFilters">
          {{ $t(`actions.reset`) }}
        </b-button>
        <b-button v-if="isCollapsible" size="sm" variant="outline-icon" @click="toggleVisibility">
          <span class="icon-link" :class="{ 'dripicons-plus': isCollapsed, 'dripicons-minus': !isCollapsed }"></span>
        </b-button>
      </div>
      <div slot="description" class="mb-2">
        <div v-if="isFiltered" v-html="$t(`label.${facet.type}.filtered`)" />
        <div v-else-if="selectedBucketsIds.length">
          <span v-html="$t(`label.${facet.type}.selected`, {count: selectedBucketsIds.length})" />
        </div>
        <div v-else>
          <span v-if="isLoading">
            {{ $t('actions.loading') }}
          </span>
          <span v-else-if="!isLoading && !facet.buckets.length">
            {{$t(`label.${facet.type}.empty`)}}
          </span>
          <span v-else>
            {{$t(`label.${facet.type}.description`)}}
          </span>
        </div>
      </div><!-- .description -->
    </base-title-bar>
    <div v-for="({ filter, filterIndex }) in includedFilterItems" :key="filterIndex" class="bg-white border p-2">
      <filter-monitor
        :items-to-add="selectedBucketsItems"
        :filter="filter"
        :operators="facet.operators"
        @changed="filter => updateFilter(filterIndex, filter)" />
    </div>
    <div v-for="({ filter, filterIndex }) in excludedFilterItems" :key="filterIndex" class="bg-light border p-2">
      <filter-monitor
        :filter="filter"
        :operators="facet.operators"
        @changed="filter => updateFilter(filterIndex, filter)" />
    </div>
    <div v-if="showBuckets">
      <filter-facet-bucket v-for="bucket in unfilteredBuckets" :key="bucket.val"
        :loading="isLoading"
        :bucket="bucket"
        :type="facet.type"
        @toggle-bucket="toggleBucket"/>
      <b-button
        v-if="facet.numBuckets > 0 && facet.numBuckets > facet.buckets.length"
        v-html="$t('actions.more')"
        size="sm" variant="outline-secondary" class="mt-2 mr-1"
        @click="showExplorer" />
    </div>
    <div class="d-flex mt-2" v-if="selectedBucketsIds.length && !isFiltered">
      <b-button size="sm" variant="outline-primary" class="w-100" @click="createFilter">
        {{ $t(`actions.apply`) }}
      </b-button>
    </div>
    <explorer v-model="explorerFilters"
      :is-visible="explorerVisible"
      :searching-enabled="true"
      @onHide="handleExplorerHide"
      :included-types="[facet.type]" />
  </div>
</template>

<script>
import BaseTitleBar from '@/components/base/BaseTitleBar';
import FilterFacetBucket from '@/components/modules/FilterFacetBucket';
import FilterMonitor from '@/components/modules/FilterMonitor';
import InfoButton from '@/components/base/InfoButton';
import { toSerializedFilter } from '@/logic/filters'
import Explorer from '@/components/Explorer';


export default {
  /**
   * Model is a list of 0 or more filters of the same type (type
   * that matches the facet type). Model is changed whenver:
   * - filters are modified
   * - new filter is created (the model was an empty array before)
   * - filters were removed (the model contained at least one filter but became an empty array)
   */
  model: {
    prop: 'facetFilters',
    event: 'changed'
  },
  data: () => ({
    isCollapsed: false,
    selectedBucketsIds: [],
    selectedBucketsItems: [],
    explorerVisible: false,
  }),
  props: {
    facet: Object,
    facetFilters: {
      type: Array,
      default: () => [],
    },
    /* filters used to narrow down the search for new facet filters option in explorer */
    contextFilters: {
      /** @type {import('vue').PropType<import('../../models/models').Filter[]>} */
      type: Array,
      default: () => [],
    },
    isLoading: Boolean,
    collapsible: Boolean,
  },
  computed: {
    explorerFilters: {
      get() { return this.contextFilters },
      set(filters) { this.$emit('changed', filters) },
    },
    showBuckets() {
      // always show if iscollaplible is selected.
      return this.isCollapsible ? !this.isCollapsed : true;
    },
    isCollapsible() {
      return this.collapsible && !this.isFiltered;
    },
    isFiltered() {
      return this.facetFilters.length;
    },
    includedFilterItems() {
      if (!this.facetFilters.length) {
        return [];
      }
      // add count if selected items is in one of the buckets.
      return this.facetFilters
        .map((filter, filterIndex) => ({ filter, filterIndex }))
        .filter(({ filter: { context } }) => context === 'include')
        .map(({ filter, filterIndex }) => ({
          filter: {
            ...filter,
            items: filter.items.map((item) => {
              if (this.bucketsIndex[item.uid]) {
                return {
                  ...item,
                  count: this.bucketsIndex[item.uid].count,
                }
              }
              return item;
            }),
          },
          filterIndex
        }));
    },
    /**
     * List items ids included into current filters.
     * @return {Array} array of items uids
     */
    filtersIncludedItemsIds() {
      return this.includedFilterItems
        .reduce((acc, { filter }) => acc.concat(
          Array.isArray(filter.q) ? filter.q : [filter.q]), [],
        );
    },
    excludedFilterItems() {
      return this.facetFilters
        .map((filter, filterIndex) => ({ filter, filterIndex }))
        .filter(({ filter: { context } }) => context === 'exclude');
    },
    bucketsIndex() {
      const index = {};
      this.facet.buckets.forEach(({ item, count }) => {
        index[item.uid] = { count };
      });
      return index;
    },
    /**
     * List facet buckets NOT included in a filter
     * @return {Array} array of buckets
     */
    unfilteredBuckets() {
      if (!this.isFiltered || !this.includedFilterItems) {
        return this.facet.buckets;
      }
      return this.facet.buckets
        .filter(b => !this.filtersIncludedItemsIds.includes(b.val));
    },
  },
  methods: {
    toggleVisibility() {
      this.isCollapsed = !this.isCollapsed;
    },
    toggleBucket(bucket) {
      const idx = this.selectedBucketsIds.indexOf(bucket.val);
      if (idx !== -1 && !bucket.checked) { // remove.
        this.selectedBucketsIds.splice(idx, 1);
        this.selectedBucketsItems.splice(idx, 1);
      } else if (idx === -1 && bucket.checked) { // add.
        this.selectedBucketsIds.push(bucket.val);
        if (bucket.item) {
          this.selectedBucketsItems.push({
            checked: true,
            ...bucket.item,
            count: bucket.count,
          });
        } else {
          this.selectedItems.push(bucket);
        }
      } // nothing else matters
    },
    resetFilters() {
      this.$emit('changed', []);
    },
    showExplorer() {
      this.explorerVisible = true;
    },
    handleExplorerHide() {
      this.explorerVisible = false;
    },
    updateFilter(filterIndex, filter) {
      const oldFilter = this.facetFilters[filterIndex]

      if (toSerializedFilter(filter) !== toSerializedFilter(oldFilter)) {
        if (!filter.q || filter.q.length === 0) {
          const newFilters = this.facetFilters
            .filter((f, index) => index !== filterIndex);
          this.$emit('changed', newFilters);
        } else {
          this.clearSelectedItems();
          const newFilters = this.facetFilters.map((f, index) => {
            if (index === filterIndex) return filter;
            return f;
          })
          this.$emit('changed', newFilters);
        }
      }
    },
    createFilter() {
      this.$emit('changed', this.facetFilters.concat([{
        type: this.facet.type,
        q: this.selectedBucketsIds,
        items: this.selectedBucketsItems,
      }]));
      this.clearSelectedItems();
    },
    clearSelectedItems() {
      this.selectedBucketsIds = [];
      this.selectedBucketsItems = [];
    },
  },
  components: {
    BaseTitleBar,
    InfoButton,
    FilterMonitor,
    FilterFacetBucket,
    Explorer,
  }
};
</script>

<style lang="css" scoped>
</style>
