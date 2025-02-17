<template>
  <i-layout-section>
    <template v-slot:header>
      <b-navbar v-if="$route.params.collection_uid" type="light" variant="light">
        <section>
          <span class="label small-caps">
            <router-link
              v-bind:to="
                updateCurrentRoute({
                  name: 'collections',
                  query: {
                    tab: 'overview'
                  }
                })
              "
              >&larr; {{ $t('Collections') }}</router-link
            >
          </span>

          <h3>{{ collection.name }}</h3>
          <p>{{ collection.description }}</p>
        </section>

        <section class="ml-auto py-3 text-right">
          <router-link
            :to="
              updateCurrentRoute({
                name: 'compare',
                query: { left: `c:${$route.params.collection_uid}` }
              })
            "
            class="m-1"
          >
            <button type="button" class="btn btn-outline-info btn-sm">
              {{ $t('compare_collection') }}
            </button>
          </router-link>
          <b-dropdown
            class="m-1"
            size="sm"
            variant="outline-primary"
            :text="$t('edit_collection')"
            right
            ref="edit_collection"
          >
            <div class="modal-edit pt-2 px-3 background-light">
              <label for="collectionName">Name</label>
              <input
                type="text"
                name="collectionName"
                class="form-control mb-3"
                v-on:keyup.enter="save(collection)"
                v-model="collection.name"
              />
              <label for="collectionDesc">Description</label>
              <textarea
                type="text"
                name="collectionDesc"
                class="form-control"
                v-on:keyup.enter="save(collection)"
                v-model="collection.description"
              />
              <button
                type="button"
                class="btn btn-outline-primary btn-sm form-control my-3"
                v-on:click="save(collection)"
              >
                {{ $t('update_collection') }}
              </button>
              <button
                type="button"
                class="btn btn-outline-danger btn-sm form-control mb-3"
                v-on:click.alt="remove(collection)"
                v-on:click.exact="showConfirmDeleteModal"
              >
                {{ $t('delete_collection') }}
              </button>
            </div>
          </b-dropdown>
        </section>

        <Modal
          id="confirmDelete"
          :title="$t('delete_collection_no_option')"
          centered
          :show="isConfirmDeleteModalVisible"
          @ok="
            () => {
              console.info('[CollectionDetailPage] remove: ', collection)
              hideConfirmDeleteModal()
              remove(collection)
            }
          "
          @close="hideConfirmDeleteModal"
        >
          {{ this.$t('confirm_delete', [collection.name]) }}
        </Modal>
      </b-navbar>

      <b-navbar v-else>
        <section class="pt-2 pb-1">
          <span class="label small-caps">{{ $t('collections') }}</span>
          <h3 class="mb-1">{{ $t('all_collections_title') }}</h3>
        </section>
      </b-navbar>

      <b-tabs pills class="mx-3">
        <template v-slot:tabs-end>
          <b-nav-item
            v-for="(tabItem, i) in tabs"
            :key="i"
            class="pl-2"
            :class="{ active: tabItem.name === tab.name }"
            active-class="none"
            :to="updateCurrentRoute({ query: { tab: tabItem.name } })"
          >
            <span v-html="tabItem.label" />
          </b-nav-item>
        </template>
      </b-tabs>

      <b-navbar
        class="px-0 py-2 border-bottom"
        v-if="
          tab.name !== TAB_RECOMMENDATIONS &&
          (tab.name !== TAB_OVERVIEW || $route.params.collection_uid)
        "
      >
        <b-navbar-nav v-if="$route.params.collection_uid" class="ml-3">
          <form class="form-inline">
            <router-link class="btn btn-outline-primary btn-sm" :to="searchPageLink">
              {{ $t('actions.searchMore') }}
            </router-link>
          </form>
        </b-navbar-nav>
        <b-navbar-nav v-if="$route.params.collection_uid" class="ml-3">
          <b-button
            @click="handleExportCollection"
            size="sm"
            variant="outline-primary"
            class="d-flex align-items-center"
          >
            <div>{{ $t('label_export_csv') }}</div>
            <div class="dripicons-export ml-1"></div>
          </b-button>
          <info-button
            name="am-i-allowed-to-automatically-mass-download-newspaper-images-and-texts"
            class="float-right ml-2"
          />
        </b-navbar-nav>
        <b-navbar-nav v-if="tab.name === TAB_ARTICLES" class="ml-auto mr-2">
          <!-- <b-navbar-form class="p-2 border-right">
            <label class="mr-1">{{ $t('label_order') }}</label>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </b-navbar-form> -->
          <div class="p-2 m-auto">
            <label class="mr-1">{{ $t('label_display') }}</label>
            <radio-group
              :modelValue="displayStyle"
              @update:modelValue="displayStyle = $event"
              :options="displayStyleOptions"
              type="button"
            />
          </div>
        </b-navbar-nav>
      </b-navbar>
    </template>

    <div v-if="tab.name === TAB_ARTICLES" class="collection-group">
      <div v-if="fetching">
        <i-spinner class="text-center m-5 p-5" />
      </div>

      <b-container v-else-if="paginationTotalRows > 0" fluid>
        <b-row v-if="displayStyle === 'list'">
          <b-col
            cols="12"
            v-for="(article, index) in articles"
            v-bind:key="`${index}-${article.uid}`"
          >
            <search-results-list-item v-model="articles[index]" />
          </b-col>
        </b-row>

        <b-row class="pb-5" v-if="displayStyle === 'tiles'">
          <b-col
            cols="6"
            sm="12"
            md="4"
            lg="3"
            v-for="(article, index) in articles"
            v-bind:key="`${index}-${article.uid}`"
          >
            <!-- {{article}} -->
            <search-results-tiles-item v-if="article.type === 'ar'" v-model="articles[index]" />
            <search-results-image-item
              v-if="article.type !== 'ar'"
              v-bind:searchResult="article"
              v-model="articles[index]"
            />
          </b-col>
        </b-row>
      </b-container>

      <div v-else class="p-4">
        <p class="text-center pt-4">
          <b>{{ $t('no_articles_in_collection') }}</b>
        </p>
        <p class="text-center">{{ $t('no_articles_in_collection_long') }}</p>
      </div>

      <div class="my-5"></div>
      <div
        v-if="!fetching && paginationTotalRows > paginationPerPage"
        class="fixed-pagination-footer p-1 m-0"
      >
        <pagination
          size="sm"
          v-bind:perPage="paginationPerPage"
          v-bind:currentPage="paginationCurrentPage"
          v-bind:totalRows="paginationTotalRows"
          v-on:change="onInputPagination"
          class="float-left small-caps"
        />
      </div>
    </div>

    <div v-else-if="tab.name === TAB_OVERVIEW" class="p-3">
      <div class="mx-3">
        <div class="tb-title label small-caps font-weight-bold">
          {{ $t('label.year.optionsTitle') }}
        </div>
        <div class="small">{{ $t('label.year.optionsDescription') }}</div>
      </div>

      <timeline
        :class="{ loading: isTimelineLoading }"
        :domain="[startYear, endYear]"
        :values="timevalues"
      >
        <template v-slot="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t ?? 0, 'year') }} &middot;
            <b>{{ tooltipScope.tooltip.item.w ?? 0 }}</b>
          </div>
        </template>
      </timeline>

      <b-container fluid class="my-3">
        <b-row>
          <b-col sm="12" md="12" lg="6" xl="4" v-for="(facet, idx) in facets" v-bind:key="idx">
            <stacked-bars-panel
              class=""
              :label="facet.type"
              :buckets="facet.buckets"
              :facet-type="facet.type"
            />
          </b-col>
        </b-row>
      </b-container>
    </div>

    <div v-else-if="tab.name === TAB_RECOMMENDATIONS" class="collection-recommendations h-100">
      <collection-recommendations-panel
        :collection-id="$route.params.collection_uid"
        :display-style="displayStyle"
        :collection="collection"
        :collection-recommenders-settings="recommendersSettings"
        @settings-updated="handleRecommendersSettingsUpdated"
      >
        <template v-slot:additional-navbar>
          <b-navbar-nav class="ml-auto">
            <li class="p-2 form-inline">
              <form class="form-inline">
                <label class="mr-1">{{ $t('label_display') }}</label>
                <radio-group
                  :modelValue="displayStyle"
                  @update:modelValue="displayStyle = $event"
                  :options="displayStyleOptions"
                  type="button"
                />
              </form>
            </li>
          </b-navbar-nav>
        </template>
      </collection-recommendations-panel>
    </div>
  </i-layout-section>
