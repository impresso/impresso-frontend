<template>
  <Modal
    :show="isVisible"
    :title="title"
    modalClasses="ChangePlanModal"
    :dialogClass="props.dialogClass"
    @close="dismiss"
    @confirm="confirm"
  >
    <h1>{{ title }}</h1>
    <p>
      You can request to change your plan. Your current plan is
      <b> {{ availablePlansLabels[userPlan] }} </b>. <br />
      Please select the plan you want to change to:
    </p>
    <div v-if="!isLoading && userChangePlanRequest">
      <Alert class="bg-info" style="position: sticky; top: 0">
        ehi {{ userChangePlanRequest }}
      </Alert>
    </div>
    <ChangePlanForm
      :availablePlanLabels="availablePlansLabels"
      :availablePlans="availablePlans"
      :error="null"
      :plan="props.userPlan"
      @submit="submit"
    />
  </Modal>
</template>

<script setup lang="ts">
import ChangePlanForm from './ChangePlanForm.vue'
import { defineProps, defineEmits, ref } from 'vue'
import Modal from './base/Modal.vue'
import Alert from './Alert.vue'
import type { UserChangePlanRequest } from '@/services/types'

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
    onSubmit?: (plan: string) => void
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-md',
    isLoading: false
  }
)

const emit = defineEmits(['dismiss', 'confirm'])

const dismiss = () => {
  console.debug('[ChangePlanModal] dismiss')
  emit('dismiss')
}
const confirm = () => {
  console.debug('[ChangePlanModal] confirm', selectedPlan.value)
  emit('confirm')
}
const submit = ({ plan }) => {
  console.debug('[ChangePlanModal] submit', plan)
  if (typeof props.onSubmit === 'function') {
    props.onSubmit({ plan })
  }
}
</script>

<style>
.ChangePlanModal {
  z-index: 1003;
}
.ChangePlanModal h2,
.ChangePlanModal h3 {
  font-size: inherit;
}
</style>
