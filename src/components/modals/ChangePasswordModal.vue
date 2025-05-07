<template>
  <Modal
    :show="isVisible"
    :title="titleModal ?? title"
    modalClass="ChangePasswordModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0"
    @close="dismiss"
    @confirm="confirm"
    hideBackdrop
  >
    <ChangePasswordForm
      class="pt-3 px-3"
      @submit="(payload: PasswordChangePayload) => emit('submit', payload)"
    />
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import ChangePasswordForm from '../forms/ChangePasswordForm.vue'
import type { PasswordChangePayload } from '../forms/ChangePasswordForm.vue'
import Modal from '@/components/base/Modal.vue'

export type ChangePasswordModalProps = {
  dialogClass?: string
  title?: string
  titleModal?: string
  isVisible?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<ChangePasswordModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-md p-0',
  title: 'Change Password'
})

const emit = defineEmits(['dismiss', 'confirm', 'submit'])

const dismiss = () => {
  console.debug('[ChangePasswordModal] dismiss')
  emit('dismiss')
}
const confirm = () => {
  console.debug('[ChangePasswordModal] confirm')
  emit('confirm')
}
</script>

<style>
.ChangePasswordModal h2,
.ChangePasswordModal h3 {
  font-size: inherit;
}
</style>
