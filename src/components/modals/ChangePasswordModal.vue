<template>
  <Modal
    :show="isVisible"
    :title="titleModal ?? title"
    modalClass="ChangePasswordModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0"
    @close="dismiss"
    hideBackdrop
  >
    <ChangePasswordForm :is-loading="isLoading" class="pt-3 px-3" @submit="handleOnSubmit">
      <template #form-errors v-if="error">
        <Alert type="warning" class="mb-3 p-3" role="alert">
          <p class="m-0">{{ error.message }}</p>
        </Alert>
      </template>
    </ChangePasswordForm>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChangePasswordForm from 'impresso-ui-components/components/ChangePasswordForm.vue'
import type { PasswordChangePayload } from 'impresso-ui-components/components/ChangePasswordForm.vue'
import type { FeathersError } from '@feathersjs/errors'
import Alert from 'impresso-ui-components/components/Alert.vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import { changePassword as changePasswordService } from '@/services'
export type ChangePasswordModalProps = {
  dialogClass?: string
  title?: string
  titleModal?: string
  isVisible?: boolean
  isLoading?: boolean
}

const isLoading = ref(false)
const error = ref<FeathersError | null>(null)

const props = withDefaults(defineProps<ChangePasswordModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-md p-0',
  title: 'Change Password'
})

function handleOnSubmit(payload: PasswordChangePayload) {
  isLoading.value = true
  console.debug('[ChangePasswordModal] handleOnSubmit', payload)
  changePasswordService
    .create(payload, {
      ignoreErrors: true
    })
    .then((res: any) => {
      console.debug('[ChangePasswordModal] Password changed successfully', res)
      emit('success')
    })
    .catch((err: FeathersError) => {
      error.value = err
      console.error('[ChangePasswordModal] Error changing password:', err)
    })
    .finally(() => {
      isLoading.value = false
    })
}
const emit = defineEmits(['dismiss', 'success'])

const dismiss = () => {
  console.debug('[ChangePasswordModal] dismiss')
  emit('dismiss')
}
</script>

<style>
.ChangePasswordModal h2,
.ChangePasswordModal h3 {
  font-size: inherit;
}
</style>
