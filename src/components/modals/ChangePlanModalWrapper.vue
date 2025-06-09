<template>
  <ChangePlanModal
    :available-plans="availablePlans"
    :available-plans-labels="PlanLabels"
    :userPlan="userPlan"
    :isVisible="isVisible"
    :title="$t('Change Plan')"
    @dismiss="emit('dismiss')"
    :userChangePlanRequest="userChangePlanRequestResponse.data"
    :isLoading="
      userChangePlanRequestResponse.status === 'loading' ||
      userChangePlanRequestResponse.status === 'idle'
    "
    @submit="patchCurrentPlanChangeRequest"
  />
</template>

<script setup lang="ts">
import ChangePlanModal from './ChangePlanModal.vue'
import { ref } from 'vue'
import { userChangePlanRequest as userChangePlanRequestService } from '@/services'
import type { UserChangePlanRequest } from '@/services/types'
import type { FeathersError } from '@feathersjs/errors'

export interface ChangePlanModalWrapperProps {
  isVisible?: boolean,
  userPlan?: string,
  availablePlans
}

const props = withDefaults(defineProps<ChangePlanModalWrapperProps>(), {
  isVisible: false,
  userPlan: '',
})

const emit = defineEmits<{
  success: [UserChangePlanRequest]
  dismiss: []
}>()
const userChangePlanRequestResponse = ref<{
  data: UserChangePlanRequest | null
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: null
})

const patchCurrentPlanChangeRequest = async ({ plan }) => {
  console.debug('[ChangePlanModalWrapper] @patchCurrentPlanChangeRequest', plan)
  await userChangePlanRequestService
    .create({
      plan
    })
    .then(data => {
      console.info('[ChangePlanModalWrapper] Password changed successfully. data:', data)
      emit('success', data)
    })
    .catch((err: FeathersError) => {
      console.error('[ChangePlanModalWrapper] create', err.message, err.data)
    })
}
</script>
