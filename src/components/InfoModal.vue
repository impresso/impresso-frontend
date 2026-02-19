<template>
  <Modal
    :show="isVisible"
    :title="modalTitle ?? title"
    modalClass="InfoModal"
    :dialogClass="props.dialogClass"
    @close="dismiss"
    :hideFooter="props.hideFooter"
  >
    <template v-slot:modal-header-extra><slot name="modal-header-extra"></slot></template>
    <h5 v-if="title" class="mb-4">{{ title }}</h5>
    <slot></slot>
    <template v-slot:modal-footer>
      <button
        v-if="!hideFooter"
        type="button"
        class="btn btn-sm btn-outline-secondary"
        @click="dismiss"
      >
        {{ $t('actions.dismiss') }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'

export type InfoModalProps = {
  dialogClass?: string
  modalTitle?: string
  title?: string
  isVisible?: boolean
  hideFooter?: boolean
}

const props = withDefaults(defineProps<InfoModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-md',
  modalTitle: 'Info',
  hideFooter: false
})

const emit = defineEmits(['dismiss'])

function dismiss() {
  emit('dismiss')
}
</script>
<style>
.InfoModal .modal-header {
  border-bottom: none;
  padding-right: var(--spacing-1);
  padding-bottom: var(--spacing-1);
}

.InfoModal .modal-footer {
  border-top: none;
  padding-right: var(--spacing-2);
  padding-bottom: var(--spacing-2);
}
</style>
