<template>
  <div class="ContentItemCommon">
    <!-- icon and title -->
    <div class="d-flex align-items-start gap-2">
      <div v-if="props.showIcon">
        <Icon :name="contentItemIconName" />
      </div>
      <h2 v-if="showTitle" class="m-0 font-size-inherit font-weight-bold line-height-inherit">
        <RouterLink v-if="showLink" :to="routerLinkUrl" v-html="contentItemTitle"></RouterLink>
        <span v-else v-html="contentItemTitle"></span>
      </h2>
      <div v-if="props.showOcrQuality" class="ml-auto">
        <ContentItemOcrQuality :contentItem="props.contentItem" />
      </div>
    </div>

    <!-- mediaSource -->
    <div v-if="shouldShowMediaSource || shouldShowDate || shouldShowPages">
      <MediaSourceLabel
        v-if="shouldShowMediaSource"
        :item="{
          id: contentItem.meta?.mediaId,
          name: contentItem.meta?.mediaId,
          type: contentItem.meta?.sourceType
        }"
        show-link
        class="d-inline-block"
      />
      {{ ' ' }}
      <span v-if="shouldShowDate">
        {{ shouldShowMediaSource ? '&mdash;' : '' }}
        {{ $d(new Date(contentItem.meta.date), props.dateFormatter) }}
        {{ '  ' }}
      </span>
      <!-- pages only if print material -->
      <template v-if="shouldShowPages">
        {{ shouldShowMediaSource || shouldShowDate ? '&mdash;' : '' }}
        <span v-html="$t('pp', { pages }, contentItem.facsimile.pagesCount)"> </span>
      </template>
    </div>

    <!-- date and type -->
    <div v-if="shouldShowType || showProvider || props.showSpecs || props.showId">
      <span v-if="shouldShowType" class="small-caps">
        {{ $t(`buckets.type.${contentItem.text.itemType}`) }}

        {{ ' ' }}
      </span>

      <span v-if="props.showSpecs" class="small">
        <template v-if="isAudioContentItem">
          {{ shouldShowType ? '&mdash;' : '' }}
          {{ $t('listeningTime', formattedAudioDurationParams) }}
          {{ ' ' }}
        </template>
        <div v-else class="d-inline-flex align-items-center gap-1">
          {{ shouldShowType ? '&mdash;' : '' }}
          <span v-html="$t(formattedReadingTimeParams.key, formattedReadingTimeParams)"></span>
          <InfoButton name="what-is-reading-time"></InfoButton>
        </div>
      </span>

      <!-- copyright and provider -->
      <template v-if="props.showProvider">
        &mdash;
        <span>{{ $t(`buckets.copyright.${contentItem.access.copyright}`) }}</span>
        {{ ' ' }}
        <DataProviderLabel
          v-if="contentItem.meta.partnerId"
          :item="{ id: contentItem.meta.partnerId, name: contentItem.meta.partnerId }"
          show-link
          class="d-inline-block"
        ></DataProviderLabel>
      </template>

      <!-- ID -->
      <template v-if="props.showId">
        &mdash;
        <ContentItemIdLabel :id="contentItem.id" />
      </template>
    </div>

    <!-- separator -->
    <div class="py-1"></div>
    <!-- snippet -->
    <blockquote v-if="shouldShowSnippet" class="text-muted m-0 pb-2">
      {{ contentItem.text?.snippet }}[...]
    </blockquote>

    <!-- other matches -->
    <ul
      v-if="props.showMatches && contentItem.text?.matches?.length"
      class="ContentItemCommon__textMatches d-flex flex-wrap p-0 mb-1"
    >
      <li
        class="p-1 mb-1 mr-2 me-2 rounded"
        v-for="(match, i) in contentItem.text.matches"
        v-bind:key="i"
        v-html="match.fragment"
        v-show="match.fragment.trim().length > 0"
      ></li>
    </ul>
    <!-- collections -->
    <div v-if="shouldShowCollections" class="d-flex flex-wrap align-items-center">
      <div class="badge badge-light my-1 mr-1 very-small-caps">{{ $t('collections') }}</div>

      <div
        v-for="(collection, i) in contentItem.semanticEnrichments.collections"
        v-bind:key="i"
        class="m-1 font-size-inherit d-flex align-items-center bg-info pl-2 rounded"
      >
        <router-link
          v-bind:to="{ name: 'collection', params: { collection_id: collection.id } }"
          title="View collection"
          class="text-decoration-underline"
        >
          {{ collection.title }}
        </router-link>
        <button class="btn btn-transparent p-1" @click="emit('remove-collection', collection.id)">
          <Icon name="cross" :scale="0.75" class="ml-1" />
        </button>
      </div>
    </div>
    <!-- named entities -->
    <div v-if="props.showSemanticEnrichments" class="mt-1 d-flex flex-wrap gap-2 mb-2">
      <div v-for="entityType in semanticEnrichmentTypes" :key="entityType">
        <div v-if="contentItem.semanticEnrichments?.namedEntities[entityType]?.length">
          <Ellipsis :maxHeight="200">
            <b-badge variant="light" class="mr-1 very-small-caps">{{ $t(entityType) }}</b-badge>
            <div
              v-for="(entity, idx) in contentItem.semanticEnrichments.namedEntities[entityType]"
              v-bind:key="idx"
              class="d-inline small"
            >
              <ItemSelector
                :id="entity.id"
                :label="entity.label"
                :item="{
                  id: entity.id,
                  ...entity,
                  name: entity.label
                }"
                :type="entityType"
                hideIcon
              />
              <span
                v-if="idx !== contentItem.semanticEnrichments.namedEntities[entityType].length - 1"
                >,
              </span>
            </div>
          </Ellipsis>
        </div>
      </div>
    </div>

    <div v-if="shouldShowTopics" class="mb-3">
      <b-badge variant="light" class="mr-1 very-small-caps d-inline-block">{{
        $t('topics')
      }}</b-badge>
      <div class="fluid-container">
        <div class="row">
          <div
            :class="contentItemTopicClasses"
            v-for="topic in contentItem.semanticEnrichments.topics"
            :key="topic.id"
          >
            <ContentItemTopicItem :item="topic" />
          </div>
        </div>
      </div>
    </div>
    <!-- add to collection! -->
    <div class="d-flex justify-content-between flex-wrap align-items-center gap-2">
      <!-- content item access -->
      <ContentItemAccess v-if="props.showContentItemAccess" :item="props.contentItem" />
      <div v-if="props.enableAddToCollection">
        <CollectionAddTo
          :contentItem="props.contentItem"
          right
          :items="itemWithCollections"
          :text="$t('actions.addToCollection')"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {
  ContentItem,
  ContentItemSemanticEnrichments
} from '@/models/generated/canonical/contentItem'
import { Routes } from '@/router/routes'
import { computed } from 'vue'
import { RouteLocationRaw } from 'vue-router'
import DataProviderLabel from '@/components/modules/lists/DataProviderLabel.vue'
import Icon from '@/components/base/Icon.vue'
import MediaSourceLabel from '@/components/modules/lists/MediaSourceLabel.vue'
import { getSeekTimeInSeconds, timeToSeconds } from '../audio/utils'
import ContentItemAccess from '../ContentItemAccess.vue'
import InfoButton from '../base/InfoButton.vue'
import ContentItemTopicItem from '../modules/lists/ContentItemTopicItem.vue'
import Ellipsis from '../modules/Ellipsis.vue'
import ItemSelector from '../modules/ItemSelector.vue'
import CollectionAddTo from '@/components/modules/CollectionAddTo.vue'
import { ItemWithCollections } from '../modules/CollectionAddToList.vue'
import ContentItemOcrQuality from './ContentItemOcrQuality.vue'
import ContentItemIdLabel from '../ContentItemIdLabel.vue'

