<template>
  <div class="ContentItemCitation d-flex align-items-end gap-2" v-if="citationHtml.length">
    <div v-html="citationHtml" class="flex-grow-1"></div>
    <button
      v-if="showCopyButton"
      type="button"
      class="btn btn-sm btn-outline-secondary"
      @click="copyToClipboard"
      :title="copied ? $t('copied') : $t('copyToClipboard')"
    >
      <span v-if="copied">{{ $t('copied') }}</span>
      <span v-else>{{ $t('copyToClipboard') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import * as Cite from '@citation-js/core'
import type { CSLJSON } from '@citation-js/core'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import '@citation-js/plugin-csl'
import '@citation-js/plugin-bibtex'
import {
  dataProviders as dataProvidersService,
  mediaSources as mediaSourceService
} from '@/services'
import { getContentItemPermalink } from '@/logic/ids'

export interface ContentItemCitationProps {
  item: ContentItemType
  showCopyButton?: boolean
  format?: 'html' | 'bibtex'
}

const props = withDefaults(defineProps<ContentItemCitationProps>(), {
  showCopyButton: false,
  format: 'html'
})
const emit = defineEmits<{
  (e: 'citationGenerated', citation: string): void
}>()

const citationHtml = ref<string>('...')
const copied = ref<boolean>(false)

const copyToClipboard = async () => {
  // Extract plain text from HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(citationHtml.value, 'text/html')
  const plainText = doc.body.textContent || ''

  try {
    await navigator.clipboard.writeText(plainText)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error)
  }
}

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

  try {
    const cslData: CSLJSON & { id: string } = {
      id: props.item.id,
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
    if (props.format === 'html') {
      citationHtml.value = cite.format('bibliography', {
        format: 'html',
        template: 'chicago-fullnote-bibliography',
        lang: 'en-GB'
      })
    } else if (props.format === 'bibtex') {
      citationHtml.value = cite.format('bibtex')
    } else {
      citationHtml.value = 'Unsupported citation format.'
    }
    emit('citationGenerated', citationHtml.value)
  } catch (error) {
    citationHtml.value = 'Invalid citation data.'
    console.warn('Error generating citation:', error)
  }
}

// Only re-run the logic when the ID changes, or text.title changes.
watch(() => [props.item.id, props.item.text?.title], generateCitation)

onMounted(generateCitation)
</script>

<i18n lang="json">
{
  "en": {
    "copyToClipboard": "Copy ...",
    "copied": "Copied! "
  }
}
</i18n>
