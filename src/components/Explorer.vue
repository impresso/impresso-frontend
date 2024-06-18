<template>
  <Modal :id="id" :show="isModalVisible" body-class="p-0" @close="$emit(events.Hide)">
    <template v-slot:modal-header="{ titleId, close }">
      <div>
        <div class="tb-title small-caps font-weight-bold" :id="titleId">{{ $t('explore') }}</div>
        <b-button v-for="(availableType, i) in typeOptions" v-bind:key="i" class="mr-1 mt-1" variant="outline-primary"
          size="sm" v-on:click="handleTypeChange(availableType)"
          v-bind:class="{ 'active': currentType === availableType }">
          {{ $t(`labels.${availableType}`) }}
        </b-button>
        <div class="small mt-2">
          <span v-if="isLoading">{{ $t('loading') }}</span>
          <span v-else v-html="$tc(`description.${searchingEnabled ? 'search' : 'facets'}`, totalResults, {
            searchQuery,
          })"></span>
        </div>
        <form v-if="searchingEnabled" v-on:submit.prevent="search" class="mt-2">
          <div class="input-group">
            <b-form-input :placeholder="$tc('searchField.placeholder', totalResults)" v-model.trim="searchQueryModel"
              autofocus />
            <div class="input-group-append">
              <button type="button" class="btn btn-outline-primary pt-2 pb-1 px-2" v-on:click="search">
                <div class="search-submit dripicons-search"></div>
              </button>
            </div>
          </div>
        </form>

      </div>
      <div class="ml-auto">
        <b-button pill class="dripicons-cross px-0" variant="outline-danger" style="width:1.5em; height:1.5em" size="sm"
          v-on:click.prevent="close">
        </b-button>
      </div>

    </template>
    <!-- .modal-body -->
    <div class="bg-light">
      <div v-if='isLoading' class="position-absolute w-100 h-100"
        style="z-index:1; left:-1px; background:rgba(255,255,255,0.8)">
        <i-spinner class="text-center pt-4" />
      </div>
      <facet-explorer v-if="!RangeFacets.includes(currentType)" :filter-type="currentType" :buckets="buckets"
        v-model="filter">
        <template v-slot:pagination>
          <pagination :current-page="currentPageModel" @change="$event => currentPageModel = $event"
            v-bind:perPage="pageSize" v-bind:totalRows="totalResults" v-bind:showDescription="false" />
        </template>
      </facet-Explorer>
      <range-facet-explorer class="p-3" v-if="NumericRangeFacets.includes(currentType)" :filter-type="currentType"
        :buckets="buckets" :range="range" v-model="filter" />
      <time-facet-explorer v-if="TimeRangeFacets.includes(currentType)" v-model="filter" :filter-type="currentType"
        :buckets="buckets" />
    </div><!-- .modal-body -->
    <!-- footer -->
    <template v-slot:modal-footer="{ close }">
      <b-button @click="close()" size="sm" variant="outline-primary">{{ $t('actions.close') }}</b-button>
    </template>
  </Modal>
</template>

<script>
import {
  entities,
  topics,
  newspapers,
  collections,
  getSearchFacetsService
} from '@/services'
import Modal from '@/components/base/Modal.vue'
import FacetExplorer from './modules/FacetExplorer.vue';
import TimeFacetExplorer from './modules/TimeFacetExplorer.vue';
import RangeFacetExplorer from './modules/RangeFacetExplorer.vue';
import Pagination from './modules/Pagination.vue';
import Bucket from '@/models/Bucket';
import { NumericRangeFacets, RangeFacets, TimeRangeFacets } from '@/logic/filters'

const TypeToServiceMap = Object.freeze({
  person: entities,
  location: entities,
  topic: topics,
  newspaper: newspapers,
  collection: collections
})

const PageSize = 20

const Events = Object.freeze({
  Hide: 'onHide'
})

function buildEntitySearchQuery(page, limit, type, q) {
  const query = {
    page,
    limit
  }

  if (type === 'person') {
    query.filters = [{
      type: 'type',
      q: 'Person',
    }];
  } else if (type === 'location') {
    query.filters = [{
      type: 'type',
      q: 'Location',
    }];
  }
  if (q != null && q.length > 0) {
    query.q = q
  }
  return query
}

async function search({
  searchingEnabled,
  filters,
  type,
  searchQuery,
  currentPage,
  pageSize
}, index) {
  const service = TypeToServiceMap[type]
  if (searchingEnabled) {
    const query = buildEntitySearchQuery(currentPage, pageSize, type, searchQuery)
    const response = await service.find({ query })
    return {
      totalResults: response.total,
      buckets: response.data.filter(d => d.uid.length).map(item => new Bucket({
        val: item.uid,
        item,
        type,
      }))
    }
  } else {
    const query = {
      filters: filters,
      page: currentPage,
      limit: pageSize,
      order_by: '-count',
    };
    const response = await getSearchFacetsService(index).get(type, { query })
    const result = response
    return {
      totalResults: result.numBuckets,
      buckets: result.buckets.map(d => new Bucket({
        ...d,
        type
      })),
      range: Number.isFinite(result.min) && Number.isFinite(result.max)
        ? [result.min, result.max] : undefined
    }
  }
}

