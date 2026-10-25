<template>
  <i-layout-section main width="auto">
    <template v-slot:header>
      <div class="container-xxl">
        <div class="row">
          <PageNavbarHeading :label="$t('topics')" :title="topic?.label" class="w-100" hideBorder>
            <template #default>
              <template v-if="topic">
                <h4 class="font-size-inherit">
                  <span class="badge badge-light small-caps mr-2">
                    {{ topic.language }}
                  </span>
                  <span>{{ topic.longLabel ? `(${topic.longLabel})` : '' }}</span>
                </h4>

                <TopicItem
                  :topic="topic"
                  :show-link="false"
                  :show-model="false"
                  show-description
                  :showLanguage="false"
                  :show-id="true"
                  :showTitle="false"
                  class="mt-2"
                /> </template
            ></template>

            <template #actions>
              <div v-if="topic?.id" class="d-flex gap-2">
                <OpenInSearchButton :filters="[{ type: 'topic', q: topic?.id }]" />
              </div>
            </template>
          </PageNavbarHeading>
        </div>
        <div class="row mt-2">
          <div>
            <ul class="nav nav-pills">
              <li v-for="name in tabs" :key="name" class="nav-item pl-2">
                <router-link
                  class="nav-link"
                  :class="{ active: tab === name }"
                  active-class=""
                  :aria-current="tab === name ? 'page' : undefined"
                  :to="{
                    name: Routes.topics.children.topic.name,
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
          </div>
        </div>
      </div>
    </template>
    <router-view :item="topic" :listFilters="filters" />
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

          <SearchFacetTimeline
            class="mt-4 border-top pt-3"
            facetType="year"
            searchIndex="search"
            :title="$t('contentItemOverTime.title')"
            height="85px"
            :filters="filters"
          >
            <template #afterHeader>
              <p class="small mb-2" v-html="$t('contentItemOverTime.description')"></p>
            </template>
            <template #tooltip="{ tooltip }">
              <div v-if="tooltip?.item">
                {{ $d(tooltip.item.t, 'year') }}
                &middot;
                <span
                  v-html="
                    $t('numbers.contentItems', { n: $n(tooltip.item.w || 0) }, tooltip.item.w || 0)
                  "
                />
              </div>
            </template>
          </SearchFacetTimeline>
          <LoadingBlock v-if="isLoadingOverview" :label="$t('loading')" />
          <p v-else-if="overviewError" class="alert alert-danger" role="alert">
            {{ $t('overviewLoadError') }}
          </p>

          <ItemOverview v-else :item="topic" :listFilters="filters" />
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
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'
import { mapFilters } from '@/logic/queryParams'
import { containsFilter, serializeFilters } from '@/logic/filters'
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
import ItemOverview from '@/components/ItemOverview.vue'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import OpenInSearchButton from '@/components/OpenInSearchButton.vue'
import SearchFacetTimeline from '@/components/SearchFacetTimeline.vue'

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

const tabs = ['overview', 'articles'] as const
const tab = computed(() => (route.query.tab === 'articles' ? 'articles' : 'overview'))
const topic = ref<Topic | null>(null)

const isLoadingTopic = ref(false)
const topicError = ref(false)
const isLoadingOverview = ref(false)
const overviewError = ref(false)
const isLoadingArticles = ref(false)
const articlesError = ref(false)
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

const filters = computed<Filter[]>(() => [
  {
    type: 'topic',
    q: topic.value?.id || ''
  }
])

function changePage(value: number) {
  if (!Number.isSafeInteger(value) || value < 1 || isLoadingArticles.value) return
  page.value = value
  articleQuery.value = { ...articleQuery.value, page: value }
}

async function fetchTopic(): Promise<Topic | void> {
  isLoadingTopic.value = true
  topicError.value = false
  try {
    const response = await topicsService.get(route.params.topic_id as string)
    topic.value = response
  } catch (err) {
    console.error('Error fetching topic:', err)
    topicError.value = true
  } finally {
    isLoadingTopic.value = false
  }
}
watch(() => route.params.topic_id, fetchTopic, { immediate: true })
</script>

<i18n lang="json">
{
  "en": {
    "wordsTitle": "List of words",
    "wordsDescription": "Top words associated with this topic",
    "topicLoadError": "Unable to load this topic.",
    "overviewLoadError": "Unable to load the topic overview.",
    "articlesLoadError": "Unable to load related articles.",
    "noWords": "No words available for this topic.",
    "noFacets": "No facets available for this topic.",
    "noArticles": "No related articles found.",
    "topic": {
      "relevanceDESC": "topic relevance (highest first)",
      "relevanceASC": "topic relevance (lowest first)"
    },
    "article": {
      "dateASC": "article date",
      "dateDESC": "article date, latest first"
    },
    "contentItemOverTime": {
      "title": "Content items over time",
      "description": "Number of content items associated with this topic over time"
    }
  }
}
</i18n>
