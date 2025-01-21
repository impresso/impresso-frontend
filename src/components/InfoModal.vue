<template>
  <Modal
    :show="isVisible"
    :title="title"
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

const props = withDefaults(
  defineProps<{
    isVisible: boolean
    title: string
    dialogClass?: string
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-md',
    title: 'Info'
  }
)

const emit = defineEmits(['dismiss'])

function dismiss() {
  emit('dismiss')
}
</script>