const AllSupportedFilterTypes = [
  'location', 'country', 'person', 'language',
  'topic', 'newspaper', 'collection', 'year', 'month',
  'textReuseClusterSize', 'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta', 'daterange'
]

const DefaultFilterTypes = [
  'location', 'country', 'person', 'language',
  'topic', 'newspaper', 'collection', 'year', 'month'
]

export default {
  data: () => ({
    /** @type {string | undefined} */
    id: undefined,
    events: Events,
    currentType: 'person',
    searchQuery: undefined,
    currentPage: 1,
    totalResults: 0,
    buckets: [],
    range: [],
    isLoading: false,
    isTimelineLoading: false,
    pageSize: PageSize,
    RangeFacets,
    NumericRangeFacets,
    TimeRangeFacets,
    isModalVisible: false,
  }),
  props: {
    /** @type {import('vue').PropOptions<import('@/models').Filter[]>} */
    modelValue: {
      type: Array,
      default: () => []
    },
    searchingEnabled: {
      type: Boolean,
      default: false
    },
    // Only used when "searchingEnabled" is on
    initialSearchQuery: String,
    isVisible: Boolean,
    initialType: String,
    includedTypes: {
      type: Array,
      default: () => undefined
    },
    index: {
      type: String,
      default: 'search'
    }
  },
  emits: ['update:modelValue'],
  methods: {
    openDialog() {
      this.isModalVisible = true
    },
    closeDialog() {
      this.isModalVisible = false
    },
    handleTypeChange(type) { this.currentType = type },
    async search() {
      if (!this.isVisible) return
      try {
        this.buckets = []
        this.isLoading = true
        const { totalResults, buckets, range } = await search(this.searchParameters, this.index)
        this.totalResults = totalResults
        this.buckets = buckets
        if (range != null) this.range = range
      } finally {
        this.isLoading = false
      }
    }
  },
  computed: {
    filters() { return this.modelValue },
    filter: {
      get() {
        return this.filters.find(({ type }) => type === this.currentType)
      },
      /** @param {import('../models/models').Filter} filter */
      set(filter) {
        const index = this.filters.findIndex(({ type }) => type === filter.type)
        const updatedFilters = [...this.filters]
        if (index >= 0) updatedFilters[index] = filter
        else updatedFilters.push(filter)

        this.$emit('modelValue:updated', updatedFilters)
        this.closeDialog()
      }
    },
    currentPageModel: {
      get() { return this.currentPage },
      set(val) { this.currentPage = val }
    },
    searchQueryModel: {
      get() { return this.searchQuery },
      set(q) { this.searchQuery = q }
    },
    typeOptions() {
      if (this.includedTypes) {
        return this.includedTypes.filter(type => AllSupportedFilterTypes.includes(type))
      }
      if (this.searchingEnabled) {
        return ['newspaper', 'person', 'location', 'topic', 'collection'];
      }
      return DefaultFilterTypes;
    },
    searchParameters() {
      const {
        filters,
        searchingEnabled,
        currentType: type,
        searchQuery,
        currentPage,
        pageSize
      } = this
      return {
        filters,
        searchingEnabled,
        type,
        searchQuery,
        currentPage,
        pageSize
      }
    }
  },
  mounted() {
    this.id = `facet-explorer-modal-${this._uid}`
  },
  components: {
    FacetExplorer,
    Pagination,
    RangeFacetExplorer,
    TimeFacetExplorer,
    Modal,
  },
  watch: {
    searchParameters: {
      async handler() { return this.search() },
      immediate: true
    },
    isVisible: {
      async handler() {
        if (!this.isVisible) return this.closeDialog()
        this.openDialog()
        return this.search()
      },
      immediate: true
    },
    initialSearchQuery: {
      handler() {
        this.searchQuery = this.initialSearchQuery
      },
      immediate: true
    },
    currentType() { this.currentPage = 1 },
    initialType: {
      handler() {
        if (this.initialType == null) {
          this.currentType = this.typeOptions[0]
        } else {
          this.currentType = this.initialType
        }
      },
      immediate: true
    }
  },
};
</script>

<style lang="scss"></style>

<i18n lang="json">{
  "en": {
    "explore": "refine",
    "description": {
      "search": "It looks like there are <b>no available options</b> matching for type: | ... Just <b>one</b> option mathing for type:| Select among<b> {count}</b> options matching {q} for type:",
      "facets": "It looks like there are <b>no available options</b> using current search for type: | ... Just <b>one</b> option to refine your search for type:| Select among<b> {count}</b> options to refine your search for type:"
    },
    "searchField": {
      "placeholder": "...|There is only one choice...|Search one of {n} available choices",
      "notAvailable": "...|There is only one choice:|Pick one of the <span class='number'>{n}</span> available choiches:"
    },
    "labels": {
      "daterange": "by date",
      "location": "location",
      "country": "country",
      "person": "person",
      "language": "language",
      "topic": "topic",
      "newspaper": "newspaper",
      "collection": "collection",
      "year": "year",
      "month": "month",
      "textReuseClusterSize": "cluster size",
      "textReuseClusterLexicalOverlap": "cluster lexical overlap",
      "textReuseClusterDayDelta": "cluster span in days"
    }
  }
}</i18n>
