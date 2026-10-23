<template>
  <i-layout-section main class="TopicDetailPage">
    <template #header>
      <b-navbar class="d-block py-3">
        <router-link :to="{ name: 'topics' }" class="label small-caps">
          &larr; {{ $t('topics') }}
        </router-link>
        <TopicItem v-if="topic" :topic="topic" :show-link="false" show-description class="mt-2" />
      </b-navbar>

      <ul class="nav nav-pills mx-3 mb-2">
        <li v-for="name in tabs" :key="name" class="nav-item">
          <router-link
            class="nav-link"
            :class="{ active: tab === name }"
            active-class=""
            :aria-current="tab === name ? 'page' : undefined"
            :to="{
              name: Routes.topic.name,
              params: { topic_id: topicId },
              query: { ...route.query, tab: name }
            }"
          >
            {{
              name === 'overview'
                ? $t('tabs.overview')
                : $t('tabs.relatedArticles', { count: $n(total) }, total)
            }}
          </router-link>
        </li>
      </ul>

      <b-navbar type="light" variant="light" class="px-3 py-2 border-bottom d-flex gap-2">
        <b-button size="sm" variant="outline-primary" :disabled="!topic" @click="applyFilter">
          {{ $t('actions.addToCurrentFilters') }}
        </b-button>
        <router-link v-if="topic" class="btn btn-outline-primary btn-sm" :to="searchPageLink">
          {{ $t('actions.searchMore') }}
        </router-link>
        <button v-else class="btn btn-outline-primary btn-sm" disabled>
          {{ $t('actions.searchMore') }}
        </button>
        <div v-if="tab === 'articles'" class="d-flex align-items-center gap-2">
          <label class="mb-0">{{ $t('order by') }}</label>
          <i-dropdown
            v-model="orderBy"
            :options="orderByOptions.map(option => ({ value: option.value, text: $t(option.key) }))"
            size="sm"
            variant="outline-primary"
          />
        </div>
      </b-navbar>
    </template>

    <div class="p-3 m-3 mb-5">
      <LoadingBlock v-if="isLoadingTopic" :label="$t('loading')" />
      <p v-else-if="topicError" class="alert alert-danger" role="alert">
        {{ $t('topicLoadError') }}
      </p>
      <template v-else-if="topic">
        <template v-if="tab === 'overview'">
          <h3 class="m-0 small-caps font-weight-bold">{{ $t('wordsTitle') }}</h3>
          <p class="small">{{ $t('wordsDescription') }}</p>
          <Ellipsis v-if="topic.words.length">
            <TopicWord
              v-for="(word, index) in topic.words"
              :key="`${word.w}-${index}`"
              :item="word"
            />
          </Ellipsis>
          <p v-else class="text-muted">{{ $t('noWords') }}</p>

          <h3 class="mt-4 border-top pt-3 small-caps font-weight-bold">
            {{ $t('timelineTitle') }}
          </h3>
          <p class="small">{{ $t('timelineDescription') }}</p>
          <LoadingBlock v-if="isLoadingOverview" :label="$t('loading')" />
          <p v-else-if="overviewError" class="alert alert-danger" role="alert">
            {{ $t('overviewLoadError') }}
          </p>
          <template v-else>
            <Timeline
              v-if="timevalues.length"
              :domain="yearDomain"
              :contrast="false"
              :values="timevalues"
            >
              <template #default="{ tooltip }">
                <div v-if="tooltip.item">
                  {{ tooltip.item.t }} &middot; <b>{{ tooltip.item.w ?? 0 }}</b>
                </div>
              </template>
            </Timeline>
            <p v-else class="text-muted">{{ $t('noTimeline') }}</p>
            <div class="container-fluid my-3">
              <div class="row">
                <div v-for="facet in facets" :key="facet.type" class="col-12 col-lg-6 col-xl-4">
                  <StackedBarsPanel
                    :label="facet.type"
                    :buckets="facet.buckets"
                    :facet-type="facet.type"
                  />
                </div>
              </div>
              <p v-if="!facets.some(facet => facet.buckets.length)" class="text-muted">
                {{ $t('noFacets') }}
              </p>
            </div>
          </template>
        </template>

        <template v-else>
          <LoadingBlock v-if="isLoadingArticles" :label="$t('loading')" />
          <p v-else-if="articlesError" class="alert alert-danger" role="alert">
            {{ $t('articlesLoadError') }}
          </p>
          <template v-else>
            <div v-for="item in articles" :key="item.id" class="p-3 mb-2 border-bottom">
              <ContentItem
                :content-item="item"
                show-meta
                show-date
                show-media-source
                show-topics
                show-snippet
                show-semantic-enrichments
                show-matches
                show-link
              />
            </div>
            <p v-if="!articles.length" class="text-muted">{{ $t('noArticles') }}</p>
          </template>
          <div v-if="articlesTotal && !articlesError" class="fixed-pagination-footer p-1 mb-2 m-0">
            <Pagination
              :per-page="LIMIT"
              :current-page="page"
              :total-rows="articlesTotal"
              :show-description="false"
              @change="changePage"
            />
          </div>
        </template>
      </template>
    </div>
  </i-layout-section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Topic from '@/models/Topic'
