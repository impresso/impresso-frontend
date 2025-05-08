<template>
  <Suspense v-if="shouldMountComponent">
    <ChangePasswordModal :isVisible="isVisible" @dismiss="() => emit('dismiss')" @submit="onSubmit">
      <template v-if="error" #form-errors>
        <FeathersErrorManager :error="error" />
      </template>
    </ChangePasswordModal>
    <!-- loading state via #fallback slot -->
    <template #fallback> Loading... </template>
  </Suspense>
</template>
<script setup lang="ts">
/**
 * @component ChangePasswordModalWrapper
 * @description This component serves as a wrapper for the ChangePasswordModal component.
 * It is designed to be used within a modal context, allowing users to change their password.
 *
 */
import { ref, defineAsyncComponent, watch } from 'vue'
import { changePassword as changePasswordService } from '@/services'
import type { PasswordChangePayload } from '../forms/ChangePasswordForm.vue'
import type { FeathersError } from '@feathersjs/errors'
import FeathersErrorManager from '../FeathersErrorManager.vue'

export type ChangePasswordModalWrapperProps = {
  isVisible?: boolean
  delay?: number
}
const props = withDefaults(defineProps<ChangePasswordModalWrapperProps>(), {
  isVisible: false,
  delay: 0
})
const shouldMountComponent = ref(false)
const error = ref<FeathersError | null>(null)
const ChangePasswordModal = defineAsyncComponent(async () => {
  // Simulate a larger component with a delay
  await new Promise(resolve => setTimeout(resolve, props.delay))
  return import('./ChangePasswordModal.vue')
})
const onSubmit = (payload: PasswordChangePayload) => {

  changePasswordService
    .create(
      {
        newPassword: payload.newPassword,
        repeatNewPassword: payload.repeatNewPassword,
        currentPassword: payload.currentPassword
      },
      {
        ignoreErrors: true
      }
    )
    .then(data => {
      console.info('[ChangePasswordModal] Password changed successfully. data:', data)
      emit('success')
    })
    .catch((err: FeathersError) => {
      console.error('[ChangePasswordModal] create', err.message, JSON.stringify(err, null, 2))
      error.value = err
    })
}
// emit dismiss event
const emit = defineEmits(['dismiss', 'success'])

watch(
  () => props.isVisible,
  v => {
    if (v && !shouldMountComponent.value) {
      console.debug('[ChangePasswordModal] isVisible', v)
      // If the modal should be visible but not already loaded, set needsToBeLoaded to true) {
      shouldMountComponent.value = true
    }
  },
  { immediate: true }
)
console.log('[ChangePasswordModal] isVisible', props.isVisible)
</script>
