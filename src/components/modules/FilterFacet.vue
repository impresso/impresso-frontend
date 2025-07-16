<template>
  <div class="filter-facet" :data-testid="`facet-filter-${facet.type}`">
    <base-title-bar>
      {{ $t(`label.${facet.type}.filterTitle`) }}
      <span
        v-if="facet.numBuckets > -1"
        v-html="
          $tc('numbers.options', facet.numBuckets, {
            n: $n(facet.numBuckets)
          })
        "
      />
      <info-button
        class="ml-1"
        v-if="infoButtonId || facet.type === 'person' || facet.type === 'location'"
        :target="facet.type"
        :name="infoButtonId || 'what-is-nep'"
      />
      <info-button v-if="facet.type === 'newspaper'" name="which-newspapers" class="ml-1" />
      <info-button v-if="facet.type === 'topic'" name="how-to-read-the-topics" class="ml-1" />
      <template v-slot:options>
        <b-button v-show="isFiltered" size="sm" variant="outline-primary" @click="resetFilters">
          {{ $t(`actions.reset`) }}
        </b-button>
        <b-button
          v-if="isCollapsible"
          size="sm"
          variant="outline-icon"
          @click="toggleVisibility"
          data-testid="expand-collapse-button"
        >
          <span
            class="icon-link"
            :class="{ 'dripicons-plus': isCollapsed, 'dripicons-minus': !isCollapsed }"
          ></span>
        </b-button>
      </template>
      <template v-slot:description>
        <div v-if="isFiltered" v-html="$t(`label.${facet.type}.filtered`)" />
        <div v-else-if="selectedBucketsIds.length">
          <span v-html="$t(`label.${facet.type}.selected`, { count: selectedBucketsIds.length })" />
        </div>
        <div v-else>
          <span v-if="isLoading">
            {{ $t('actions.loading') }}
          </span>
          <span v-else-if="!isLoading && !facet.buckets.length">
            {{ $t(`label.${facet.type}.empty`) }}
          </span>
          <!-- <span v-else>
            {{ $t(`label.${facet.type}.description`) }}
          </span> -->
        </div>
      </template>

      <!-- .description -->
    </base-title-bar>
    <LazyObserver v-if="lazy" :delay="lazyDelay" @onIntersect="onIntersectHandler" />
    <div
      v-for="{ filter, filterIndex } in includedFilterItems"
      :key="filterIndex"
      class="p-2 bg-white border rounded shadow-sm my-2"
    >
      <filter-monitor
        :items-to-add="selectedBucketsItems"
        :filter="filter"
        :operators="facet.operators"
        @changed="filter => updateFilter(filterIndex, filter)"
        @removed="filter => removeFilter(filterIndex, filter)"
      />
    </div>
    <div
      v-for="{ filter, filterIndex } in excludedFilterItems"
      :key="filterIndex"
      class="p-2 bg-white border rounded shadow-sm my-2"
    >
      <filter-monitor
        :filter="filter"
        :operators="facet.operators"
        @changed="filter => updateFilter(filterIndex, filter)"
        @removed="filter => removeFilter(filterIndex, filter)"
      />
    </div>
    <div v-if="showBuckets" class="pt-2" data-testid="facet-buckets">
      <filter-facet-bucket
        v-for="bucket in unfilteredBuckets"
        :key="bucket.val"
        :loading="isLoading"
        :bucket="bucket"
        :type="facet.type"
        :search-index="searchIndex"
        @toggle-bucket="toggleBucket"
      />
      <filter-facet-bucket
        v-for="bucket in additionalBuckets"
        :key="bucket.val"
        :loading="isLoading"
        :bucket="bucket"
        :type="facet.type"
        :search-index="searchIndex"
        @toggle-bucket="toggleBucket"
      />
      <b-button
        v-if="facet.numBuckets > 0 && countMissingBuckets"
        size="sm"
        variant="outline-secondary"
        class="mt-2 mr-1 rounded shadow-sm"
        @click="loadMoreBuckets"
      >
        <span v-if="isMoreLoading" v-html="$t('actions.loading')" />
        <span v-else>
          {{ $t('actions.more') }}
          <span
            v-html="
              $tc('numbers.moreOptions', countMissingBuckets, {
                n: $n(countMissingBuckets)
              })
            "
          />
        </span>
      </b-button>
    </div>
    <div
      class="d-flex mt-2 position-sticky bg-light bottom-0"
      v-if="selectedBucketsIds.length && !isFiltered"
    >
      <b-button size="sm" variant="outline-primary" class="w-100 mt-1 mb-2" @click="createFilter">
        {{ $t(`actions.apply`) }}
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import BaseTitleBar from '@/components/base/BaseTitleBar.vue'
import FilterFacetBucket from '@/components/modules/FilterFacetBucket.vue'
import FilterMonitor from '@/components/modules/FilterMonitor.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import { toSerializedFilter } from '@/logic/filters'
import BucketModel from '@/models/Bucket'
import { getSearchFacetsService } from '@/services'
import LazyObserver from '../LazyObserver.vue'
import { defineComponent, PropType } from 'vue'
import type { Facet, Filter, Bucket } from '@/models'
import FacetModel from '@/models/Facet'

