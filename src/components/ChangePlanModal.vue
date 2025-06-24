<template>
  <Modal
    :show="show"
    :title="title"
    modalClass="ChangePlanModal"
    dialogClass="modal-dialog-centered modal-dialog-scrollable modal-md-lg"
    @close="() => emit('dismiss')"
    hideBackdrop
    hideFooter
  >
    <slot> </slot>
    <LoadingBlock :height="200" v-if="isLoading" label="please wait ...."> </LoadingBlock>
    <ChangePlanForm
      v-if="!isLoading"
      :availablePlans="AvailablePlansWithLabels"
      @submit="handleOnSubmit"
      :is-loading="isLoading"
      :currentPlan="userPlan"
      :rejectedPlan="rejectedPlan"
      :pendingPlan="pendingPlan"
      :currentAffiliation="currentAffiliation"
      :currentInstitutionalUrl="currentInstitutionalUrl"
      :currentEmail="currentEmail"
      enableAdditionalFields
      :submitLabel="submitLabel"
      inline
    >
      <template #form-errors v-if="error">
        <Alert type="warning" class="mb-3 p-3" role="alert">
          <p class="m-0">{{ error.message }}</p>
        </Alert>
      </template>
    </ChangePlanForm>
  </Modal>
</template>

<script setup lang="ts">
import ChangePlanForm from 'impresso-ui-components/components/ChangePlanForm.vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import { computed, ref, watch } from 'vue'

import type { FeathersError } from '@feathersjs/errors'
import type { UserChangePlanRequest } from '@/services/types/index'
import LoadingBlock from './LoadingBlock.vue'
import { AvailablePlansWithLabels } from '@/constants'
import {
  userChangePlanRequest as userChangePlanRequestService,
  me as userService
} from '../services'
import type { User } from '@/models'
import { useUserStore } from '@/stores/user'

const props = withDefaults(
  defineProps<{
    show: boolean
    title: string
    submitLabel?: string
  }>(),
  {
    show: false,
    title: 'Change Plan',
    dialogClass: 'modal-lg modal-dialog-centered modal-dialog-scrollable',
    userChangePlanRequest: null,
    onSubmit: null,
    submitLabel: 'Confirm your plan selection'
  }
)

// refs
const rejectedPlan = ref<string | null>(null)
const pendingPlan = ref<string | null>(null)
const currentAffiliation = ref<string>('')
const currentInstitutionalUrl = ref<string>('')
const currentEmail = ref<string>('')
const isLoading = ref(true)
const error = ref<FeathersError | null>(null)

const userStore = useUserStore()
const userPlan = computed(() => userStore.userPlan)

const emit = defineEmits<{
  dismiss: []
  success: []
}>()

async function handleOnSubmit(payload: {
  plan: string
  email?: string
  affiliation?: string
  institutionalUrl?: string
}) {
  // Emit success event to notify parent component
  console.info('[ChangePlanModal] handleOnSubmit', payload)
  if (payload.email || payload.affiliation || payload.institutionalUrl) {
    // If any of the optional fields are provided, update the user service
    await userService
      .patch(null, {
        affiliation: payload.affiliation || currentAffiliation.value,
        institutionalUrl: payload.institutionalUrl || currentInstitutionalUrl.value,
        email: payload.email || currentEmail.value
      })
      .then(data => {
        console.info('[ChangePlanModal] User updated successfully:', data)
      })
      .catch((err: FeathersError) => {
        error.value = err
        console.error('[ChangePlanModal] Error updating user:', err.message, err.data)
      })
  }

  await userChangePlanRequestService
    .create({
      plan: payload.plan
    })
    .then(data => {
      console.info('[ChangePlanModal] Plan-change request created successfully. data:', data)
      emit('success')
    })
    .catch((err: FeathersError) => {
      error.value = err
      console.error('[ChangePlanModal] create', err.message, err.data)
    })
  // emit("success")
}

const fetchUser = async () => {
  isLoading.value = true
  // get user plan from store
  // get affiliation adn insitutionalUrl from user service
  await userService
    .find()
    .then((data: User) => {
      currentAffiliation.value = data.affiliation || ''
      currentInstitutionalUrl.value = data.institutionalUrl || ''
      currentEmail.value = data.email || ''
      console.debug(
        '[ChangePlanRequestModal] fetchUser success:',
        currentAffiliation.value,
        currentInstitutionalUrl.value,
        currentEmail.value
      )
    })
    .catch((err: FeathersError) => {
      error.value = err
      console.warn('[ChangePlanRequestModal] fetchUser error ', err, err.message, err.data)
    })
  await userChangePlanRequestService
    .find()
    .then((data: UserChangePlanRequest) => {
      console.info('[ChangePlanRequestModal] @useEffect - userChangePlanRequestService', data)
      rejectedPlan.value = data.status === 'rejected' ? data.plan.name : null
      pendingPlan.value = data.status === 'pending' ? data.plan.name : null
    })
    .catch((err: FeathersError) => {
      if (err.code === 404) {
        // If no change plan request exists, we can ignore this error
        console.warn('[ChangePlanModal] No change plan request found, ignoring error:', err.message)
        rejectedPlan.value = null
        pendingPlan.value = null
        return
      }
      error.value = err

      console.error(
        '[ChangePlanModal] @useEffect - userChangePlanRequestService',
        err.message,
        err.data,
        err.code
      )
    })
  isLoading.value = false
}

watch(
  () => props.show,
  newShow => {
    if (newShow) {
      fetchUser()
    }
  },
  { immediate: true }
)
</script>

<style>
.ChangePlanModal h2,
.ChangePlanModal h3 {
  font-size: inherit;
}
</style>
