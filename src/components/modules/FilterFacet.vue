<template>
  <div class="filter-facet" :data-testid="`facet-filter-${facet.type}`">
    <base-title-bar>
      {{ $t(`label.${facet.type}.filterTitle`) }}
      <span
        v-if="facet.numBuckets > -1"
        v-html="
          $t('numbers.options', {
            n: $n(facet.numBuckets)
          }, facet.numBuckets)
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
        @changed="onMonitorChanged(filterIndex, $event)"
        @removed="onMonitorRemoved(filterIndex, $event)"
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
        @changed="onMonitorChanged(filterIndex, $event)"
        @removed="onMonitorRemoved(filterIndex, $event)"
      />
    </div>
    <div v-if="showBuckets" class="pt-2" data-testid="facet-buckets">
      <filter-facet-bucket
        v-for="bucket in unfilteredBuckets"
        :key="bucket.value"
        :loading="isLoading"
        :bucket="bucket"
        :type="facet.type"
        :search-index="searchIndex"
        @toggle-bucket="toggleBucket"
      />
      <filter-facet-bucket
        v-for="bucket in additionalBuckets"
        :key="bucket.value"
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
              $t('numbers.moreOptions', {
                n: $n(countMissingBuckets)
              }, countMissingBuckets)
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
import InfoButton from '@/components/base/InfoButton.vue'
import FilterFacetBucket from '@/components/modules/FilterFacetBucket.vue'
import FilterMonitor from '@/components/modules/FilterMonitor.vue'
import { toSerializedFilter } from '@/logic/filters'
import type { Bucket, Entity, Facet, Filter, FilterWithItems } from '@/models'
import BucketModel from '@/models/Bucket'
import FacetModel from '@/models/Facet'
import { getSearchFacetsService } from '@/services'
import { defineComponent, PropType } from 'vue'
import LazyObserver from '../LazyObserver.vue'

type BucketWithChecked = Bucket & { checked?: boolean }
type SearchFacetResponse = {
  numBuckets: number
  buckets: Bucket[]
}
type SelectedBucketItem = Entity & {
  name?: string
  checked?: boolean
  count?: number
}
type FacetWithBuckets = {
  buckets?: Bucket[]
}
type BucketFilterTuple = {
  filter: FilterWithItems<Entity>
  filterIndex: number
}
type BucketIndexItem = {
  count: number
  item?: Entity
}
type BucketIndex = Record<string, BucketIndexItem>

export interface IData {
  isCollapsed: boolean
  selectedBucketsIds: string[]
  selectedBucketsItems: SelectedBucketItem[]
  limit: number
  offset: number
  additionalBuckets: Bucket[]
  isMoreLoading: boolean
  lazyIsPristine: boolean
}

