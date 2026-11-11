<template>
  <template v-if="canCopy">
    <button
      type="button"
      class="ContentItemCopyText btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
      v-bind="$attrs"
      @click="isModalVisible = true"
    >
      <Icon name="copy" :scale="0.66" :stroke-width="1.5" />
      {{ $t('actions.copyText') }}
    </button>
    <Teleport to="body">
      <Modal
        :show="isModalVisible"
        :title="$t('modalTitle')"
        modal-class="ContentItemCopyTextModal"
        dialog-class="modal-dialog-centered"
        @close="isModalVisible = false"
      >
        <p class="ContentItemCopyTextModal__lead">{{ $t('publicDomain') }}</p>
        <Alert type="warning" class="mb-3">{{ $t('ocrWarning') }}</Alert>
        <section class="ContentItemCopyTextModal__citation border-top pt-3">
          <h3 class="small-caps-bold mb-1">{{ $t('citeAs') }}</h3>
          <ContentItemCitation
            v-if="isModalVisible"
            class="small"
            :content-item="contentItem"
            @citation-generated="handleCitationGenerated"
          />
          <BFormCheckbox v-model="includeCitation" switch class="mt-2 small">
            {{ $t('includeCitation') }}
          </BFormCheckbox>
        </section>

        <template #modal-footer="{ close }">
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="close()">
            {{ $t('actions.cancel') }}
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="!transcript"
            @click="copyToClipboard"
          >
            {{ $t('actions.copy') }}
          </button>
        </template>
      </Modal>
    </Teleport>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import Icon from '@/components/base/Icon.vue'
import ContentItemCitation from '@/components/ContentItemCitation.vue'
import BFormCheckbox from '@/components/legacy/bootstrap/BFormCheckbox.vue'
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'
import { useContentItemAccess } from '@/composables/useContentItemAccess'
import { useNotificationsStore } from '@/stores/notifications'

defineOptions({
  inheritAttrs: false
})

export interface ContentItemCopyTextProps {
  contentItem: ContentItemType
}

const props = defineProps<ContentItemCopyTextProps>()

const notificationsStore = useNotificationsStore()
const { hasTranscriptAccess } = useContentItemAccess(() => props.contentItem)

const isModalVisible = ref(false)
const includeCitation = ref(true)
const citation = ref('')

/** without transcript access the backend returns a redacted text, so there is nothing to copy */
const canCopy = computed(
  () => props.contentItem.access?.copyright === 'pbl' && hasTranscriptAccess.value
)

/** the transcript as one string, with a blank line between paragraphs */
const transcript = computed(() => {
  const content = props.contentItem.text?.content ?? ''
  const breaks = (props.contentItem.facsimile?.paragraphBreaks ?? []).filter(
    offset => offset > 0 && offset < content.length
  )
  const offsets = [0, ...breaks, content.length]
  return offsets
    .slice(1)
    .map((end, i) => content.slice(offsets[i], end).trim())
    .filter(Boolean)
    .join('\n\n')
})

const handleCitationGenerated = (html: string) => {
  citation.value = new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() ?? ''
}

const copyToClipboard = async () => {
  const text =
    includeCitation.value && citation.value
      ? `${transcript.value}\n\n${citation.value}`
      : transcript.value
  try {
    await navigator.clipboard.writeText(text)
    notificationsStore.addNotification({
      type: 'success',
      title: 'Copied',
      message: 'The text was copied to your clipboard.'
    })
    isModalVisible.value = false
  } catch (error) {
    console.error('[ContentItemCopyText] Failed to copy to clipboard:', error)
    notificationsStore.addNotification({
      type: 'error',
      title: 'Copy failed',
      message: 'The text could not be copied to your clipboard.'
    })
  }
}
</script>

<style>
.ContentItemCopyTextModal .modal-header {
  border-bottom: none;
  padding-bottom: 0;
}
.ContentItemCopyTextModal__lead {
  text-wrap: pretty;
}
.ContentItemCopyTextModal__citation h2,
.ContentItemCopyTextModal__citation a {
  font-size: inherit;
  overflow-wrap: anywhere;
}
</style>

<i18n lang="json">
{
  "en": {
    "actions": {
      "copyText": "Copy text",
      "copy": "Copy to clipboard",
      "cancel": "Cancel"
    },
    "modalTitle": "Copy text",
    "publicDomain": "This content item is in the public domain: you are free to copy, reuse and share its text. Please cite the source when you do.",
    "ocrWarning": "The text was produced automatically by optical character recognition (OCR) and may contain errors. Check it against the facsimile before reusing it.",
    "citeAs": "Cite as",
    "includeCitation": "Add the citation after the copied text"
  }
}
</i18n>