export interface IData {
  isCollapsed: boolean
  selectedBucketsIds: string[]
  selectedBucketsItems: any[]
  limit: number
  offset: number
  additionalBuckets: Bucket[]
  isMoreLoading: boolean
  lazyIsPristine: boolean
}

export default defineComponent({
  name: 'FilterFacet',
  /**
   * Model is a list of 0 or more filters of the same type (type
   * that matches the facet type). Model is changed whenver:
   * - filters are modified
   * - new filter is created (the model was an empty array before)
   * - filters were removed (the model contained at least one filter but became an empty array)
   */
  data: (): IData =>
    ({
      isCollapsed: true,
      selectedBucketsIds: [],
      selectedBucketsItems: [],
      //
      limit: 10,
      offset: 0,
      additionalBuckets: [],
      isMoreLoading: false,
      lazyIsPristine: true
    }) satisfies IData,
  props: {
    lazy: Boolean,
    lazyDelay: {
      type: Number,
      default: 100
    },
    searchIndex: {
      type: String,
      default: 'search'
    },
    facet: Object as PropType<Facet>,
    facetFilters: {
      type: Array as PropType<Filter[]>,
      default: () => []
    },
    /* filters used to narrow down the search for new facet filters option in explorer */
    contextFilters: {
      type: Array as PropType<Filter[]>,
      default: () => []
    },
    isLoading: Boolean,
    collapsible: Boolean,
    infoButtonId: String
  },
  computed: {
    showBuckets() {
      // if it is filtered, always show
      if (this.isFiltered || this.isCollapsible === false) {
        return true
      }
      return this.isCollapsible ? !this.isCollapsed : true
    },
    isCollapsible() {
      return this.collapsible && !this.isFiltered
    },
    isFiltered() {
      if (this.contextFilters.length) {
        return this.contextFilters.some(filter => filter.type === this.facet.type)
      }
      return this.facetFilters.length
    },
    includedFilterItems() {
      if (!this.facetFilters.length) {
        return []
      }
      // add count if selected items is in one of the buckets.
      return this.facetFilters
        .map((filter, filterIndex) => ({ filter, filterIndex }))
        .filter(({ filter: { context } }) => context === 'include')
        .map(({ filter, filterIndex }) => ({
          filter: {
            ...filter,
            items: filter.items.map(item => {
              if (this.bucketsIndex[item.uid]) {
                return {
                  ...this.bucketsIndex[item.uid].item,
                  ...item,
                  count: this.bucketsIndex[item.uid].count
                }
              }
              return item
            })
          },
          filterIndex
        }))
    },
    /**
     * List items ids included into current filters.
     * @return {Array} array of items uids
     */
    filtersIncludedItemsIds() {
      return this.includedFilterItems.reduce(
        (acc, { filter }) => acc.concat(Array.isArray(filter.q) ? filter.q : [filter.q]),
        []
      )
    },
    excludedFilterItems() {
      return this.facetFilters
        .map((filter, filterIndex) => ({ filter, filterIndex }))
        .filter(({ filter: { context } }) => context === 'exclude')
    },
    bucketsIndex() {
      const index = {}
      this.facet.buckets.forEach(({ item, count }) => {
        index[item.uid] = { count, item }
      })
      return index
    },
    /**
     * List facet buckets NOT included in a filter
     * @return {Array} array of buckets
     */
    unfilteredBuckets() {
      if (!this.isFiltered || !this.includedFilterItems) {
        return this.facet.buckets
      }
      return this.facet.buckets.filter(b => !this.filtersIncludedItemsIds.includes(b.val))
    },
    countMissingBuckets() {
      return this.facet.numBuckets - this.additionalBuckets.length - this.facet.buckets.length
    }
  },
  methods: {
    toggleVisibility() {
      this.isCollapsed = !this.isCollapsed
    },
    toggleAllVisibleBuckets() {
      if (this.selectedBucketsIds.length) {
        this.clearSelectedItems()
      } else {
        this.selectedBucketsIds = this.unfilteredBuckets.map(b => String(b.val))
        this.selectedBucketsItems = this.unfilteredBuckets.map(b => ({
          checked: true,
          ...b.item,
          count: b.count
        }))
      }
    },
    toggleBucket(bucket) {
      const idx = this.selectedBucketsIds.indexOf(bucket.val)
      if (idx !== -1 && !bucket.checked) {
        // remove.
        this.selectedBucketsIds.splice(idx, 1)
        this.selectedBucketsItems.splice(idx, 1)
      } else if (idx === -1 && bucket.checked) {
        // add.
        this.selectedBucketsIds.push(bucket.val)
        if (bucket.item) {
          this.selectedBucketsItems.push({
            checked: true,
            ...bucket.item,
            count: bucket.count
          })
        }
      } // nothing else matters
    },
    resetFilters() {
      console.info('[FilterFacet] resetFilters')
      this.$emit('changed', [])
    },
    removeFilter(filterIndex, filter) {
      console.info('[FilterFacet] removeFilter', filter)
      this.$emit(
        'changed',
        this.facetFilters.filter((f, index) => index !== filterIndex)
      )
    },
    updateFilter(filterIndex, filter) {
      const oldFilter = this.facetFilters[filterIndex]

      if (toSerializedFilter(filter) !== toSerializedFilter(oldFilter)) {
        if (!filter.q || filter.q.length === 0) {
          const newFilters = this.facetFilters.filter((f, index) => index !== filterIndex)
          this.$emit('changed', newFilters)
        } else {
          this.clearSelectedItems()
          const newFilters = this.facetFilters.map((f, index) => {
            if (index === filterIndex) return filter
            return f
          })
          this.$emit('changed', newFilters)
        }
      }
    },
    createFilter() {
      this.$emit(
        'changed',
        this.facetFilters.concat([
          {
            type: this.facet.type,
            q: this.selectedBucketsIds,
            items: this.selectedBucketsItems
          }
        ])
      )
      this.clearSelectedItems()
    },
    clearSelectedItems() {
      this.selectedBucketsIds = []
      this.selectedBucketsItems = []
    },
    loadMoreBuckets() {
      if (this.isMoreLoading) {
        console.warn('facet is busy loading')
        return
      }
      this.isMoreLoading = true
      getSearchFacetsService(this.searchIndex)
        .get(this.facet.type, {
          query: {
            filters: this.contextFilters,
            limit: this.limit,
            offset: this.offset
          }
        })
        .then(({ numBuckets, buckets }) => {
          console.info('loadMoreBuckets', buckets, this.offset)
          this.additionalBuckets = this.additionalBuckets.concat(
            buckets.map(
              d =>
                new BucketModel({
                  ...d,
                  type: this.facet.type
                })
            )
          )
          this.offset = this.additionalBuckets.length + this.facet.buckets.length
          // eslint-disable-next-line vue/no-mutating-props
          this.facet.numBuckets = numBuckets
        })
        .catch(err => {
          console.error(err)
        })
        .then(() => {
          this.isMoreLoading = false
        })
    },
    onIntersectHandler() {
      if (this.lazyIsPristine) {
        console.debug('[FilterFacet] @onIntersect type:', this.facet.type)
        this.lazyIsPristine = false
        // load initial buckets
        getSearchFacetsService(this.searchIndex)
          .get(this.facet.type, {
            query: {
              filters: this.contextFilters,
              limit: this.limit,
              offset: this.offset
            }
          })
          .then(({ numBuckets, buckets }) => {
            // eslint-disable-next-line vue/no-mutating-props
            this.facet.numBuckets = numBuckets
            if (this.facet instanceof FacetModel) {
              this.facet.setBuckets(buckets)
            } else {
              // eslint-disable-next-line vue/no-mutating-props
              this.facet.buckets = buckets as Bucket[]
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
    }
  },
  watch: {
    facet: {
      deep: true,
      immediate: true,
      handler({ buckets = [] } = {}) {
        // set or reset initial skip (it resets additionalBuckets lists)
        this.offset = buckets.length
        this.additionalBuckets = []
      }
    }
  },
  components: {
    BaseTitleBar,
    InfoButton,
    FilterMonitor,
    FilterFacetBucket,
    LazyObserver
  }
})
</script>

<style lang="css" scoped></style>

<i18n lang="json">
{
  "en": {
    "clearSelection": "Clear selection ({selected})",
    "selectAll": "Select all ({count})"
  }
}
</i18n>
