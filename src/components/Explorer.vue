<template lang="html">
  <b-modal v-on:hidden="$emit(events.Hide)"
          :id="id"
          ref="facet-explorer-modal"
          class="facet-explorer-modal">
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
          {{ availableType }}
        </b-button>
        <div>
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
      </div>
    </template>
    <div v-if='isLoading'
         class="position-absolute w-100 h-100"
         style="z-index:1; left:-1px; background:rgba(255,255,255,0.8)">
      <i-spinner class="text-center pt-4" />
    </div>
    <facet-explorer :filter-type="currentType"
                    :buckets="buckets"
                    v-model="filter"
                    class="my-0 mb-3 px-2"/>
      <div v-if="totalResults > pageSize" class="p-3">
        <div
          class="fixed-pagination-footer mb-2 p-1">
          <pagination v-model="currentPageModel"
                      v-bind:perPage="pageSize"
                      v-bind:totalRows="totalResults"
                      v-bind:showDescription="false"/>
        </div>
      </div>
    <template v-slot:modal-footer>
      <!--  Pagination -->
      <b-button variant="outline-primary"
                size="sm"
                block
                @click="closeDialog">
        {{ $t('actions.close') }}
      </b-button>
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
import Pagination from './modules/Pagination';
import Bucket from '@/models/Bucket';

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
  pageSize,
}) {
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
      group_by: 'articles',
      filters: filters,
      page: currentPage,
      limit: pageSize,
      order_by: '-count',
    };
    const response = await searchFacets.get(type, { query })
    const result = response[0]
    return {
      totalResults: result.numBuckets,
      buckets: result.buckets.map(d => new Bucket({
        ...d,
        type
      }))
    }
  }
}

const AllSupportedFilterTypes = [
  'location', 'country', 'person', 'language',
  'topic', 'newspaper', 'collection', 'year', 'month',
]

export default {
  model: {
    prop: 'filters',
    event: 'changed'
  },
  data: () => ({
    /** @type {string} */
    id: undefined,
    events: Events,
    currentType: 'person',
    searchQuery: undefined,
    currentPage: 1,
    totalResults: 0,
    buckets: [],
    isLoading: false,
    pageSize: PageSize
  }),
  props: {
    /** @type {import('vue').PropType<import('../models/models').Filter[]>} */
    filters: Array,
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
    }
  },
  methods: {
    openDialog() { this.$bvModal.show(this.id) },
    closeDialog() { this.$bvModal.hide(this.id) },
    handleTypeChange(type) { this.currentType = type },
    async search() {
      if (!this.isVisible) return
      try {
        this.isLoading = true
        const { totalResults, buckets } = await search(this.searchParameters)
        this.totalResults = totalResults
        this.buckets = buckets
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
      return AllSupportedFilterTypes;
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
  .facet-explorer-modal {
    .modal-body{
      padding: 0;
    }
  }
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
      }
    }
  }
</i18n>