import Facet from '@/models/Facet'
import FilterFactory from '@/models/FilterFactory'
import type { FacetType, Filter, SearchFacet } from '@/models'
import { getImpressoMetadata } from '@/models/ImpressoMetadata'
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'
import { mapFilters } from '@/logic/queryParams'
import { containsFilter, serializeFilters } from '@/logic/filters'
import Helpers from '@/plugins/Helpers'
import { Routes } from '@/router/routes'
import {
  topics as topicsService,
  contentItems as contentItemsService,
  searchFacets as searchFacetsService
} from '@/services'
import LoadingBlock from '@/components/LoadingBlock.vue'
import TopicItem from '@/components/topics/TopicItem.vue'
import TopicWord from '@/components/topics/TopicWord.vue'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import Pagination from '@/components/modules/Pagination.vue'
import Ellipsis from '@/components/modules/Ellipsis.vue'
import Timeline from '@/components/modules/Timeline.vue'
import StackedBarsPanel from '@/components/modules/vis/StackedBarsPanel.vue'

export interface TopicDetailPageProps {
  facetTypes?: FacetType[]
  filters?: Filter[]
}
const props = withDefaults(defineProps<TopicDetailPageProps>(), {
  facetTypes: () => [
    'country',
    'language',
    'type',
    'person',
    'location',
    'topic',
    'partner',
    'copyright',
    'collection'
  ]
})

const route = useRoute()
const router = useRouter()
const topicId = computed(() => String(route.params.topic_id ?? ''))
const tabs = ['overview', 'articles'] as const
const tab = computed(() => (route.query.tab === 'articles' ? 'articles' : 'overview'))
const topic = ref<Topic | null>(null)
const isLoadingTopic = ref(false)
const topicError = ref(false)
const isLoadingOverview = ref(false)
const overviewError = ref(false)
const isLoadingArticles = ref(false)
const articlesError = ref(false)
const facets = ref<Facet[]>([])
const timevalues = ref<Array<{ t: number; w: number }>>([])
const yearSpan = getImpressoMetadata().impressoDocumentsYearSpan
const yearDomain = yearSpan ? [yearSpan.firstYear, yearSpan.lastYear] : undefined
const LIMIT = 10
const articles = ref<ContentItemType[]>([])
const articlesTotal = ref<number | null>(null)
const total = computed(
  () => articlesTotal.value ?? Math.max(0, topic.value?.contentItemsCount ?? 0)
)
const page = ref(1)
const orderByOptions = [
  { value: '-topicRelevance', key: 'topic.relevanceDESC' },
  { value: 'topicRelevance', key: 'topic.relevanceASC' },
  { value: 'date', key: 'article.dateASC' },
  { value: '-date', key: 'article.dateDESC' }
] as const
type TopicOrderBy = (typeof orderByOptions)[number]['value']
const articleQuery = ref<{ page: number; orderBy: TopicOrderBy }>({
  page: 1,
  orderBy: '-topicRelevance'
})
const orderBy = computed({
  get: () => articleQuery.value.orderBy,
  set: (value: TopicOrderBy) => {
    page.value = 1
    articleQuery.value = { page: 1, orderBy: value }
  }
})

const topicFilter = computed(() => FilterFactory.create({ type: 'topic', q: [topicId.value] }))
const searchPageLink = computed(() => ({
  name: Routes.search.name,
  query: { sq: serializeFilters([topicFilter.value]), p: '1' }
}))