</template>

<script>
import { mapStores } from 'pinia'
import { protobuf } from 'impresso-jscommons'
import Collection from '@/models/Collection'
import SearchResultsListItem from '@/components/modules/SearchResultsListItem.vue'
import SearchResultsTilesItem from '@/components/modules/SearchResultsTilesItem.vue'
import SearchResultsImageItem from '@/components/modules/SearchResultsImageItem.vue'
import Article from '@/models/Article'
import Pagination from '@/components/modules/Pagination.vue'
import SearchQuery from '@/models/SearchQuery'
import Facet from '@/models/Facet'
import Timeline from '@/components/modules/Timeline.vue'
import StackedBarsPanel from '@/components/modules/vis/StackedBarsPanel.vue'
import { mapFilters } from '@/logic/queryParams'
import { containsFilter } from '@/logic/filters'
import CollectionRecommendationsPanel from '@/components/modules/collections/CollectionRecommendationsPanel.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import { getQueryParameter } from '../router/util'
import {
  exporter as exporterService,
  collections as collectionsService,
  searchFacets as searchFacetsService,
  search as searchService,
  collectionsItems as collectionsItemsService
} from '@/services'
import RadioGroup from '@/components/layout/RadioGroup.vue'
import Modal from '@/components/base/Modal.vue'
import { useCollectionsStore } from '@/stores/collections'
import { useSettingsStore } from '@/stores/settings'
import { Navigation } from '@/plugins/Navigation'

