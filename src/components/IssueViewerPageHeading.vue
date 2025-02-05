<template>
  <b-navbar class="pt-2 pb-1 d-block">
    <section class="pt-2 pb-1">
      <div class="label small-caps">
        <slot name="label">{{ label }}</slot>
      </div>
      <slot name="title">
        <h3 v-if="isLoading">... (loading)</h3>
        <h3 v-else>
          <span v-if="article">
            {{ $t('buckets.type.' + article.type) }} <b>{{ article.title }}</b>
          </span>
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
            <span class="date" v-if="issue">{{ $d(issue.date, 'long') }}</span>
            <span class="pages" v-if="article"
              >&nbsp;&mdash;
              {{
                $t('pp', { pages: article.pages.map(p => p.num).join(', '), n: article.pages })
              }}</span
            >
            <span class="pages small" v-else-if="page"
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
  <b-navbar class="border-bottom" v-if="!article">
    <span
      v-if="!isLoading && issue"
      v-html="
        $t('label_stats', {
          countArticles: issue.countArticles,
          countPages: issue.countPages
        })
      "
    />{{ ' ' }}
    <DataProviderLabel v-if="dataProvider" class="d-inline-block" :item="dataProvider" />
    <span v-if="isLoading">...</span>
  </b-navbar>
</template>
<i18n lang="json">
{
  "en": {
    "page": "p.{num}",
    "label_stats": "<span class='number'>{countArticles}</span> content items in <span class='number'>{countPages}</span> pages"
  }
}
</i18n>
<script setup lang="ts">
import InfoButton from '@/components/base/InfoButton.vue'
import ItemSelector from '@/components/modules/ItemSelector.vue'
import Ellipsis from '@/components/modules/Ellipsis.vue'
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
