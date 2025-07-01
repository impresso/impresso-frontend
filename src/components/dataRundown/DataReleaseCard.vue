<template>
  <div class="DataReleaseCard">
    <slot name="header" :data-release="dataRelease">
      <span class="text-muted" v-html="$t('release_label')"></span>
      <h3 class="font-size-inherit font-weight-medium">
        {{ dataRelease.releaseName }}
        <span class="text-muted">{{ dataRelease.releaseVersion }}</span>
      </h3>
    </slot>
    <ul class="list-unstyled d-flex-wrap mb-0">
      <li v-for="(npsStat, index) in orderedNpsStats" :key="index" style="display: inline-block">
        {{ $t(npsStat) }}
        <span class="number">{{ $n(dataRelease.impressoCorpusOverview?.npsStats[npsStat]) }}</span>
        <span v-if="index < orderedNpsStats.length - 1">;&nbsp;</span>
        <span v-else-if="index === orderedNpsStats.length - 1">.</span>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { DataRelease } from '@/services/types'

export interface DataReleaseCardProps {
  dataRelease: DataRelease
  isLoading?: boolean
  orderedNpsStats?: string[]
}

withDefaults(defineProps<DataReleaseCardProps>(), {
  isLoading: false,
  orderedNpsStats: () => ['titles', 'issues', 'pages', 'contentItems', 'images', 'tokens'],
  dataRelease: () => ({
    id: '...',
    releaseVersion: '...',
    releaseName: '...',
    impressoCorpusOverview: {
      npsStats: { titles: 0, issues: 0, pages: 0, contentItems: 0, images: 0, tokens: 0 }
    }
  })
})
</script>
<i18n lang="json">
{
  "en": {
    "release_label": "Latest data release: ",
    "titles": "Titles: ",
    "issues": "Issues: ",
    "pages": "Pages: ",
    "contentItems": "Content items: ",
    "images": "Images: ",
    "tokens": "Tokens: "
  },
  "de": { "release_label": "Neueste Veröffentlichung" },
  "fr": { "release_label": "Dernière version" },
  "it": { "release_label": "Ultima versione" },
  "es": { "release_label": "Última versión" }
}
</i18n>
