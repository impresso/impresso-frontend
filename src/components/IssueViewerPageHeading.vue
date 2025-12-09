<template>
  <b-navbar class="pt-3 pb-1 d-block">
    <section class="py-1">
      <div class="label small-caps">
        <slot name="label"></slot>
      </div>
      <slot name="title">
        <h3 class="mb-1" v-if="isLoading">... (loading)</h3>
        <h3 v-else class="mb-1">
          <span v-if="mediaSource"
            ><MediaSourceLabel
              v-if="mediaSource"
              class="d-inline-block"
              titleClass=""
              :item="mediaSource"
              showLink
          /></span>

          <span class="date" v-if="issue">&nbsp;&mdash;&nbsp;{{ $d(issue.date, 'long') }}</span>
          <span class="pages" v-if="article?.pages"
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
          <br />
          <b v-if="article"> {{ article.title }}</b>
        </h3>
        <InfoButton v-if="infoButtonRef" :name="infoButtonRef" />
        <div class="d-flex align-items-center">
          <div class="">
            <span v-if="article" class="small-caps"
              >{{ $t('buckets.type.' + article.type) }} &nbsp;</span
            >
            <span
              v-else-if="issue"
              v-html="
                $t('label_stats', {
                  countArticles: issue.countArticles,
                  countPages: issue.countPages
                })
              "
            ></span>
            <span v-if="article && article.copyright">
              {{ $t('buckets.copyright.' + article.copyright) }}{{ ' ' }}</span
            >
            <DataProviderLabel v-if="dataProvider" class="d-inline-block" :item="dataProvider" />
            <ContentItemIdLabel v-if="contentItem" :item="contentItem" class="ml-3" />
            <ContentItemAccess v-if="contentItem" :item="contentItem" class="ml-3" />
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
    "label_stats": "Browse <b class='number'>{countArticles}</b> articles in <b class='number'>{countPages}</b> pages"
  }
}
</i18n>
<script setup lang="ts">
import InfoButton from '@/components/base/InfoButton.vue'
import type { Filter, MediaSource, Issue, DataProvider, Page } from '@/models'
import MediaSourceLabel from '@/components/modules/lists/MediaSourceLabel.vue'
import { computed } from 'vue'
import DataProviderLabel from './modules/lists/DataProviderLabel.vue'
import ContentItemAccess from './ContentItemAccess.vue'
import ContentItemIdLabel from './ContentItemIdLabel.vue'

export interface IssueViewerPageHeadingProps {
  issue?: Issue
  mediaSource?: MediaSource
  dataProvider?: DataProvider
  page?: Page
  infoButtonRef?: string
  isLoading?: boolean
  article?: any
  contentItem?: any
  showCurrentSearchFilters?: boolean
  filtersWithItems?: Filter[]
}

const props = withDefaults(defineProps<IssueViewerPageHeadingProps>(), {
  filtersWithItems: () => [],
  isLoading: false
})

const MediaSourceId = computed(() => props.issue?.uid.split('-')[0])
</script>
