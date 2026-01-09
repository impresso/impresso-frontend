<template>
  <div class="citation-wrapper" v-if="citationHtml.length" v-html="citationHtml"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import * as Cite from '@citation-js/core'
import type { CSLJSON } from '@citation-js/core'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import '@citation-js/plugin-csl'

import {
  dataProviders as dataProvidersService,
  mediaSources as mediaSourceService
} from '@/services'
import { WebAppBaseUrl, WebAppHost } from '@/constants'
import { getContentItemPermalink } from '@/logic/ids'

export interface ContentItemCitationProps {
  item: ContentItemType
}

const props = defineProps<ContentItemCitationProps>()
const emit = defineEmits<{
  (e: 'citationGenerated', citation: string): void
}>()

const citationHtml = ref<string>('...')

const generateCitation = async () => {
  // Prepare CSL data
  const date = new Date(props.item.meta.date)
  const dateParts = date.getTime()
    ? [[date.getFullYear(), date.getMonth() + 1, date.getDate()]]
    : [0]

  const archive: string =
    dataProvidersService.getDataProviderNameById(props.item.meta.partnerId) ??
    props.item.meta.partnerId

  const mediaName: string = await mediaSourceService
    .get(props.item.meta.mediaId)
    .then(media => media?.name ?? props.item.meta.mediaId)

  console.log('Generating citation for item ID:', props.item.id, dateParts)
  try {
    const cslData: CSLJSON = {
      type: 'article-newspaper',
      title: props.item.text.title,
      'container-title': mediaName,
      publisher: archive,
      archive: archive,
      page: props.item.image?.pages?.map(page => page.number).join(', ') ?? '',
      URL: getContentItemPermalink(props.item.id),
      issued: {
        'date-parts': dateParts
      }
    }

    const cite = new Cite.Cite(cslData)
    citationHtml.value = cite.format('bibliography', {
      format: 'html',
      template: 'chicago-fullnote-bibliography',
      lang: 'en-GB'
    })
    emit('citationGenerated', citationHtml.value)
  } catch (error) {
    citationHtml.value = 'Invalid citation data.'
    console.error('Error generating citation:', error)
  }
}

// Only re-run the logic when the ID changes
watch(() => props.item.id, generateCitation)

onMounted(generateCitation)
</script>
