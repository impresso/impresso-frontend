<template>
  <b-navbar class="pt-2 pb-1 d-block">
    <section class="pt-2 pb-1">
      <div class="label small-caps">
        <slot name="label">{{ label }}</slot>
      </div>
      <slot name="title">
        <h3 v-if="isLoading">... (loading)</h3>
        <h3 v-else class="m-0">
          <span v-if="article">
            <span style="text-transform: capitalize">{{ $t('buckets.type.' + article.type) }}</span
            >&nbsp;
            <b>{{ article.title }}</b>
          </span>
          <span v-else-if="issue" v-html="$t('label_stats')"></span>
          <DataProviderLabel v-if="dataProvider" class="d-inline-block" :item="dataProvider" />
        </h3>
        <InfoButton v-if="infoButtonRef" :name="infoButtonRef" />
        <div class="d-flex align-items-center">
          <div>
            <MediaSourceLabel
              v-if="mediaSource"
              class="d-inline-block"
              titleClass=""
              :item="mediaSource"
              showLink
            />
            <!-- <ItemSelector
            v-if="mediaSource"
            :uid="mediaSource.id"
            :item="{ ...mediaSource, uid: mediaSource.id }"
            :type="mediaSource.type"
          /> -->
            &nbsp;
            <span class="date textbox-fancy text-serif" v-if="issue">{{
              $d(issue.date, 'long')
            }}</span>
            <span class="pages textbox-fancy text-serif" v-if="article?.pages"
              >&nbsp;&mdash;
              {{
                $tc('pp', article.pages.length, {
                  pages: article.pages.map(p => p.num).join(', '),
                  n: article.pages.length
                })
              }}</span
            >
            <span class="pages" v-else-if="page"
              >&nbsp;&mdash; {{ $t('page', { num: page.num }) }}</span
            >
          </div>
          <div class="ml-auto" style="min-width: 200px">
            <slot name="actions"></slot>
          </div>
        </div>
      </slot>
    </section>
  </b-navbar>
</template>
<i18n lang="json">
{
  "en": {
    "page": "p.{num}",
    "label_stats": "Facsimile of the newspaper issue"
  }
}
</i18n>
<script setup lang="ts">
import InfoButton from '@/components/base/InfoButton.vue'
import type { Filter, MediaSource, Issue, DataProvider, Page } from '@/models'
import MediaSourceLabel from '@/components/modules/lists/MediaSourceLabel.vue'
import { computed } from 'vue'
import DataProviderLabel from './modules/lists/DataProviderLabel.vue'

export interface IssueViewerPageHeadingProps {
  issue?: Issue
  mediaSource?: MediaSource
  dataProvider?: DataProvider
  page?: Page
  label: string
  infoButtonRef?: string
  isLoading?: boolean
  article?: any
  showCurrentSearchFilters?: boolean
  filtersWithItems?: Filter[]
}

const props = withDefaults(defineProps<IssueViewerPageHeadingProps>(), {
  filtersWithItems: () => [],
  isLoading: false
})

const MediaSourceId = computed(() => props.issue?.uid.split('-')[0])
</script>
