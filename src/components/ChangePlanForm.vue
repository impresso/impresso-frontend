<template>
  <form :class="['ChangePlanRequestForm', props.className]" @submit="handleOnSubmit">
    <FeathersErrorManager :error="props.error" />

    <section class="mb-3 d-flex flex-wrap gap-2 align-items-center">
      <label
        v-for="availablePlan in props.availablePlans"
        :key="availablePlan"
        :class="[
          'border rounded-md shadow-sm d-block py-2 pr-3 pl-2 d-flex ',
          { active: selectedPlan === availablePlan },
          { current: props.plan === availablePlan }
        ]"
      >
        <input
          type="radio"
          :name="'plan'"
          :id="`ChangePlanRequestForm.${availablePlan}`"
          :checked="selectedPlan === availablePlan"
          @change="selectedPlan = availablePlan"
        />
        <div class="ml-2">
          {{ props.availablePlanLabels[availablePlan] }}
          <div v-if="props.plan === availablePlan">
            <span class="badge bg-primary text-white">Your current plan</span>
          </div>
        </div>
      </label>
    </section>

    <button
      type="submit"
      :disabled="props.plan === selectedPlan"
      class="btn btn-outline-secondary btn-md px-4 border border-dark"
    >
      <Icon name="sendMail" />
      <span class="ml-2">Confirm Plan Change Request</span>
    </button>
  </form>

  <p class="mt-2">
    Any Questions? <br />
    Contact us at <a href="mailto:info@impresso-project.ch">info@impresso-project.ch</a>
  </p>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FeathersError } from '@feathersjs/errors'
import FeathersErrorManager from './FeathersErrorManager.vue'
import Icon from './base/Icon.vue'

/**
 * Type definitions for the form payload
 */
export type ChangePlanRequestFormPayload = {
  plan: string
}

export interface ChangePlanRequestFormProps {
  className?: string
  onSubmit: (payload: ChangePlanRequestFormPayload) => void
  error?: FeathersError | null
  plan?: string
  availablePlans?: string[]
  availablePlanLabels?: Record<string, string>
}

/**
 * Props definition for ChangePlanRequestForm component
 */
const props = withDefaults(defineProps<ChangePlanRequestFormProps>(), {
  availablePlans: () => [],
  availablePlanLabels: () => ({})
})

const emits = defineEmits(['submit'])

/**
 * Reactive state for selected plan
 */
const selectedPlan = ref<string | undefined>(props.plan)

/**
 * Watches for changes in the plan prop and updates selectedPlan
 */
watch(
  () => props.plan,
  newPlan => {
    selectedPlan.value = newPlan
  }
)

/**
 * Handles form submission
 */
const handleOnSubmit = (event: Event) => {
  event.preventDefault()
  if (selectedPlan.value) {
    emits('submit', { plan: selectedPlan.value })
  } else {
    console.error('Selected plan is undefined')
  }
}
</script>

<style>
.ChangePlanRequestForm label {
  cursor: pointer;
}
.ChangePlanRequestForm .active {
  border-color: #007bff !important;
}
.ChangePlanRequestForm .current {
  border-color: var(--impresso-color-black) !important;
}
</style>
