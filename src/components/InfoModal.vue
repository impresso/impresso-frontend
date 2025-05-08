<template>
  <Modal
    :show="isVisible"
    :title="modalTitle ?? title"
    modalClasses="InfoModal"
    :dialogClass="props.dialogClass"
    @close="dismiss"
  >
    <h1>{{ title }}</h1>
    <slot></slot>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './base/Modal.vue'

export type InfoModalProps = {
  dialogClass?: string
  modalTitle?: string
  title?: string
  isVisible?: boolean
}

const props = withDefaults(defineProps<InfoModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-md',
  title: 'Info'
})

const emit = defineEmits(['dismiss'])

function dismiss() {
  emit('dismiss')
}
</script>
