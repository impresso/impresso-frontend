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
    <h1>{{ title }}</h1>
    <p>
      You can request to change your plan any time if your situation changed. More information about
      the plans can be found in the <a href="/plans">Plans page</a>.
    </p>
    <p v-if="!isLoading && !userChangePlanRequest">
      Your current plan is
      <b> {{ availablePlansLabels[userPlan] }} </b>. <br />
      Please select the plan you want to change to:
    </p>
    <div v-if="!isLoading && userChangePlanRequest">
      <Alert
        class="mb-3"
        :type="alertType"
        :class="userChangePlanRequest.status"
        style="position: sticky; top: 0"
      >
        <UserChangePlanRequestLabel
          :item="userChangePlanRequest"
          :plansLabels="availablePlansLabels"
        />
      </Alert>
    </div>
    <LoadingBlock :height="200" v-if="isLoading" label="please wait ...."> </LoadingBlock>
    <ChangePlanForm
      v-if="!isLoading"
      :availablePlansLabels="availablePlansLabels"
      :availablePlans="availablePlans"
      :error="null"
      :current-plan="props.userPlan"
      :userChangePlanRequest="userChangePlanRequest"
      :allow-all-plans="!userChangePlanRequest"
      @submit="submit"
    />

    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>

    <p class="mt-2 mb-0">
      Any Questions? <br />
      Contact us at <a href="mailto:info@impresso-project.ch">info@impresso-project.ch</a>
    </p>
  </Modal>
</template>

<script setup lang="ts">
import ChangePlanForm from './ChangePlanForm.vue'
import UserChangePlanRequestLabel from './UserChangePlanRequestLabel.vue'
import { computed, ref } from 'vue'
import Modal from './base/Modal.vue'
import Alert from './Alert.vue'
import type { UserChangePlanRequest } from '@/services/types'
import LoadingBlock from './LoadingBlock.vue'

const selectedPlan = ref<string>('')

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    title?: string
    isVisible?: boolean
    userChangePlanRequest: UserChangePlanRequest | null
    isLoading?: boolean
    userPlan: string
    availablePlans: string[]
    availablePlansLabels: Record<string, string>
    onSubmit?: ({ plan }: { plan: string }) => void
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-md',
    isLoading: false
  }
)

const alertType = computed(() => {
  if (!props.userChangePlanRequest) {
    return 'info'
  }
  if (props.userChangePlanRequest.status === 'pending') {
    return 'info'
  }
  return props.userChangePlanRequest.status === 'rejected' ? 'warning' : 'success'
})

const emit = defineEmits(['dismiss', 'confirm'])

const dismiss = () => {
  console.debug('[ChangePlanModal] dismiss')
  emit('dismiss')
}
const confirm = () => {
  console.debug('[ChangePlanModal] confirm', selectedPlan.value)
  emit('confirm')
}
const submit = ({ plan }: { plan: string }) => {
  console.debug('[ChangePlanModal] submit', plan)
  if (typeof props.onSubmit === 'function') {
    props.onSubmit({ plan })
  }
}
</script>

<style>
.ChangePlanModal h2,
.ChangePlanModal h3 {
  font-size: inherit;
}
</style>