export interface ContentItemCommonProps {
  contentItem: ContentItem
  dateFormatter?: string
  iconName?: string
  showCollections?: boolean
  showContentItemAccess?: boolean
  showDate?: boolean
  showIcon?: boolean
  showId?: boolean
  showTitle?: boolean
  showLink?: boolean
  showMatches?: boolean
  showMediaSource?: boolean
  showMeta?: boolean
  showOcrQuality?: boolean
  showProvider?: boolean
  showSemanticEnrichments?: boolean
  showSnippet?: boolean
  showSpecs?: boolean
  showType?: boolean
  showTopics?: boolean
  enableAddToCollection?: boolean
  entityTypes?: Array<keyof ContentItemSemanticEnrichments['namedEntities']>
  contentItemTopicClasses?: string
}
const props = withDefaults(defineProps<ContentItemCommonProps>(), {
  dateFormatter: 'long',
  ocrQualityThreshold: 0.5,
  entityTypes: () => ['persons', 'locations', 'organisations', 'newsagencies'],
  contentItemTopicClasses: 'col-12 col-lg-6 col-xl-4'
})

const emit = defineEmits<{
  (e: 'remove-collection', id: ContentItemSemanticEnrichments['collections'][0]['id']): void
}>()

const contentItemTitle = computed(() => {
  if (props.contentItem.text?.title?.length > 0) {
    return props.contentItem.text.title
  }

  if (props.contentItem.text?.snippet?.length > 0) {
    return props.contentItem.text.snippet.split(/\s/).slice(0, 5).concat(['...']).join(' ')
  }
  return '[Untitled]'
})

const isAudioContentItem = computed(() => {
  return props.contentItem.meta?.sourceMedium === 'audio'
})

