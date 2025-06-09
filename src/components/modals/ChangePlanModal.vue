<template>
  <Modal
    :show="isVisible"
    :title="title"
    modalClass="ChangePlanModal"
    :dialogClass="props.dialogClass"
    bodyClass="px-4 pt-4 pb-0"
    @close="dismiss"
    @confirm="confirm"
    hideBackdrop
  >
    <slot name="disclaimer">
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
    </slot>

    <p>
      You can request to change your plan any time if your situation changed. More information about
      the plans can be found in the <a href="/plans">Plans page</a>.<br />
      For any further questions, please contact us at
      <a href="mailto:info@impresso-project.ch">info@impresso-project.ch</a>
    </p>
    <p v-if="!isLoading && !userChangePlanRequest">
      Your current plan is
      <b> {{ availablePlansLabels[userPlan] }} </b>. <br />
      Please select the plan you want to change to:
    </p>
    <LoadingBlock :height="200" v-if="isLoading" label="please wait ...."> </LoadingBlock>
    <ChangePlanForm
      v-if="!isLoading"
      inline
      :availablePlansLabels="availablePlansLabels"
      :availablePlans="availablePlans"
      :error="null"
      :pending-plan="pendingPlan"
      :rejected-plan="rejectedPlan"
      :current-plan="props.userPlan"
      :userChangePlanRequest="userChangePlanRequest"
      :allow-all-plans="!userChangePlanRequest"
      @submit="submit"
    />

    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import ChangePlanForm from 'impresso-ui-components/components/ChangePlanForm.vue'
import UserChangePlanRequestLabel from '../UserChangePlanRequestLabel.vue'
import { computed, ref } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import type { UserChangePlanRequest } from '@/services/types/index'
import LoadingBlock from '../LoadingBlock.vue'

const selectedPlan = ref<string>('')

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    title?: string
    isVisible?: boolean
    userChangePlanRequest: UserChangePlanRequest | null
    isLoading?: boolean
    userPlan: string
    availablePlansLabels: Record<string, string>
    onSubmit?: ({ plan }: { plan: string }) => void
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-md',
    isLoading: false
  }
)

const availablePlans = computed(() => {
  return Object.keys(props.availablePlansLabels).map(plan => ({
    name: plan,
    label: props.availablePlansLabels[plan],
    description: `Change to ${props.availablePlansLabels[plan]} plan`
  }))
})

const pendingPlan = computed(() => {
  if (!props.userChangePlanRequest) {
    return null
  }
  return props.userChangePlanRequest.status === 'pending'
    ? props.userChangePlanRequest.plan.name
    : null
})
const rejectedPlan = computed(() => {
  if (!props.userChangePlanRequest) {
    return null
  }
  return props.userChangePlanRequest.status === 'rejected'
    ? props.userChangePlanRequest.plan.name
    : null
})

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
