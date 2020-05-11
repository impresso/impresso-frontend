<template lang="html">
  <b-modal v-on:hidden="$emit(events.Hide)"
          :id="id"
          ref="facet-explorer-modal"
          body-class="p-0">
    <template v-slot:modal-header class="mt-2 mr-0">
      <div>
        <div class="tb-title small-caps font-weight-bold">{{ $t('explore') }}</div>
        <div class="small mb-1">
          <span v-if="isLoading">{{ $t('loading') }}</span>
          <span v-else v-html="$tc(`description.${searchingEnabled ? 'search' : 'facets'}`, totalResults, {
            searchQuery,
          })"></span>
        </div>
        <b-button v-for="(availableType, i) in typeOptions" v-bind:key="i"
                  class="mr-1 mt-1"
                  variant="outline-primary" size="sm"
                  v-on:click="handleTypeChange(availableType)"
                  v-bind:class="{ 'active' : currentType === availableType }">
          {{ $t(`labels.${availableType}`) }}
        </b-button>
        <form v-if="searchingEnabled" v-on:submit.prevent="search" class="mt-2">
          <b-input-group>
            <b-form-input :placeholder="$tc('searchField.placeholder', totalResults)"
                          v-model.trim="searchQueryModel"
                          autofocus/>
            <b-input-group-append>
              <b-btn class="pt-2 pb-1 px-2"
                      variant="outline-primary"
                      v-on:click="search">
                <div class="search-submit dripicons-search"></div>
              </b-btn>
            </b-input-group-append>
          </b-input-group>
        </form>

      </div>
      <div class="ml-auto">
        <b-button pill class="dripicons-cross px-0" variant="outline-danger"
          style="width:1.5em; height:1.5em"
          size="sm" v-on:click.prevent="closeDialog">
        </b-button>
      </div>

    </template>
    <!-- .modal-body -->
    <div class="bg-light">
      <div v-if='isLoading'
           class="position-absolute w-100 h-100"
           style="z-index:1; left:-1px; background:rgba(255,255,255,0.8)">
        <i-spinner class="text-center pt-4" />
      </div>
      <facet-explorer v-if="!RangeFacets.includes(currentType)"
                      :filter-type="currentType"
                      :buckets="buckets"
                      v-model="filter"
                      />
      <range-facet-explorer v-if="RangeFacets.includes(currentType)"
                      :filter-type="currentType"
                      :buckets="buckets"
                      :range="range"
                      v-model="filter"
                      />
    </div>

    <!-- footer -->
    <template v-slot:modal-footer>
      <div class="mt-3 mb-1 m-0 border-top">
        <!--  Pagination -->
        <div v-if="totalResults > pageSize" class="small">
          <div class="fixed-pagination-footer mb-2 p-1">
            <pagination v-model="currentPageModel"
                        v-bind:perPage="pageSize"
                        v-bind:totalRows="totalResults"
                        v-bind:showDescription="false"/>
          </div>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import {
  entities,
  topics,
  newspapers,
  collections,
  searchFacets
} from '@/services'
import FacetExplorer from './modules/FacetExplorer';
import RangeFacetExplorer from './modules/RangeFacetExplorer';
import Pagination from './modules/Pagination';
import Bucket from '@/models/Bucket';
import { RangeFacets } from '@/logic/filters'

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
      index
    };
    const response = await searchFacets.get(type, { query })
    const result = response[0]
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
  'textReuseClusterDayDelta'
]

const DefaultFilterTypes = [
  'location', 'country', 'person', 'language',
  'topic', 'newspaper', 'collection', 'year', 'month'
]

export default {
  model: {
    prop: 'filters',
    event: 'changed'
  },
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
    pageSize: PageSize,
    RangeFacets
  }),
  props: {
    /** @type {import('vue').PropOptions<import('@/models').Filter[]>} */
    filters: {
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
  methods: {
    openDialog() { this.$bvModal.show(this.id) },
    closeDialog() { this.$bvModal.hide(this.id) },
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

        this.$emit('changed', updatedFilters)
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

<style lang="scss">

</style>

<i18n>
  {
    "en": {
      "description": {
        "search": "It looks like there are <b>no available options</b> matching for type: | ... Just <b>one</b> option mathing for type:| Select among<b> {count}</b> options matching {q} for type:",
        "facets": "It looks like there are <b>no available options</b> using current search for type: | ... Just <b>one</b> option to refine your search for type:| Select among<b> {count}</b> options to refine your search for type:"
      },
      "searchField": {
        "placeholder": "...|There is only one choice...|Search one of {n} available choices",
        "notAvailable": "...|There is only one choice:|Pick one of the <span class='number'>{n}</span> available choiches:"
      },
      "labels": {
        "location": "location",
        "country": "country",
        "person": "person",
        "language": "language",
        "topic": "topic",
        "newspaper": "newspaper",
        "collection": "collection",
        "year": "year",
        "month": "month",
        "textReuseClusterSize": "text reuse cluster size",
        "textReuseClusterLexicalOverlap": "text reuse cluster lexical overlap",
        "textReuseClusterDayDelta": "text reuse cluster span in days"
      }
    }
  }
</i18n>
