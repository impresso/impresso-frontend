<template>
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar>
        <section class="pt-2 pb-1">
          <span class="label small-caps">{{ $t('label_collections') }}</span>
          <h3 class="mb-1">{{ $t('label_all_' + selectedTab) }}</h3>
        </section>
      </b-navbar>
      <b-tabs pills class="mx-3">
        <template v-slot:tabs-end>
          <li
            class="nav-item pl-2"
            v-for="tab in tabs"
            :key="tab.name"
            :class="{ active: tab.name === selectedTab }"
          >
            <RouterLink class="nav-link" :to="updateCurrentRoute({ query: { tab: tab.name } })">
              <template v-if="tab.name === TabContentItems && selectedTab === TabContentItems">
                <span
                  v-if="contentItemsResponse.status === 'success'"
                  v-html="
                    $tc('numbers.contentItems', contentItemsResponse.total, {
                      n: contentItemsResponse.total
                    })
                  "
                />
                <span v-else v-html="$t('actions.loading')" />
              </template>
              <span v-else v-html="$t(tab.label)" />
            </RouterLink>
          </li>
        </template>
      </b-tabs>
    </template>
    <!-- tab:  -->
    <List
      v-if="selectedTab === TabContentItems"
      :items="contentItemsResponse.data"
      :pagination-list="contentItemsPaginationList"
      @change-page="(page: number) => (contentItemsCurrentPage = page)"
    >
      <template v-slot:header>
        <b-navbar-nav class="py-2 pl-3 ml-auto d-flex flex-row">
          <b-nav-item class="navbar-text ml-3 mr-2 text-muted small-caps">
            {{ $t('sortBy') }}
          </b-nav-item>
          <i-dropdown
            v-model="orderBy"
            :options="
              orderByOptions.map(value => ({
                value,
                text: $t(`label_sort_${value}`)
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-tertiary"
          ></i-dropdown>
        </b-navbar-nav>
      </template>

      <div class="container-fluid" v-if="contentItemsResponse.total > 0">
        <div class="row">
          <b-col
            cols="12"
            v-for="(article, index) in contentItemsResponse.data"
            v-bind:key="`${index}-${article.uid}`"
          >
            <SearchResultsListItem v-model="contentItemsResponse.data[index]" />
          </b-col>
        </div>
      </div>
      <div
        v-if="contentItemsResponse.total === 0 && contentItemsResponse.status === 'success'"
        class="p-4"
      >
        <p class="text-center pt-4">
          <b>{{ $t('no_articles_in_collection') }}</b>
        </p>
        <p class="text-center">{{ $t('no_articles_in_collection_long') }}</p>
      </div>
    </List>
    <!-- tab: overview -->
    <div v-if="selectedTab === TabOverview" class="p-3">
      <div class="mx-3">
        <div class="tb-title label small-caps font-weight-bold">
          {{ $t('label.year.optionsTitle') }}
        </div>
        <div class="small">{{ $t('label.year.optionsDescription') }}</div>
      </div>

      <Timeline
        :class="{ loading: timelineResponse.status === 'loading' }"
        :domain="[startYear, endYear]"
        :values="timelineResponse.data"
      >
        <template v-slot="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t ?? 0, 'year') }} &middot;
            <b
              v-html="
                $tc('numbers.contentItems', tooltipScope.tooltip.item.w ?? 0, {
                  n: tooltipScope.tooltip.item.w ?? 0
                })
              "
            />
          </div>
        </template>
      </Timeline>

      <b-container fluid class="my-3">
        <b-row>
          <b-col
            sm="12"
            md="12"
            lg="6"
            xl="4"
            v-for="(facet, idx) in searchFacetsResponse.data"
            v-bind:key="idx"
          >
            <StackedBarsPanel
              class=""
              :label="facet.type"
              :buckets="facet.buckets"
              :facet-type="facet.type"
            />
          </b-col>
        </b-row>
      </b-container>
    </div>
  </i-layout-section>
</template>

<script lang="ts" setup>
import Timeline from '@/components/modules/Timeline.vue'
import StackedBarsPanel from '@/components/modules/vis/StackedBarsPanel.vue'

import Helpers from '@/plugins/Helpers'
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  searchFacets as searchFacetsService,
  search as searchService,
  collectionsItems as collectableItemsService
} from '@/services'
import { useUserStore } from '@/stores/user'
import { watch } from 'vue'
import Facet from '@/models/Facet'
import List from './modules/lists/List.vue'
import SearchResultsListItem from './modules/SearchResultsListItem.vue'
import Article from '@/models/Article'

const userStore = useUserStore()

const route = useRoute()
const TabOverview = 'overview'
const TabContentItems = 'ci'

const FacetTypes = [
  'newspaper',
  'country',
  'type',
  'language',
  'person',
  'location',
  'topic',
  'partner',
  'accessRight'
]

const orderByOptions = ['-date', 'date']
const orderBy = ref(orderByOptions[0])

const collectionFilter = computed(() => {
  const collectionPrefix =
    userStore.userData && typeof userStore.userData !== 'boolean' ? userStore.userData.uid : '-'
  console.debug(
    '[CollectionExplorerPage] collectionFilter with collectionPrefix:',
    collectionPrefix
  )
  return {
    type: 'collection',
    q: collectionPrefix + '*'
  }
})

const selectedTab = computed(() => {
  return [TabOverview, TabContentItems].includes(route.query.tab as string)
    ? route.query.tab
    : TabOverview
})

const startYear = computed(() => {
  const glob: any = window
  return glob.impressoDocumentsYearSpan.firstYear
})
const endYear = computed(() => {
  const glob: any = window
  return glob.impressoDocumentsYearSpan.lastYear
})

const tabs = ref([
  {
    name: TabOverview,
    label: 'label_TabOverview'
  },
  {
    name: TabContentItems,
    label: 'label_TabContentItems'
  }
])

const updateCurrentRoute = ({ query }) => {
  return {
    ...route,
    query: {
      ...route.query,
      ...query
    }
  }
}

const timelineResponse = ref({
  data: [],
  status: 'loading'
})

const contentItemsResponse = ref<{
  data: any[] | null
  total: number
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: null,
  total: 0
})

const contentItemsCurrentPage = ref<number>(1)

const contentItemsPaginationList = computed(() => ({
  currentPage: contentItemsCurrentPage.value,
  totalRows: contentItemsResponse.value.total,
  perPage: 12
}))

const contentItemsSearchQuery = computed(() => {
  return {
    filters: [collectionFilter.value],
    limit: contentItemsPaginationList.value.perPage,
    offset: (contentItemsCurrentPage.value - 1) * contentItemsPaginationList.value.perPage,
    order_by: orderBy.value
  }
})

const fetchContentItems = async (query = {}) => {
  console.debug('[CollectionExplorerPage] fetchContentItems')
  contentItemsResponse.value = {
    status: 'loading',
    data: [],
    total: 0
  }
  const response = await searchService.find({
    query: contentItemsSearchQuery.value
  })
  if (!response) {
    contentItemsResponse.value = {
      status: 'error',
      data: [],
      total: 0
    }
    return
  }
  const contentItemsIds = response.data.map(d => d.uid)
  if (contentItemsIds.length === 0) {
    contentItemsResponse.value = {
      status: 'success',
      data: [],
      total: 0
    }
    return
  }
  const collectableItemsIndex = await collectableItemsService
    .find({
      query: {
        item_uids: contentItemsIds,
        limit: response.data.length
      }
    })
    .then(({ data }) =>
      data.reduce((acc, d) => {
        acc[d.itemId] = d
        return acc
      }, {})
    )

  contentItemsResponse.value = {
    status: 'success',
    data: response.data.map(d => {
      return new Article({
        ...d,
        collections: collectableItemsIndex[d.uid]?.collections || []
      })
    }),
    total: response.total
  }
  console.debug('[CollectionExplorerPage] fetchContentItems success', response.data)
}

const searchFacetsResponse = ref<{
  data: any[]
}>({
  data: FacetTypes.map(type => new Facet({ type }))
})
const fetchSearchFacets = async () => {
  Promise.all(
    FacetTypes.map(type =>
      searchFacetsService
        .get(type, {
          query: {
            filters: [collectionFilter.value]
          }
        })
        .then(response => {
          const facet = searchFacetsResponse.value.data.find(facet => facet.type === type)
          if (!facet) {
            console.error('[CollectionExplorerPage] fetchSearchFacets failed for type', type)
            return
          }
          console.debug('[CollectionExplorerPage] fetchSearchFacets loaded type:', type)

          facet.numBuckets = response.numBuckets
          facet.setBuckets(response.buckets)
        })
    )
  )
}

const fetchTimeline = async () => {
  const data = await searchFacetsService
    .get('year', {
      query: {
        filters: [collectionFilter.value],

        limit: 100000
      }
    })
    .then(res => Helpers.timeline.fromBuckets(res.buckets))
    .catch(err => {
      console.warn('[CollectionExplorerPage] fetchTimeline error', err)
      timelineResponse.value = {
        status: 'error',
        data: null
      }
    })
  if (data) {
    console.debug('[CollectionExplorerPage] fetchTimeline success, data:', data)
    timelineResponse.value = {
      status: 'success',
      data
    }
  }
}

watch(
  () => selectedTab.value,
  async _value => {
    console.info('[CollectionExplorerPage] selectedTab.value changed to', _value)
    if (_value === TabOverview) {
      // await fetchContentItems()

      fetchTimeline()
      fetchSearchFacets()
    } else if (_value === TabContentItems) {
      console.debug('[CollectionExplorerPage] selectedTab.value === TabContentItems')
      await fetchContentItems()
    }
  },
  { immediate: true }
)

watch(
  () => contentItemsSearchQuery.value,
  async (value, oldValue) => {
    const keyA = value ? JSON.stringify(value).split('').sort().join('') : ''
    const keyB = oldValue ? JSON.stringify(oldValue).split('').sort().join('') : ''
    if (keyA === keyB) {
      return
    }
    console.info('[CollectionExplorerPage] contentItemsSearchQuery.value changed to', value)
    await fetchContentItems()
  }
)
// load first page of articles
</script>

<i18n lang="json">
{
  "en": {
    "label_collections": "collections",
    "label_all_overview": "Overview of my collected items",
    "label_all_ci": "List of my collected Items",
    "label_TabOverview": "Overview",
    "label_TabContentItems": "Content Items",
    "label_sort_-date": "publication date, most recent first",
    "label_sort_date": "publication date, oldest first"
  }
}
</i18n>
