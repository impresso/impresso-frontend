<template>
  <Modal
    :show="isVisible"
    :dialogClass="dialogClass"
    bodyClass="pt-0 pe-4 ps-2"
    @shown="delayIframePreview"
    @close="emit('dismiss')"
  >
    <div class="container-fluid">
      <div class="row">
        <div class="col-8" style="height: 500px">
          <iframe
            :src="iframeSrc"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
            frameborder="0"
            allow="autoplay; fullscreen"
            allowfullscreen
            ><p>Your browser does not support iframes.</p></iframe
          >
        </div>
        <div class="col-4">
          {{ iframeSrc }}
        </div>
      </div>
    </div>

    <template #modal-footer="{ close }">
      <b-button variant="outline-primary" size="sm" v-on:click="copyArticleUrlToClipboard()"
        >{{ $t('copy_to_clipboard') }}
      </b-button>
      <b-button variant="outline-secondary" size="sm" @click="close()">
        {{ $t('close') }}
      </b-button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'

import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import { computed } from 'vue'
import { WidgetBaseUrl } from '@/constants'
/** Content Item to share */
export type ShareContentItemModalProps = {
  item: ContentItemType
  dialogClass?: string
  isVisible?: boolean
}

const props = withDefaults(defineProps<ShareContentItemModalProps>(), {
  dialogClass: ' modal-lg p-0 modal-dialog-centered'
})
const iframeSrc = computed(() => {
  return `${window.location.origin}${WidgetBaseUrl}/ci/${props.item.id}`.split(/\/+/).join('/')
})

const copyArticleUrlToClipboard = async () => {
  // this.$refs.inputLink.select()
  // const text = [this.iframeCode, this.iframeCaptionCode].join('\n')
  // console.info('[CopyToClipboard] copyArticleUrlToClipboard', text)
  // await navigator.clipboard.writeText(text)
  // const title = this.$t('url_copied_title')
  // const message = this.$tc('url_copied_message')
  // this.addNotification({ title, message, type: 'success' })
}

const delayIframePreview = () => {
  // Placeholder for any logic needed when the modal is shown
}

const emit = defineEmits(['dismiss'])
</script>
