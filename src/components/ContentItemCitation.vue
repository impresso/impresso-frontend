<template>
  <div class="citation-wrapper" v-html="citationHtml"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Cite from '@citation-js/core'
import type { ContentItem } from '@/models/generated/schemas/contentItem'

export interface ContentItemCitationProps {
  item: ContentItem
}

const props = defineProps<ContentItemCitationProps>()

const citationHtml = ref<string>('')

const generateCitation = () => {
  try {
    const cslData = {
      type: 'article-newspaper',
      title: props.item.text.title,
      'container-title': props.item.meta.mediaId,
      publisher: props.item.meta.partnerId,
      page: props.item.image?.pages?.[0]?.number?.toString() ?? '',
      issued: {
        'date-parts': [
          new Date(props.item.meta.date).getFullYear()
            ? [new Date(props.item.meta.date).getFullYear()]
            : [0]
        ]
      }
    }

    const cite = new Cite(cslData)
    citationHtml.value = cite.format('bibliography', {
      format: 'html',
      template: 'chicago-fullnote-bibliography',
      lang: 'en-GB'
    })
  } catch (error) {
    citationHtml.value = 'Invalid citation data.'
  }
}

// Only re-run the logic when the ID changes
watch(() => props.item.id, generateCitation)

onMounted(generateCitation)
</script>
