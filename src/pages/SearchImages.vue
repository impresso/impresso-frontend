<template>
  <i-layout class="search-images">
    <search-sidebar
      width="400px"
      :filters="filters"
      :ignored-filters="ignoredFilters"
      :facets="facets"
      :excludedTypes="excludedTypes"
      contextTag="search-images"
      @changed="handleFiltersChanged"
    >
      <template v-slot:header>
        <div
          v-if="similarToImage"
          class="image-item-similar p-2 mb-3 bg-white drop-shadow border border-tertiary d-flex"
        >
          <div class="flex-shrink-1 mr-2" style="width: 100px">
            <!-- <img
              v-if="similarToImage.regions.length"
              style="max-height: 100px"
              v-bind:src="similarToImage.regions[0].iiifFragment"
            /> -->
            <auth-img
              v-if="similarToImage.previewUrl"
              style="max-height: 100px"
              v-bind:src="similarToImage.previewUrl"
            />
          </div>
          <div class="align-self-center">
            <!-- <router-link
              block
              :to="{ name: 'newspaper', params: { newspaper_uid: similarToImage.newspaper.uid } }"
              class="article-newspaper"
            >
              {{ similarToImage.newspaper.name }}
            </router-link> -->
            <router-link
              v-if="similarToImage?.mediaSourceRef"
              block
              :to="{
                name: 'newspaper',
                params: { newspaper_uid: similarToImage?.mediaSourceRef?.uid }
              }"
              class="article-newspaper"
            >
              {{ similarToImage.mediaSourceRef.name }}
            </router-link>
            <p class="date m-0">{{ $d(similarToImage.date, 'long') }}</p>
          </div>
          <div class="flex-shrink-1 ml-auto">
            <b-button
              pill
              class="ml-2 dripicons-cross"
              variant="outline-danger"
              size="sm"
              v-on:click.prevent="onRemoveSimilarTo"
            >
            </b-button>
          </div>
        </div>
        <filter-image-upload v-if="enableUpload" />
        <search-input @submit="onSearchQuery"></search-input>
      </template>
      <b-form-group class="mx-3">
        <b-form-checkbox v-model="isFront" switch>
          {{ $t('label.isFront') }}
        </b-form-checkbox>
      </b-form-group>
    </search-sidebar>

    <i-layout-section main>
      <!-- header -->
      <template v-slot:header>
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="p-2 border-right">
            <li class="form-inline">
              <form class="form-inline">
                <!-- <b-form-group class="ml-2 mr-3">
                <b-form-checkbox v-model="applyRandomPage" switch>
                  {{ $t('label_applyRandomPage') }}
                </b-form-checkbox>
                </b-form-group> -->
                <b-button size="sm" variant="outline-primary" v-on:click="loadRandomPage">{{
                  $t('actions.loadRandomPage')
                }}</b-button>
              </form>
            </li>
          </b-navbar-nav>
        </b-navbar>
        <b-navbar type="light" variant="light" class="border-bottom py-0 px-3">
          <b-navbar-nav class="border-right flex-grow-1 py-2">
            <ellipsis v-if="!isLoading" v-bind:initialHeight="60">
              <search-results-summary
                group-by="images"
                :searchQuery="{ filters }"
                :totalRows="paginationTotalRows"
              />
            </ellipsis>
            <span v-else>{{ $t('actions.loading') }}</span>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto pl-2" v-if="!similarToImage">
            <label class="mr-1">{{ $t('label_order') }}</label>
            <i-dropdown
              v-model="orderBy"
              v-bind:options="orderByOptions"
              size="sm"
              variant="outline-primary"
              class="pl-1"
            ></i-dropdown>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto pl-2" v-else>
            <label class="mr-1">{{ $t('label_order') }}</label>
            <b class="small-caps font-weight-bold">{{ $t('sort_by_similarity') }}</b>
          </b-navbar-nav>
        </b-navbar>
      </template>

      <!--  body -->
      <div class="p-1 my-2">
        <div class="card-group row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4">
          <div class="mb-3" v-for="searchResult in searchResults" :key="searchResult.uid">
            <search-results-image-item
              class="mx-1"
              :item="searchResult"
              :enable-checkbox="false"
              :enable-similar-to="enableSimilarTo"
              @toggleSelected="toggleSelected"
              :isChecked="isChecked(searchResult)"
              @click:search="onClickSearch"
            />
          </div>
        </div>
        <div
          v-if="paginationTotalRows && paginationCurrentPage > 0"
          class="fixed-pagination-footer p-1 m-0"
        >
          <pagination
            v-bind:perPage="paginationPerPage"
            :current-page="paginationCurrentPage"
            @change="$event => (paginationCurrentPage = $event)"
            v-bind:totalRows="paginationTotalRows"
            class="float-left small-caps"
          />
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script lang="ts">
import AuthImg from '@/components/AuthImg.vue'
import { searchQueryGetter, searchQuerySetter } from '@/logic/queryParams'
import { serializeFilters } from '@/logic/filters'
import { buildEmptyFacets } from '@/logic/facets'
import {
  images as imagesService,
  searchFacetsImages as searchFacetsImagesService
} from '@/services'
import FilterImageUpload from '@/components/modules/FilterImageUpload.vue'
import SearchResultsImageItem from '@/components/modules/SearchResultsImageItem.vue'
import Pagination from '@/components/modules/Pagination.vue'
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import Ellipsis from '@/components/modules/Ellipsis.vue'
import SearchInput from '@/components/modules/SearchInput.vue'
import FilterFactory from '@/models/FilterFactory'
import SearchQuery from '@/models/SearchQuery'
import FacetModel from '@/models/Facet'
import { useUserStore } from '@/stores/user'
import { mapStores } from 'pinia'
import { Navigation } from '@/plugins/Navigation'
import { defineComponent, PropType } from 'vue'
import { IImage, Filter } from '@/models'

