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
    <p>You can request to change your plan. Please select the plan you want to change to.</p>
    <div v-if="!isLoading && userChangePlanRequest">
      <Alert class="bg-info" style="position: sticky; top: 0">
        ehi {{ userChangePlanRequest }}
      </Alert>
    </div>
    <form @submit.prevent="submit">
      <div class="form-check">
        <input
          v-model="plan"
          class="form-check-input"
          type="radio"
          name="flexRadioDefault"
          id="flexRadioDefault1"
          value="basic"
        />
        <label class="form-check-label" for="flexRadioDefault1"> Default radio </label>
      </div>
      <div class="form-check">
        <input
          v-model="plan"
          class="form-check-input"
          type="radio"
          name="flexRadioDefault"
          id="flexRadioDefault2"
          value="educational"
        />
        <label class="form-check-label" for="flexRadioDefault2"> Default checked radio </label>
      </div>
      <button type="submit" class="btn btn-sm btn-outline-secondary">Submit</button>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import Modal from './base/Modal.vue'
import Alert from './Alert.vue'
import type { UserChangePlanRequest } from '@/services/types'

const plan = ref<string>('')

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    title?: string
    isVisible?: boolean
    userChangePlanRequest: UserChangePlanRequest | null
    isLoading?: boolean
    onSubmit?: (plan: string) => void
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-lg',
    isLoading: false
  }
)

const emit = defineEmits(['dismiss', 'confirm'])

const dismiss = () => {
  console.debug('[ChangePlanModal] dismiss')
  emit('dismiss')
}
const confirm = () => {
  console.debug('[ChangePlanModal] confirm', plan.value)
  emit('confirm')
}
const submit = () => {
  console.debug('[ChangePlanModal] submit', plan.value)
  if (typeof props.onSubmit === 'function') {
    props.onSubmit(plan.value)
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
