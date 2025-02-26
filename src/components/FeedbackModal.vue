<template>
  <Modal
    :show="isVisible"
    :title="title"
    modalClass="ChangePlanModal"
    :dialogClass="props.dialogClass"
    @close="dismiss"
    @confirm="confirm"
    hideBackdrop
  >
    <LoadingBlock :height="100" v-if="isLoading" label="please wait ...."> </LoadingBlock>
    <FeedbackForm v-if="!isLoading" class="mt-2" />
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import Modal from './base/Modal.vue'
import LoadingBlock from './LoadingBlock.vue'
import FeedbackForm from './FeedbackForm.vue'

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    title?: string
    isVisible?: boolean
    errorCode?: string
    isLoading?: boolean
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-md',
    isLoading: false
  }
)
const emit = defineEmits(['dismiss', 'confirm'])

const dismiss = () => {
  console.debug('[FeedbackModal] dismiss')
  emit('dismiss')
}
const confirm = () => {
  console.debug('[FeedbackModal] confirm')
  emit('confirm')
}
</script>
