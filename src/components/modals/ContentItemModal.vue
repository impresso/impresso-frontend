<template>
  <InfoModal
    :is-visible="isVisible"
    modalClass="InfoModal ContentItemModal"
    dialog-class="modal-dialog-scrollable modal-xl"
    bodyClass="pt-0 px-3"
    @close="emit('dismiss')"
  >
    <ContentItem :item="item" showMeta class="p-1" />
    <!-- choice of mode view -->
    <b-tabs pills class="mb-4 mt-0 FeedbackModal__tabs">
      <template v-slot:tabs-end>
        <b-nav-item v-for="availableMode in AvailableModes" :key="availableMode">
          <button
            size="sm"
            class="w-100 btn btn-transparent nav-link"
            :class="{ active: mode === availableMode }"
            @click="mode = availableMode"
          >
            {{ $t(availableMode) }}
          </button>
        </b-nav-item>
      </template>
    </b-tabs>
    <section v-if="mode === 'card'">
      <h3 class="font-weight-bold font-size-inherit mt-3">Cite as</h3>
      <ContentItemCitation :item="item" class="p-2 bg-light border rounded small shadow-sm" />
      <div class="mt-4">
        <h3 class="font-weight-bold font-size-inherit">Full metadata</h3>
        <div class="container-fluid m-0">
          <div class="row">
            <div
              v-for="(field, index) in AvailableFields"
              :key="field"
              class="col-md-12 col-lg-6 col-xl-3"
            >
              <div class="py-2 small">
                <div class="font-weight-bold">{{ field }}</div>
                <span>{{ fields[index] }}</span>
              </div>
            </div>
          </div>
        </div>
        <pre>{{ JSON.stringify(item, null, 2) }}</pre>
      </div>
    </section>

    <section v-else-if="mode === 'transcript'">
      <h3 class="font-weight-bold font-size-inherit mt-3">Transcript</h3>
      <BFormCheckbox switch :v-model="transcriptMode">
        {{ $t('transcriptModeParagraphs') }}
      </BFormCheckbox>
      <p
        class="bg-light p-2 rounded-sm border-dark"
        v-for="(paragraph, index) in transcriptParagraphs"
        :key="index"
      >
        {{ paragraph }}
      </p>
    </section>

    <template #modal-footer="{ close }">
      <BButton variant="outline-secondary" size="sm" @click="close()">
        {{ $t('close') }}
      </BButton>
    </template>
  </InfoModal>
</template>
<style>
.ContentItemModal .ContentItemCitation {
  display: inline-block;
}
</style>
<script setup lang="ts">
import BButton from '@/components/legacy/bootstrap/BButton.vue'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import InfoModal from '../InfoModal.vue'
import { computed, ref } from 'vue'
import ContentItem from '../modules/lists/ContentItem.vue'
import ContentItemCitation from '../ContentItemCitation.vue'
import BFormCheckbox from '../legacy/bootstrap/BFormCheckbox.vue'

/** Content Item to display metadata for */
export type ContentItemModalProps = {
  item: ContentItemType
  isVisible?: boolean
}

const AvailableModes = ['card', 'transcript'] as const
type AvailableModes = (typeof AvailableModes)[number]

const AvailableFields = [
  'id',
  'text.title',
  'semanticEnrichments.ocrQuality',
  'access.copyright',
  'meta.date',
  'meta.mediaId',
  'meta.sourceMedium',
  'meta.countryCode',
  'meta.provinceCode',
  'meta.partnerId',

  'text.contentLength',
  'text.documentType',
  'text.itemType',
  'text.langCode',
  'text.originalLangCode',
  'text.snippet',
  'image.isFrontPage'
] as const

const AccessBitmapFields = [
  'access.accessBitmaps.explore',
  'access.accessBitmaps.getTranscript',
  'access.accessBitmaps.getImages'
] as const

const mode = ref<AvailableModes>('transcript')
const props = withDefaults(defineProps<ContentItemModalProps>(), {
  isVisible: false
})

const TranscriptModeLinear = 'linear'
const TranscriptModeParagraphs = 'paragraphs'
const transcriptMode = ref(TranscriptModeParagraphs)
/**
 * Helper function to get nested property values using dot notation
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}

const fields = computed(() => {
  return AvailableFields.map(field => getNestedValue(props.item, field) ?? '-')
})

const transcriptParagraphs = computed(() => {
  if (!props.item.text?.content) return []
  //
  // "image": {
  //   "isCoordinatesConverted": true,
  //   "isFrontPage": false,
  //   "lineBreaks": [
  //     19,
  //     75,
  //     93,
  //     151,
  //     213,
  //     253,
  //     299,
  //     363,
  //     424,
  //     449,
  //     503,
  //     534,
  //     600,
  //     663,
  //     693
  //   ],
  // use line breaks to split the transcript into paragraphs

  const lineBreaks = props.item.image?.lineBreaks ?? []
  const content = props.item.text.content
  const paragraphs = []
  let lastIndex = 0
  for (const breakIndex of lineBreaks) {
    paragraphs.push(content.slice(lastIndex, breakIndex))
    lastIndex = breakIndex
  }
  // push remaining content as last paragraph  if (lastIndex < content.length) {
  paragraphs.push(content.slice(lastIndex))

  return paragraphs
})

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()
</script>

<style scoped lang="scss">
.ContentItemModal {
  pre {
    max-height: 600px;
    overflow-y: auto;
    font-size: 0.85rem;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
}
</style>
