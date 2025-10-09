<template>
  <div class="ContentItem">
    <h2>
      <RouterLink v-if="showLink" :to="routerLinkUrl" v-html="item.text.title"></RouterLink>
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
        />
        &nbsp;
        <span>{{ item.meta.date ? $d(new Date(item.meta.date), 'long') : '' }}</span>
        <span
          v-if="item.image?.pagesCount"
          v-html="`– ${$tc('pp', item.image?.pagesCount, { pages })}`"
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
    <pre>{{ JSON.stringify(item, null, 2) }}</pre>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import type { ContentItem } from '@/models/generated/schemas/contentItem'
import { computed } from 'vue'
import MediaSourceLabel from './MediaSourceLabel.vue'
import DataProviderLabel from './DataProviderLabel.vue'

export interface Props {
  item: ContentItem
  showLink?: boolean
  showMeta?: boolean
  showExcerpt?: boolean
  showMatches?: boolean
}

const props = defineProps<Props>()
const route = useRoute()

const routerLinkUrl = computed(() => {
  if (props.item.meta.sourceType === 'newspaper') {
    return {
      name: 'issue-viewer',
      params: {
        issue_uid: props.item.issueId
      },
      query: {
        ...route?.query,
        articleId: props.item.id,
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
</script>
<style type="css">
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