const AllowedFilterTypes = ['newspaper', 'isFront', 'daterange', 'title']

const AllowedFacetTypes = ['newspaper', 'year']

interface IData {
  q: string
  isLoading: boolean
  selectedItems: IImage[]
  allIndeterminate: boolean
  allSelected: boolean
  similarToImage: IImage | null
  searchResults: IImage[]
  paginationTotalRows: number
  facets: FacetModel[]
}

export default defineComponent({
  props: {
    enableUpload: Boolean,
    enableSimilarTo: {
      type: Boolean,
      default: true
    },
    filtersWithItems: {
      type: Array as PropType<Filter[]>,
      default: () => []
    }
  },
  components: {
    SearchResultsImageItem,
    Pagination,
    SearchInput,
    SearchResultsSummary,
    Ellipsis,
    FilterImageUpload,
    SearchSidebar,
    AuthImg
  },
  data(): IData {
    return {
      q: '',
      isLoading: false,
      selectedItems: [],
      allIndeterminate: false,
      allSelected: false,
      similarToImage: null,
      searchResults: [],
      paginationTotalRows: 0,
      /** @type {Facet[]} */
      facets: []
    }
  },
  mounted() {
    this.facets = buildEmptyFacets(AllowedFacetTypes) as FacetModel[]
  },
  computed: {
    ...mapStores(useUserStore),
    $navigation() {
      return new Navigation(this)
    },
    searchQuery: {
      ...searchQueryGetter(),
      ...searchQuerySetter({
        additionalQueryParams: {
          p: 1 as any as string
        }
      })
    },
    seed() {
      return this.$route.query.seed || 0
    },
    /**
     * Filters not used for searching images
     */
    ignoredFilters() {
      return this.searchQuery.filters.filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /**
     * Filters used for searching images
     */
    filters() {
      return this.filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
    },
    /** @returns {string[]} */
    excludedTypes() {
      return this.filters.map(d => d.type)
    },
    similarToImageUid: {
      get() {
        return this.$route.query.similarTo
      },
      set(similarTo) {
        const qp = { p: 1, similarTo: null }
        if (similarTo && similarTo.length) {
          qp.similarTo = similarTo
        }
        this.$navigation.updateQueryParametersWithHistory(qp)
      }
    },
    isFront: {
      get() {
        return this.filters.some(({ type }) => type === 'isFront')
      },
      set(val) {
        this.handleFiltersChanged(
          this.filters
            .filter(d => d.type !== 'isFront')
            .concat(val ? [FilterFactory.create({ type: 'isFront' })] : [])
        )
      }
    },
    orderByOptions: {
      get() {
        return [
          {
            value: '-date',
            text: `${this.$t('sort_date')} ${this.$t('sort_desc')}`
          },
          {
            value: 'date',
            text: `${this.$t('sort_date')} ${this.$t('sort_asc')}`
          }
        ]
      },
      set(val) {}
    },
    orderBy: {
      get() {
        return this.$route.query.orderBy ?? '-date'
      },
      set(orderBy) {
        this.$navigation.updateQueryParametersWithHistory({
          orderBy
        })
      }
    },
    paginationCurrentPage: {
      get() {
        return parseInt(new String(this.$route.query.p ?? 0).valueOf(), 10)
      },
      set(p) {
        this.$navigation.updateQueryParametersWithHistory({
          p: isNaN(p) ? 1 : p
        })
      }
    },
    paginationPerPage: {
      get() {
        return Math.min(
          12,
          Math.max(parseInt(new String(this.$route.query.limit ?? 1).valueOf()), 50)
        )
      },
      set(limit) {
        this.$navigation.updateQueryParametersWithHistory({
          limit
        })
      }
    },
    isLoggedIn() {
      return this.userStore.userData
    },
    serviceQuery: {
      get() {
        return {
          seed: this.seed,
          similarTo: this.similarToImageUid,
          filters: this.filters,
          // groupBy: this.groupBy,
          orderBy: this.orderBy,
          limit: this.paginationPerPage,
          page: this.paginationCurrentPage
        }
      },
      set(val) {}
    }
  },
  methods: {
    handleFiltersChanged(filters) {
      console.info('@handleFiltersChanged', filters)
      // add back ignored filters so that we can reuse them in other views
      this.searchQuery = new SearchQuery({
        filters: filters.concat(this.ignoredFilters)
      })
    },
    reset() {
      this.searchQuery = new SearchQuery({
        filters: this.ignoredFilters
      })
    },
    onSummary(msg) {
      // this.inputDescription = msg
      //   .replace(/<(?:.|\n)*?>/gm, '') // strip html tags
      //   .replace('Found', this.$t('Based on search query with'))
    },
    onSuggestion(filter) {
      this.handleFiltersChanged(this.filters.concat([filter]))
    },
    updateselectAll() {
      let count = 0
      this.searchResults.forEach(item => {
        if (this.itemSelected(item)) {
          count += 1
        }
      })
      if (count === 0) {
        this.allSelected = false
        this.allIndeterminate = false
      } else if (count < this.searchResults.length) {
        this.allSelected = false
        this.allIndeterminate = true
      } else {
        this.allSelected = true
        this.allIndeterminate = false
      }
    },
    itemSelected(item) {
      return this.selectedItems.findIndex(c => c.uid === item.uid) !== -1
    },
    addSelectedItem(item) {
      if (!this.itemSelected(item)) {
        this.selectedItems.push(item)
      }
    },
    removeSelectedItem(item) {
      if (this.itemSelected(item)) {
        const idx = this.selectedItems.findIndex(c => c.uid === item.uid)
        this.selectedItems.splice(idx, 1)
      }
    },
    toggleSelected(item) {
      if (!this.itemSelected(item)) {
        this.selectedItems.push(item)
      } else {
        const idx = this.selectedItems.findIndex(c => c.uid === item.uid)
        this.selectedItems.splice(idx, 1)
      }
    },
    toggleSelectAll(checked) {
      if (checked) {
        this.searchResults.forEach(item => {
          this.addSelectedItem(item)
        })
      } else {
        this.searchResults.forEach(item => {
          this.removeSelectedItem(item)
        })
      }
    },
    isChecked(item) {
      return this.selectedItems.findIndex(c => c.uid === item.uid) !== -1
    },
    onClearSelection() {
      this.selectedItems = []
    },
    onClickSearch(image) {
      console.info('.onClickSearch, image:', image)
      this.similarToImageUid = image.uid
    },
    onRemoveSimilarTo() {
      console.info('onRemoveSimilarTo')
      this.similarToImageUid = ''
    },
    onSearchQuery({ q = '' }) {
      console.info('onSearchQuery:', q)
      this.handleFiltersChanged(
        this.filters.concat(q.trim().length ? [FilterFactory.create({ type: 'title', q })] : [])
      )
    },
    loadRandomPage() {
      this.$navigation.updateQueryParametersWithHistory({
        p: 0
      })
    }
  },
  watch: {
    searchResults() {
      this.updateselectAll()
    },
    selectedItems() {
      this.updateselectAll()
    },
    similarToImageUid: {
      handler(uid) {
        console.info('similarToImage', uid)
        if (uid) {
          imagesService.get(uid).then(res => {
            // this.similarToImage = new Image(res)
            this.similarToImage = res as IImage
          })
        } else {
          this.similarToImage = null
        }
      },
      immediate: true
    },
    serviceQuery: {
      async handler({ page, limit, filters, orderBy, similarTo }) {
        this.isLoading = true

        const serializedFilters = serializeFilters(filters)
        const query: Record<string, any> = {
          filters: serializedFilters,
          order_by: orderBy,
          limit
        }
        if (page > 0) {
          // query.page = page
          query.offset = (page - 1) * limit
        } else {
          // query.randomPage = 'true'
        }
        if (similarTo) {
          // query.similarTo = similarTo
          query.similar_to_image_id = similarTo
        }
        console.info('@serviceQuery query:', query)
        const [
          res, // { offset, limit, total, data, info },
          facets
        ] = await Promise.all([
          imagesService.find({
            query
          }),
          searchFacetsImagesService.find({
            query: {
              filters: serializedFilters,
              facets: AllowedFacetTypes
            }
          })
        ])
        this.paginationTotalRows = res.pagination.total
        this.searchResults = res.data //.map(d => new Image(d))
        this.paginationCurrentPage = Math.round(res.offset / res.limit) + 1

        // const facets = searchResponseToFacetsExtractor(AllowedFacetTypes)(res)
        this.facets = facets.data.map(f => new FacetModel(f))
        // this.facets = []

        setTimeout(() => {
          this.isLoading = false
        }, 1000)
      },
      immediate: true
    }
  }
})
</script>

<style lang="scss" scoped>
.image-item-similar {
  font-size: 14px;
  .article-newspaper {
    font-weight: bold;
  }
  .date {
    text-transform: lowercase;
    font-variant: small-caps;
  }
}
.btn.rounded-pill {
  height: 1.5rem;
  width: 1.5rem;
  text-align: center;
  padding: 0;
  line-height: 1.7rem;
}
.card-columns {
  column-count: 1;
}
@media (min-width: 960px) {
  .card-columns {
    column-count: 2;
  }
}
@media (min-width: 1200px) {
  .card-columns {
    column-count: 3;
  }
}
@media (min-width: 1400px) {
  .card-columns {
    column-count: 4;
  }
}
@media (min-width: 1800px) {
  .card-columns {
    column-count: 5;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "label_order": "Order By",
    "label_isFront": "Frontpage",
    "label_applyRandomPage": "start with random results page",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_date": "Date",
    "sort_by_similarity": "similarity",
    "sort_relevance": "Relevance",
    "items_selected": "One item selected | {count} items selected",
    "clear_selection": "Clear Selection",
    "add_n_to_collection": "Add item to collection | Add {count} items to collection",
    "select_all": "Select all items on this page"
  }
}
</i18n>