const QueryParameters = Object.freeze({
  RecommendersSettings: 'rs',
  PaginationCurrentPage: 'p'
})

const TAB_ARTICLES = 'articles'
const TAB_OVERVIEW = 'overview'
const TAB_RECOMMENDATIONS = 'recommendations'

export default {
  data: () => ({
    tab: {},
    articles: [],
    collection: new Collection(),
    fetching: false,
    isTimelineLoading: false,
    paginationPerPage: 10,
    paginationTotalRows: 0,
    TAB_ARTICLES,
    TAB_OVERVIEW,
    TAB_RECOMMENDATIONS,
    timevalues: [],
    facets: [],
    facetTypes: [
      'newspaper',
      'country',
      'type',
      'language',
      'person',
      'location',
      'topic',
      'partner',
      'accessRight'
    ],
    isConfirmDeleteModalVisible: false
  }),
  components: {
    SearchResultsListItem,
    SearchResultsTilesItem,
    SearchResultsImageItem,
    Pagination,
    Timeline,
    StackedBarsPanel,
    CollectionRecommendationsPanel,
    InfoButton,
    RadioGroup,
    Modal
  },
  computed: {
    ...mapStores(useCollectionsStore, useSettingsStore),
    $navigation() {
      return new Navigation(this)
    },
    displayStyleOptions() {
      return [
        { value: 'list', text: this.$t('display_button_list') },
        { value: 'tiles', text: this.$t('display_button_tiles') }
      ]
    },
    collectionUid() {
      return this.$route.params.collection_uid
    },
    paginationCurrentPage() {
      return parseInt(this.$route.query[QueryParameters.PaginationCurrentPage], 10) || 1
    },
    startYear() {
      return window.impressoDocumentsYearSpan.firstYear
    },
    endYear() {
      return window.impressoDocumentsYearSpan.lastYear
    },
    filters: mapFilters(),
    searchPageLink() {
      if (!this.collection) {
        return {
          name: 'search',
          query: SearchQuery.serialize({
            filters: [{ type: 'collection', q: 'local-dg-*' }]
          })
        }
      }
      return {
        name: 'search',
        query: SearchQuery.serialize({
          filters: [{ type: 'collection', q: this.collection.uid }]
        })
      }
    },
    collections: {
      get() {
        return this.collectionsStore.collections
      }
    },
    displayStyle: {
      get() {
        const style = this.settingsStore.searchDisplayStyle
        if (['list', 'tiles'].includes(style)) {
          return style
        }
        return 'list'
      },
      set(displayStyle) {
        this.settingsStore.updateSearchDisplayStyle(displayStyle)
      }
    },
    tabs() {
      const mainTabs = [
        {
          label: this.$t('tabs.overview'),
          name: TAB_OVERVIEW
        },
        {
          label: this.$tc('tabs.articles', this.paginationTotalRows, {
            count: this.$n(this.paginationTotalRows)
          }),
          name: TAB_ARTICLES
        }
      ]
      const recommendationsTab = {
        label: this.$t('tabs.recommendations'),
        name: TAB_RECOMMENDATIONS
      }
      return this.$route.params.collection_uid != null
        ? mainTabs.concat([recommendationsTab])
        : mainTabs
    },
    recommendersSettings: {
      /** @returns {import('impresso-jscommons').CollectionRecommendersSettings|undefined} */
      get() {
        const settingsString = getQueryParameter(this, QueryParameters.RecommendersSettings)
        return protobuf.collectionRecommendersSettings.deserialize(settingsString || '')
      },
      /** @param {import('impresso-jscommons').CollectionRecommendersSettings} val */
      set(val) {
        const settingsString = protobuf.collectionRecommendersSettings.serialize(val)
        this.$navigation.updateQueryParameters({
          [QueryParameters.RecommendersSettings]: settingsString
        })
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler({ query, params }) {
        // set active tab
        const tabIdx = this.tabs.findIndex(d => d.name === query.tab)
        this.tab = tabIdx !== -1 ? this.tabs[tabIdx] : this.tabs[0]
        // load collection
        if (params.collection_uid) {
          this.fetching = true
          this.collection = await collectionsService
            .get(this.collectionUid)
            .then(collection => new Collection(collection))
          this.fetching = false
        }
        this.loadCollectionItems()
        if (this.tab.name === TAB_OVERVIEW) {
          this.loadTimeline()
          this.facets = []
          for (const type of this.facetTypes) {
            this.facets.push(await this.loadFacets(type))
          }
        }
      }
    }
  },
  methods: {
    showConfirmDeleteModal() {
      this.isConfirmDeleteModalVisible = true
    },
    hideConfirmDeleteModal() {
      this.isConfirmDeleteModalVisible = false
    },
    handleExportCollection() {
      exporterService.create(
        {
          description: this.collectionUid
        },
        {
          query: {
            group_by: 'articles',
            filters: [
              {
                type: 'collection',
                q: [this.collectionUid]
              }
            ],
            format: 'csv'
          }
        }
      )
    },
    handleRecommendersSettingsUpdated(settings) {
      this.recommendersSettings = settings
    },
    updateCurrentRoute(route) {
      return {
        ...route,
        query: {
          ...this.$route.query,
          ...route.query
        }
      }
    },
    async loadCollectionItems() {
      this.fetching = true
      const query = {
        resolve: 'item',
        page: this.paginationCurrentPage,
        limit: this.paginationPerPage
        // TODO Uncomment the following line when service is ready
        // order_by: context.state.orderBy,
      }
      if (this.collectionUid) {
        query.collection_uids = [this.collectionUid]
      }

      const collectionsItems = await collectionsItemsService
        .find({ query })
        .then(({ data, total }) => {
          console.debug('[CollectionDetailPage] loadCollectionItems() success. Data:', data)
          this.paginationTotalRows = total
          return data
        })

      const collectionsItemsById = collectionsItems.reduce((acc, item) => {
        acc[item.itemId] = item
        return acc
      }, {})

      const articles = await searchService
        .find({
          query: {
            filters: [
              {
                type: 'uid',
                q: collectionsItems.map(d => d.itemId)
              }
            ],

            group_by: 'articles'
          }
        })
        .then(({ data }) =>
          data.map(d => {
            return new Article({
              ...d,
              collections: collectionsItemsById[d.uid].collections
            })
          })
        )
      this.articles = articles
      this.fetching = false
    },
    gotoArticle(article) {
      if (
        article?.issue == null ||
        [null, '', undefined].includes(article?.issue?.uid) ||
        [null, '', undefined].includes(article?.uid)
      ) {
        console.error('No issue to go to page')
        return
      }
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: article.issue.uid,
          page_number: article.pages[0]?.num,
          page_uid: article.pages[0]?.uid,
          article_uid: article.uid
        }
      })
    },
    remove(collection) {
      this.collectionsStore
        .deleteCollection(collection.uid)
        .then(() => this.collectionsStore.loadCollections())
        .then(() => this.$router.push({ name: 'collections' }))
    },
    save(collection) {
      if (collection.uid) {
        this.collectionsStore
          .editCollection({
            uid: collection.uid,
            name: collection.name,
            description: collection.description
          })
          .then(res => {
            const idx = this.collections.findIndex(c => c.uid === res.uid)
            if (idx >= 0 && this.collections[idx]) {
              this.collections[idx].name = res.name
              this.collections[idx].description = res.description
            }
          })
      } else {
        this.collectionsStore
          .addCollection({
            name: collection.name,
            description: collection.description
          })
          .then(res => {
            this.fetch().then(() => {
              this.select(new Collection(res.data)) // select the newly created item
            })
          })
      }
      this.$refs.edit_collection.hide(true)
    },
    sortBy(data, field) {
      data.sort((a, b) => {
        if (a[field] < b[field]) {
          return 1
        } else if (a[field] > b[field]) {
          return -1
        }
        return 0
      })
      return data
    },
    onInputPagination(p = 1) {
      this.$navigation.updateQueryParametersWithHistory({
        [QueryParameters.PaginationCurrentPage]: p
      })
    },
    applyFilter() {
      const newFilter = {
        type: 'collection',
        q: this.collection.uid
      }
      this.filters = this.filters.filter(f => !containsFilter(newFilter)(f)).concat([newFilter])
    },
    loadTimeline() {
      this.isTimelineLoading = true
      return this.collectionsStore.loadTimeline(this.$route.params.collection_uid).then(values => {
        this.timevalues = values
        this.isTimelineLoading = false
      })
    },
    loadFacets(type) {
      return searchFacetsService
        .get(type, {
          query: {
            filters: [
              {
                type: 'collection',
                q: this.collectionUid
              }
            ]
            // group_by: 'articles',
          }
        })
        .then(type => new Facet(type))
    }
  }
}
</script>

<style lang="scss">
.modal-edit {
  min-width: 400px;
}
.collection-recommendation {
  overflow: hidden;
}
.loading {
  opacity: 0.5;
}
</style>

<i18n lang="json">
{
  "en": {
    "collections": "collections",
    "all_collections_title": "All items in my collections",
    "label_order": "Order By",
    "label_export_csv": "export collection...",
    "sort_date": "Item Date",
    "sort_dateAdded": "Date Added",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "label_display": "Display As",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "articles": "No article | <b>1</b> article | <b>{n}</b> articles",
    "edit_collection": "Edit collection",
    "update_collection": "Update Collection Note",
    "delete_collection": "Delete Collection [alt/option to bypass confirmation]",
    "delete_collection_no_option": "Delete Collection",
    "compare_collection": "Compare with ...",
    "confirm_delete": "Are you sure you want to delete collection '{0}'?",
    "no_articles_in_collection": "No items in collection yet.",
    "no_articles_in_collection_long": "Articles you add to collection will be listed here."
  },
  "nl": {
    "collections": "Sammelingen",
    "confirm_delete": "Weet je zeker dat je wilt verwijderen?"
  }
}
</i18n>
