<template>
  <i-layout-section main width="auto">
    <template v-slot:header>
      <div class="container-xxl ml-0">
        <div class="row">
          <PageNavbarHeading :label="$t('topics')" :title="topic?.label" class="w-100" hideBorder>
            <template #default>
              <template v-if="topic">
                <div class="font-size-inherit">
                  <span class="badge badge-light small-caps mr-2">
                    {{ topic.language }}
                  </span>
                  <span>{{ topic.longLabel ? `(${topic.longLabel})` : '' }}</span>
                </div>

                <TopicItem
                  :topic="topic"
                  :show-link="false"
                  :show-model="false"
                  show-description
                  :show-language="false"
                  show-id
                  :show-title="false"
                  class="mt-2"
                />
              </template>
            </template>

            <template #actions>
              <div v-if="topic?.id" class="d-flex gap-2">
                <OpenInSearchButton :filters="filters" />
              </div>
            </template>
          </PageNavbarHeading>

          <div v-if="topicId" class="col-12 mt-1">
            <ul class="nav nav-pills">
              <li v-for="tab in tabs" :key="tab.name" class="nav-item pl-2">
                <RouterLink
                  :to="{ name: tab.name, params: { topic_id: topicId } }"
                  class="nav-link"
                  :class="{ active: route.name === tab.name }"
                >
                  {{ $t(tab.label) }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <div v-if="shouldShowTimeline" class="container-xxl my-3 ml-0 pl-4">
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

    <router-view v-if="topic" :item="topic" :listFilters="filters" />

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
import type Topic from '@/models/Topic'

import type { Filter } from '@/models'
import { Routes } from '@/router/routes'
import { topics as topicsService } from '@/services'
import LoadingBlock from '@/components/LoadingBlock.vue'
import TopicItem from '@/components/topics/TopicItem.vue'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import OpenInSearchButton from '@/components/OpenInSearchButton.vue'
import SearchFacetTimeline from '@/components/SearchFacetTimeline.vue'

const route = useRoute()

const topicRoutes = Routes.topics.children.topic.children

// Labels point at the local i18n keys below, so they don't depend on route names.
const tabs = [
  { name: topicRoutes.metadata.name, label: 'route.metadata' },
  { name: topicRoutes.overview.name, label: 'route.overview' },
  { name: topicRoutes.contentItems.name, label: 'route.contentItems' }
]

const topic = ref<Topic | null>(null)
const isLoadingTopic = ref(false)
const topicError = ref(false)

const topicId = computed(() => {
  const id = route.params.topic_id
  return typeof id === 'string' && id ? id : null
})

const filters = computed<Filter[]>(() =>
  topic.value?.id ? [{ type: 'topic', q: topic.value.id }] : []
)

const shouldShowTimeline = computed(
  () =>
    !!topic.value &&
    (route.name === topicRoutes.overview.name || route.name === topicRoutes.metadata.name)
)

function resetState(): void {
  topic.value = null
  topicError.value = false
  isLoadingTopic.value = false
}

async function fetchTopic(id: string, isStale: () => boolean): Promise<void> {
  isLoadingTopic.value = true
  try {
    const response = await topicsService.get(id)
    if (isStale()) return
    topic.value = response
  } catch (err) {
    if (isStale()) return
    console.error('Error fetching topic:', err)
    topicError.value = true
  } finally {
    // A stale call leaves the loading flag to the newer request.
    if (!isStale()) isLoadingTopic.value = false
  }
}

watch(
  topicId,
  (id, _oldId, onCleanup) => {
    let stale = false
    onCleanup(() => {
      stale = true
    })

    resetState()
    // No id usually means we are leaving the route: stay silent.
    if (!id) return

    fetchTopic(id, () => stale)
  },
  { immediate: true }
)
</script>

<i18n lang="json">
{
  "en": {
    "topicLoadError": "Unable to load this topic.",
    "timelineLoadError": "Unable to load timeline data.",
    "contentItemOverTime": {
      "title": "Content items over time",
      "description": "Number of content items associated with this topic over time"
    },
    "route": {
      "metadata": "Metadata",
      "overview": "Overview",
      "contentItems": "Content items"
    }
  }
}
</i18n>
