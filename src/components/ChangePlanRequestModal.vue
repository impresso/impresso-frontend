<template>
  <Modal
    hideFooter
    :title="title"
    :show="show"
    @close="() => emit('dismiss')"
    bodyClass="px-3 pt-3 pb-0"
    dialogClass="ChangePlanRequestModal modal-lg-md modal-dialog-centered modal-dialog-scrollable"
  >
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
    >
      <template #form-errors v-if="error">
        <Alert type="warning" class="mb-3 p-3" role="alert">
          <p class="m-0">{{ error.message }}</p>
        </Alert>
      </template>
    </ChangePlanForm>
  </Modal>
</template>

<script lang="ts" setup>
import ChangePlanForm from 'impresso-ui-components/components/ChangePlanForm.vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import { AvailablePlansWithLabels } from '../constants'
import { computed, ref, watch } from 'vue'
import type { FeathersError } from '@feathersjs/errors'
import {
  userChangePlanRequest as userChangePlanRequestService,
  me as userService
} from '../services'
import type { User, UserChangePlanRequest } from '../services/types'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

export interface ChangePlanRequestModalProps {
  show?: boolean
  title?: string
}

const props = withDefaults(defineProps<ChangePlanRequestModalProps>(), {
  show: true,
  title: 'Change Plan'
})
// refs
const userPlan = computed(() => userStore.userPlan)
const rejectedPlan = ref<string | undefined>(undefined)
const pendingPlan = ref<string | undefined>(undefined)
const currentAffiliation = ref<string>('')
const currentInstitutionalUrl = ref<string>('')
const currentEmail = ref<string>('')
const isLoading = ref(true)
const error = ref<FeathersError | null>(null)

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
  // userPlan.value = usePersistentStore.getState().userPlan
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
      error.value = err
      console.error(
        '[ChangePlanModal] @useEffect - userChangePlanRequestService',
        err.message,
        err.data
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
.ChangePlanRequestModal .position-sticky {
  background: linear-gradient(#ffffff00 0%, #ffffff 30%, #ffffff);
}
.ChangePlanRequestModal .bg-white {
  --bs-bg-opacity: 0;
  background-color: transparent !important;
}
.ChangePlanRequestModal .ChangePlanForm label .badge {
  background-color: var(--impresso-color-black) !important;
}
</style>