const contentItemIconName = computed(() => {
  if (props.iconName) {
    return props.iconName
  }
  if (isAudioContentItem.value) {
    return 'antennaSignalTag'
  }
  return 'journalPage'
})

const routerLinkUrl = computed(() => {
  const name = isAudioContentItem.value
    ? Routes.audioContentItem.children.transcript.name
    : Routes.contentItem.name
  return {
    name,
    params: { content_item_id: props.contentItem.id }
  } as RouteLocationRaw
})
const shouldShowSnippet = computed(() => {
  if (props.showMatches && props.contentItem.text?.matches?.length > 0) {
    return false
  }
  return props.showSnippet && !!props.contentItem.text?.snippet
})

const shouldShowMediaSource = computed(() => {
  return props.showMediaSource && !!props.contentItem.meta.mediaId
})

const shouldShowCollections = computed(() => {
  return props.showCollections && !!props.contentItem.semanticEnrichments?.collections?.length
})

const shouldShowDate = computed(() => {
  return (
    props.showDate &&
    !!props.contentItem.meta.date &&
    !isNaN(new Date(props.contentItem.meta.date).getTime())
  )
})

const shouldShowTopics = computed(() => {
  return props.showTopics && !!props.contentItem.semanticEnrichments?.topics?.length
})

const shouldShowType = computed(() => {
  return props.showType && !!props.contentItem.text?.itemType
})

const shouldShowPages = computed(() => {
  return props.showSpecs && !isAudioContentItem.value && !!props.contentItem.facsimile?.pagesCount
})

const semanticEnrichmentTypes = computed(() => {
  if (!props.contentItem?.semanticEnrichments?.namedEntities) {
    return []
  }
  return Object.keys(props.contentItem.semanticEnrichments.namedEntities).filter(type =>
    props.entityTypes.includes(type as keyof ContentItemSemanticEnrichments['namedEntities'])
  ) as Array<keyof ContentItemSemanticEnrichments['namedEntities']>
})

const audioDuration = computed<number>(() => {
  if (!isAudioContentItem.value) {
    return 0
  }
  const audioDuration = props.contentItem.audio?.duration
  if (!audioDuration) {
    return 0
  }
  try {
    if (!props.contentItem.audio?.startTime || props.contentItem.audio.startTime === '00:00:00') {
      return timeToSeconds(audioDuration)
    }
    return getSeekTimeInSeconds(props.contentItem.audio.startTime, audioDuration)
  } catch {
    return 0
  }
})

const itemWithCollections = computed(() => {
  return [
    {
      itemId: props.contentItem.id,
      collectionIds: props.contentItem.semanticEnrichments?.collections?.map(c => c.id)
    }
  ] as ItemWithCollections[]
})

const pages = computed(() => {
  if (props.contentItem.facsimile?.pages?.length) {
    const imagepages = props.contentItem.facsimile.pages.map(d => String(d.number))
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

const formattedAudioDurationParams = computed<{ minutes: number; seconds: number }>(() => {
  const durationInSeconds = Math.floor(audioDuration.value)
  const minutes = Math.floor(durationInSeconds / 60)
  const seconds = durationInSeconds % 60
  return { minutes, seconds }
})

const formattedReadingTimeParams = computed<{
  key: string
  hours?: number
  minutes?: number
  tokens: number
}>(() => {
  const transcriptLength = props.contentItem.text?.contentLength || 0
  if (transcriptLength < 200) {
    return { key: 'reducedReadingTime', minutes: 0, tokens: transcriptLength }
  }
  const durationInMinutes = Math.round(transcriptLength / 200)
  const durationInHours = durationInMinutes / 60
  if (durationInHours >= 1) {
    return { key: 'longReadingTime', hours: durationInHours, tokens: transcriptLength }
  }
  return { key: 'readingTime', minutes: durationInMinutes, tokens: transcriptLength }
})
</script>
<i18n lang="json">
{
  "en": {
    "listeningTime": "Listening time: {minutes}m {seconds}s",
    "readingTime": "Reading time: {minutes}m ({tokens} tokens)",
    "longReadingTime": "Reading time: {hours}h ({tokens} tokens)",
    "reducedReadingTime": "Reading time: < 1 min",
    "collections": "Collections"
  }
}
</i18n>
<style>
.ContentItemCommon ul.ContentItemCommon__textMatches {
  list-style-type: none;
}

.ContentItemCommon ul.ContentItemCommon__textMatches li {
  border-left-width: 0 !important;
  background: var(--impresso-color-yellow-alpha-30);
  margin: 0.1rem 0.5rem 0.25rem 0rem !important;
}
.ContentItemCommon ul.ContentItemCommon__textMatches li em {
  font-style: normal;
  font-weight: bold;
  background: var(--impresso-color-yellow);
  padding: 0 0.1rem;
}
</style>
