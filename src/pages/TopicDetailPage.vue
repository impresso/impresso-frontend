<template>
  <i-layout-section main width="auto">
    <template v-slot:header>
      <div class="container-xxl ml-0">
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
          <div class="col-12 mt-1">
            <ul class="nav nav-pills">
              <li v-for="name in nestedRoutes" :key="name" class="nav-item pl-2">
                <RouterLink
                  :to="{ name: name, params: { media_source_id: route.params.topic_id } }"
                  class="nav-link"
                  :class="{
                    active: route.name === name
                  }"
                >
                  {{ $t(`route.${name}`) }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
    <div class="container-xxl my-3 ml-0 pl-4" v-if="shouldShowTimeline">
      <div class="row">
        <div class="col-12 mt-2">
          <SearchFacetTimeline
            facetType="year"
            searchIndex="search"
            :title="$t('contentItemOverTime.title')"
            height="85px"
            :filters="filters"
            :errorLoadingItemsMessage="$t('timelineLoadError')"
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
        </div>
      </div>
    </div>
    <router-view :item="topic" :listFilters="filters" />
    <div class="p-3 m-3 mb-5">
      <LoadingBlock v-if="isLoadingTopic" :label="$t('loading')" />
      <p v-else-if="topicError" class="alert alert-danger" role="alert">
        {{ $t('topicLoadError') }}
      </p>
    </div>
  </i-layout-section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Topic from '@/models/Topic'

import type { FacetType, Filter } from '@/models'
import { Routes } from '@/router/routes'
import { topics as topicsService } from '@/services'
import LoadingBlock from '@/components/LoadingBlock.vue'
import TopicItem from '@/components/topics/TopicItem.vue'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import OpenInSearchButton from '@/components/OpenInSearchButton.vue'
import SearchFacetTimeline from '@/components/SearchFacetTimeline.vue'

const route = useRoute()

const nestedRoutes = [
  Routes.topics.children.topic.children.metadata.name,
  Routes.topics.children.topic.children.overview.name,
  Routes.topics.children.topic.children.contentItems.name
]

const topic = ref<Topic | null>(null)

const isLoadingTopic = ref(false)
const topicError = ref(false)

const filters = computed<Filter[]>(() => [
  {
    type: 'topic',
    q: topic.value?.id || ''
  }
])

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

const shouldShowTimeline = computed(() => {
  if (!topic.value) return false
  return (
    route.name === Routes.topics.children.topic.children.overview.name ||
    route.name === Routes.topics.children.topic.children.metadata.name
  )
})
watch(() => route.params.topic_id, fetchTopic, { immediate: true })
</script>

<i18n lang="json">
{
  "en": {
    "wordsTitle": "List of words",
    "wordsDescription": "Top words associated with this topic",
    "topicLoadError": "Unable to load this topic.",
    "timelineLoadError": "Unable to load timeline data.",
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
    },
    "route": {
      "topicMetadata": "Metadata",
      "topicOverview": "Overview",
      "topicContentItems": "Content items"
    }
  }
}
</i18n>
