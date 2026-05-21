<template>
  <Modal
    :show="true"
    title="Media Source"
    @hidden="$emit('close')"
    dialogClass="modal-xxl modal-dialog-centered modal-dialog-scrollable"
  >
    <MediaSourceMetadata :media-source="props.item" />
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import MediaSourceMetadata from './MediaSourceMetadata.vue'
import { MediaSource } from '@/models/generated/canonical'

export interface MediaSourceModalProps {
  item?: MediaSource
}

const props = defineProps<MediaSourceModalProps>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>
