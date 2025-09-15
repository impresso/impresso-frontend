<template>
  <Modal
    :show="isVisible"
    :title="modalTitle ?? title"
    modalClasses="BaristModal"
    :dialogClass="props.dialogClass"
    @close="dismiss"
  >
    <h1>{{ title }}</h1>
    <LoadingBlock v-if="isLoading" :height="200" />
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import LoadingBlock from '../LoadingBlock.vue'

export type BaristModalProps = {
  dialogClass?: string
  modalTitle?: string
  title?: string
  isVisible?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<BaristModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-md',
  title: 'Barista'
})

const emit = defineEmits(['dismiss'])

function dismiss() {
  emit('dismiss')
}
</script>