// Adapt the legacy filter helpers without relying on an Options API instance.
const filtersMapping = mapFilters()
const filtersContext = {
  $route: route,
  $nextTick: nextTick,
  $navigation: {
    updateQueryParametersWithHistory(query: Record<string, string>) {
      return router.push({ query: { ...route.query, ...query } })
    }
  }
}
function applyFilter() {
  if (!topic.value) return
  const filters = props.filters ?? (filtersMapping.get.call(filtersContext) as Filter[])
  filtersMapping.set.call(
    filtersContext,
    filters.filter(filter => !containsFilter(topicFilter.value)(filter)).concat(topicFilter.value)
  )
}

function changePage(value: number) {
  if (!Number.isSafeInteger(value) || value < 1 || isLoadingArticles.value) return
  page.value = value
  articleQuery.value = { ...articleQuery.value, page: value }
}

watch(
  topicId,
  async (id, _, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
    })
    topic.value = null
    topicError.value = false
    articlesTotal.value = null
    page.value = 1
    articleQuery.value = { ...articleQuery.value, page: 1 }
    isLoadingTopic.value = true
    try {
      if (!id) throw new Error('Missing topic ID')
      const result = await topicsService.get(id)
      if (active) topic.value = new Topic(result)
    } catch {
      if (active) topicError.value = true
    } finally {
      if (active) isLoadingTopic.value = false
    }
  },
  { immediate: true }
)

watch(
  [topic, tab, () => props.facetTypes],
  async ([currentTopic, currentTab, facetTypes], _, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
    })
    facets.value = []
    timevalues.value = []
    overviewError.value = false
    isLoadingOverview.value = false
    if (!currentTopic || currentTab !== 'overview') return
    isLoadingOverview.value = true
    const filters: Filter[] = [{ type: 'topic', q: [currentTopic.id] }]
    try {
      const [year, ...results] = await Promise.all([
        searchFacetsService.get('year', { query: { filters, limit: 500 } }),
        ...facetTypes.map(type => searchFacetsService.get(type, { query: { filters } }))
      ])
      if (!active) return
      timevalues.value = Helpers.timeline.fromBuckets(year.buckets ?? [])
      facets.value = results.map(result => Facet.fromSearchFacet(result as unknown as SearchFacet))
    } catch {
      if (active) overviewError.value = true
    } finally {
      if (active) isLoadingOverview.value = false
    }
  },
  { immediate: true }
)

watch(
  [topic, tab, articleQuery],
  async ([currentTopic, currentTab, query], _, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
    })
    articles.value = []
    articlesError.value = false
    isLoadingArticles.value = false
    if (!currentTopic || currentTab !== 'articles') return
    isLoadingArticles.value = true
    try {
      const result = await contentItemsService.find({
        query: {
          filters: [{ type: 'topic', q: [currentTopic.id] }],
          limit: LIMIT,
          offset: (query.page - 1) * LIMIT,
          order_by: query.orderBy
        }
      })
      if (!active) return
      articles.value = result.data
      articlesTotal.value = result.pagination.total
      page.value = Math.floor(result.pagination.offset / result.pagination.limit) + 1
    } catch {
      if (active) articlesError.value = true
    } finally {
      if (active) isLoadingArticles.value = false
    }
  },
  { immediate: true }
)
</script>

<i18n lang="json">
{
  "en": {
    "wordsTitle": "List of words",
    "wordsDescription": "Top words associated with this topic",
    "timelineTitle": "Articles per year",
    "timelineDescription": "Number of articles where this topic is relevant",
    "topicLoadError": "Unable to load this topic.",
    "overviewLoadError": "Unable to load the topic overview.",
    "articlesLoadError": "Unable to load related articles.",
    "noWords": "No words available for this topic.",
    "noTimeline": "No yearly data available for this topic.",
    "noFacets": "No facets available for this topic.",
    "noArticles": "No related articles found.",
    "topic": {
      "relevanceDESC": "topic relevance (highest first)",
      "relevanceASC": "topic relevance (lowest first)"
    },
    "article": {
      "dateASC": "article date",
      "dateDESC": "article date, latest first"
    }
  }
}
</i18n>
