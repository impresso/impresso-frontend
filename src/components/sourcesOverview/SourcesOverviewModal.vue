<template>
  <Modal
    :show="isVisible"
    :title="modalTitle"
    :modalClass="modalClass"
    :dialogClass="dialogClass"
    bodyClass="pt-0 pe-4 ps-2"
    @close="emit('dismiss')"
    @confirm="emit('confirm')"
    hideBackdrop
  >
    <h1 class="mt-3">{{ title }}</h1>
    <LoadingBlock v-if="isLoading" :height="300" />
  </Modal>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import LoadingBlock from '../LoadingBlock.vue'

export type SourcesOverviewModalProps = {
  dialogClass?: string
  modalClass?: string
  title?: string
  modalTitle?: string
  isVisible?: boolean
  requestDelay?: number
}
withDefaults(defineProps<SourcesOverviewModalProps>(), {
  dialogClass: 'modal-dialog-scrollable',
  title: 'Sources Overview: welcome!',
  modalTitle: 'Current Impresso data rundown',
  requestDelay: 10
})
const emit = defineEmits(['dismiss', 'confirm'])
const isLoading = ref(true)
</script>