export default defineComponent({
  name: 'FilterFacet',
  emits: {
    changed: (filters: Filter[]) => true
  },
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
    facet: {
      type: Object as PropType<Facet>,
      required: true
    },
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
    showBuckets(): boolean {
      // if it is filtered, always show
      if (this.isFiltered || this.isCollapsible === false) {
        return true
      }
      return this.isCollapsible ? !this.isCollapsed : true
    },
    isCollapsible(): boolean {
      return this.collapsible && !this.isFiltered
    },
    isFiltered(): boolean {
      if (this.contextFilters.length) {
        return this.contextFilters.some((filter: Filter) => filter.type === this.facet.type)
      }
      return this.facetFilters.length > 0
    },
    includedFilterItems(): BucketFilterTuple[] {
      if (!this.facetFilters.length) {
        return []
      }
      // add count if selected items is in one of the buckets.
      return this.facetFilters
        .map((filter: Filter, filterIndex: number): BucketFilterTuple => ({ filter, filterIndex }))
        .filter(({ filter: { context } }: BucketFilterTuple) => context === 'include')
        .map(({ filter, filterIndex }: BucketFilterTuple) => {
          const filterItems = filter.items || []
          return {
            filter: {
              ...filter,
              items: filterItems.map((item: Entity) => {
                if (this.bucketsIndex[item.id]) {
                  return {
                    ...this.bucketsIndex[item.id].item,
                    ...item,
                    count: this.bucketsIndex[item.id].count
                  } as Entity
                }
                return item
              })
            },
            filterIndex
          } as BucketFilterTuple
        })
    },
    /**
     * List items ids included into current filters.
     * @return {Array} array of items ids
     */
    filtersIncludedItemsIds(): string[] {
      return this.includedFilterItems.reduce(
        (acc: string[], { filter }: { filter: Filter }) =>
          acc.concat(Array.isArray(filter.q) ? filter.q : filter.q ? [filter.q] : []),
        []
      )
    },
    excludedFilterItems(): BucketFilterTuple[] {
      return this.facetFilters
        .map((filter: Filter, filterIndex: number): BucketFilterTuple => ({ filter, filterIndex }))
        .filter(({ filter: { context } }: BucketFilterTuple) => context === 'exclude')
    },
    bucketsIndex(): BucketIndex {
      const index: BucketIndex = {}
      this.facet.buckets.forEach(({ item, count }: Bucket) => {
        if (item?.id) {
          index[item.id] = { count, item }
        }
      })
      return index
    },
    /**
     * List facet buckets NOT included in a filter
     * @return {Array} array of buckets
     */
    unfilteredBuckets(): Bucket[] {
      if (!this.isFiltered || !this.includedFilterItems) {
        return this.facet.buckets
      }
      return this.facet.buckets.filter(
        (bucket: Bucket) => !this.filtersIncludedItemsIds.includes(String(bucket.value))
      )
    },
    countMissingBuckets(): number {
      const numBuckets = typeof this.facet.numBuckets === 'number' ? this.facet.numBuckets : 0
      return numBuckets - this.additionalBuckets.length - this.facet.buckets.length
    }
  },
  methods: {
    toggleVisibility(): void {
      this.isCollapsed = !this.isCollapsed
    },
    toggleAllVisibleBuckets(): void {
      if (this.selectedBucketsIds.length) {
        this.clearSelectedItems()
      } else {
        this.selectedBucketsIds = this.unfilteredBuckets.map(b => String(b.value))
        this.selectedBucketsItems = this.unfilteredBuckets.map(bucket => {
          if (bucket.item) {
            return {
              ...bucket.item,
              id: bucket.item.id || String(bucket.value),
              checked: true,
              count: bucket.count,
              label: bucket.item.label ?? bucket.label
            }
          }
          return {
            id: String(bucket.value),
            name: bucket.label ?? String(bucket.value),
            label: bucket.label ?? String(bucket.value),
            checked: true,
            count: bucket.count
          }
        })
      }
    },
    toggleBucket(bucket: BucketWithChecked): void {
      const bucketValue = String(bucket.value)
      const idx = this.selectedBucketsIds.indexOf(bucketValue)
      if (idx !== -1 && !bucket.checked) {
        // remove.
        this.selectedBucketsIds.splice(idx, 1)
        this.selectedBucketsItems.splice(idx, 1)
      } else if (idx === -1 && bucket.checked) {
        // add.
        this.selectedBucketsIds.push(bucketValue)
        if (bucket.item) {
          this.selectedBucketsItems.push({
            checked: true,
            ...bucket.item,
            id: bucket.item.id || bucketValue,
            count: bucket.count
          })
        }
      } // nothing else matters
    },
    resetFilters(): void {
      console.info('[FilterFacet] resetFilters')
      this.$emit('changed', [])
    },
    removeFilter(filterIndex: number, filter: Filter): void {
      console.info('[FilterFacet] removeFilter', filter)
      this.$emit(
        'changed',
        this.facetFilters.filter((f: Filter, index: number): boolean => index !== filterIndex)
      )
    },
    onMonitorChanged(filterIndex: number, filter: Filter): void {
      this.updateFilter(filterIndex, filter)
    },
    onMonitorRemoved(filterIndex: number, filter: Filter): void {
      this.removeFilter(filterIndex, filter)
    },
    updateFilter(filterIndex: number, filter: Filter): void {
      const oldFilter = this.facetFilters[filterIndex]

      if (toSerializedFilter(filter) !== toSerializedFilter(oldFilter)) {
        if (!filter.q || filter.q.length === 0) {
          const newFilters = this.facetFilters.filter(
            (f: Filter, index: number): boolean => index !== filterIndex
          )
          this.$emit('changed', newFilters)
        } else {
          this.clearSelectedItems()
          const newFilters = this.facetFilters.map((f: Filter, index: number): Filter => {
            if (index === filterIndex) return filter
            return f
          })
          this.$emit('changed', newFilters)
        }
      }
    },
    createFilter(): void {
      const newFilter: FilterWithItems<Entity> = {
        type: this.facet.type as Filter['type'],
        q: this.selectedBucketsIds,
        items: this.selectedBucketsItems
      }
      this.$emit('changed', this.facetFilters.concat([newFilter]))
      this.clearSelectedItems()
    },
    clearSelectedItems(): void {
      this.selectedBucketsIds = []
      this.selectedBucketsItems = []
    },
    loadMoreBuckets(): void {
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
        .then(({ numBuckets, buckets }: SearchFacetResponse) => {
          console.info('loadMoreBuckets', buckets, this.offset)
          this.additionalBuckets = this.additionalBuckets.concat(
            buckets.map(
              (d: Bucket) =>
                new BucketModel({
                  ...d,
                  value: String(d.value),
                  type: this.facet.type,
                  item: d.item ?? {
                    id: String(d.value),
                    label: d.label ?? String(d.value),
                    name: d.label ?? String(d.value)
                  }
                })
            )
          )
          this.offset = this.additionalBuckets.length + this.facet.buckets.length
          // eslint-disable-next-line vue/no-mutating-props
          this.facet.numBuckets = numBuckets
        })
        .catch((err: Error) => {
          console.error(err)
        })
        .then(() => {
          this.isMoreLoading = false
        })
    },
    onIntersectHandler(): void {
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
          .then(({ numBuckets, buckets }: SearchFacetResponse) => {
            // eslint-disable-next-line vue/no-mutating-props
            this.facet.numBuckets = numBuckets
            if (this.facet instanceof FacetModel) {
              this.facet.setBuckets(buckets)
            } else {
              // eslint-disable-next-line vue/no-mutating-props
              this.facet.buckets = buckets as Bucket[]
            }
          })
          .catch((err: Error) => {
            console.error(err)
          })
      }
    }
  },
  watch: {
    facet: {
      deep: true,
      immediate: true,
      handler(newFacet: FacetWithBuckets = {}): void {
        const { buckets = [] } = newFacet
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

<style lang="css" scoped>
.filter-facet :deep([data-testid='expand-collapse-button'] .dripicons-plus::before) {
  transform: translate(0.02em, 0.02em);
}
</style>

<i18n lang="json">
{
  "en": {
    "clearSelection": "Clear selection ({selected})",
    "selectAll": "Select all ({count})"
  }
}
</i18n>
