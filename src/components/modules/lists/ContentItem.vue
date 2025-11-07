<template>
  <div class="ContentItem" @click="emit('click', item)">
    <h2 v-if="showTitle">
      <RouterLink v-if="showLink" :to="routerLinkUrl" v-html="contentItemTitle"></RouterLink>
      <span v-else v-html="item.text.title"></span>
    </h2>
    <div v-if="showMeta">
      <p class="m-0">
        <MediaSourceLabel
          :item="{
            uid: item.meta.mediaId,
            name: item.meta.mediaId,
            type: item.meta.sourceType
          }"
          class="d-inline-block"
        />{{ '' }}
        <span>{{ item.meta.date ? $d(new Date(item.meta.date), 'short') : '' }}</span>
        <span
          v-if="item.image?.pagesCount"
          v-html="` – ${$tc('pp', item.image?.pagesCount, { pages })}`"
        >
        </span>
      </p>
      <p>
        {{ $t(`buckets.copyright.${item.access.copyright}`) }}
        <DataProviderLabel
          v-if="item.meta.partnerId"
          :item="{ id: item.meta.partnerId, name: item.meta.partnerId }"
          show-link
          class="d-inline-block"
        ></DataProviderLabel>
      </p>
    </div>
    <div v-if="!showMeta && showType" class="ContentItem__typePages">
      <span class="small-caps">{{ $t(`buckets.type.${itemType}`) }}</span>
      <span
        v-if="item.image?.pagesCount"
        v-html="` – ${$tc('pp', item.image?.pagesCount, { pages })}`"
      >
      </span>
    </div>
    <div
      v-if="showSnippet && (!showMatches || item.text?.snippet?.length > 0)"
      class="ContentItem__excerpt mt-1"
    >
      <blockquote class="text-muted">{{ item.text.snippet }}</blockquote>
      <b-badge
        v-if="showTranscriptLength && item.text.contentLength"
        variant="light"
        class="mr-1 pt-1"
      >
        <span v-if="item.text.contentLength > 1200">{{
          $t('readingTime', { min: item.text.contentLength / 1200 })
        }}</span>
        <span v-else>{{ $t('reducedReadingTime') }}</span>
      </b-badge>
    </div>
    <div v-if="showSemanticEnrichments" class="mt-1 d-flex flex-wrap gap-2">
      <div v-for="entityType in ContentItemSemanticEnrichmentTypes" :key="entityType">
        <div v-if="item.semanticEnrichments?.namedEntities?.[entityType]?.length">
          <Ellipsis :maxHeight="200">
            <b-badge variant="light" class="mr-1 very-small-caps">{{ $t(entityType) }}</b-badge>
            <div
              v-for="(entity, idx) in item.semanticEnrichments.namedEntities[entityType]"
              v-bind:key="idx"
              class="d-inline small"
            >
              <ItemSelector
                :uid="entity.id"
                :label="entity.label"
                :item="{
                  uid: entity.id,
                  ...entity,
                  name: entity.label
                }"
                :type="ItemSelectorEntityTypes[entityType]"
                hideIcon
              />
              <span v-if="idx !== item.semanticEnrichments.namedEntities[entityType].length - 1"
                >,
              </span>
            </div>
          </Ellipsis>
        </div>
      </div>
    </div>
    <div v-if="showTopics && item.semanticEnrichments.topics?.length" class="mt-2">
      <b-badge variant="light" class="mr-1 very-small-caps d-inline-block">{{
        $t('topics')
      }}</b-badge>
      <div class="d-flex flex-wrap gap-2">
        <ContentItemTopicItem
          :item="topic"
          v-for="topic in item.semanticEnrichments.topics"
          v-bind:key="topic.id"
          :style="{ minWidth: '400px', maxWidth: '30%' }"
        />
      </div>
    </div>
    <div v-if="showMatches && item.text?.matches?.length">
      <ul class="ContentItem__textMatches d-flex flex-wrap mt-1 p-0">
        <li
          class="p-1 mb-2 mr-2 me-2 rounded"
          v-for="(match, i) in item.text.matches"
          v-bind:key="i"
          v-html="match.fragment"
          v-show="match.fragment.trim().length > 0"
        />
      </ul>
    </div>

    <slot name="actions"></slot>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import type { ContentItem } from '@/models/generated/schemas/contentItem'
import { computed } from 'vue'
import MediaSourceLabel from './MediaSourceLabel.vue'
import DataProviderLabel from './DataProviderLabel.vue'
import { getShortArticleId } from '@/logic/ids'
import ItemSelector from '../ItemSelector.vue'
import Ellipsis from '../Ellipsis.vue'
import ContentItemTopicItem from './ContentItemTopicItem.vue'

export interface Props {
  item: ContentItem
  showLink?: boolean
  showTitle?: boolean
  showMeta?: boolean
  showSnippet?: boolean
  showMatches?: boolean
  showType?: boolean
  showTopics?: boolean
  showTranscriptLength?: boolean
  showSemanticEnrichments?: boolean
}

const ContentItemSemanticEnrichmentTypes = ['persons', 'locations', 'organisations', 'newsagencies']
const ItemSelectorEntityTypes = {
  persons: 'person',
  locations: 'location',
  organisations: 'organisation',
  newsagencies: 'newsagency'
}

const props = withDefaults(defineProps<Props>(), {
  showTitle: true,
  showType: true
})
const route = useRoute()
const emit = defineEmits<{
  click: [item: ContentItem]
}>()

const contentItemTitle = computed(() => {
  if (props.item.text.title?.length > 0) {
    return props.item.text.title
  }
  return '[Untitled]'
})
const routerLinkUrl = computed(() => {
  if (props.item.meta.sourceType === 'newspaper') {
    return {
      name: 'issue-viewer',
      params: {
        issue_uid: props.item.issueId
      },
      query: {
        ...route?.query,
        // TODO: replace query params with contentItemId.
        articleId: getShortArticleId(props.item.id),
        p: props.item.image?.pages[0]?.number
      }
    }
  }
  // TODO: handle other sourceTypes
  return '#'
})

const pages = computed(() => {
  if (props.item.image?.pages?.length) {
    const imagepages = props.item.image.pages.map(d => String(d.number))
    if (imagepages.length > 5) {
      return imagepages
        .slice(0, 5)
        .concat('&hellip;', imagepages[imagepages.length - 1])
        .join(',')
    }
    return imagepages.join(',')
  }
  return 'no page info'
})

const itemType = computed(() => {
  if (props.item.meta.sourceType === 'newspaper') {
    return props.item.text.itemType
  }
  // TODO: handle other sourceTypes
  return 'N/A'
})
</script>
<style>
.ContentItem ul.ContentItem__textMatches {
  list-style-type: none;
}

.ContentItem ul.ContentItem__textMatches li {
  border-left-width: 0 !important;
  background: var(--impresso-color-yellow-alpha-30);
  margin: 0.1rem 0.5rem 0.25rem 0rem !important;
}
.ContentItem ul.ContentItem__textMatches li em {
  font-style: normal;
  font-weight: bold;
  background: var(--impresso-color-yellow);
  padding: 0 0.1rem;
}
</style>
