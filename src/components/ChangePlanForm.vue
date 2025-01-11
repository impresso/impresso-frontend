<template>
  <form :class="['ChangePlanRequestForm', props.className]" @submit="handleOnSubmit">
    <FeathersErrorManager :error="props.error" />

    <section class="mb-3 d-flex flex-wrap gap-2 align-items-center justify-content-center">
      <label
        v-for="availablePlan in props.availablePlans"
        :key="availablePlan"
        :class="[
          'border rounded-md shadow-sm d-block py-2 pr-3 pl-2 d-flex ',
          { active: selectedPlan === availablePlan },
          { current: props.currentPlan === availablePlan },
          { pending: pendingPlan === availablePlan }
        ]"
      >
        <input
          type="radio"
          :name="'plan'"
          :id="`ChangePlanRequestForm.${availablePlan}`"
          :checked="selectedPlan === availablePlan"
          @change="selectedPlan = availablePlan"
          :disabled="props.currentPlan === availablePlan || pendingPlan === availablePlan"
        />
        <div class="ml-2">
          {{ props.availablePlansLabels[availablePlan] }}
          <div v-if="props.currentPlan === availablePlan">
            <span class="badge bg-primary text-white small-caps">Your plan</span>
          </div>
          <div v-if="pendingPlan === availablePlan">
            <span class="badge bg-info text-dark small-caps">Pending change</span>
          </div>
        </div>
      </label>
    </section>

    <button
      type="submit"
      :disabled="props.currentPlan === selectedPlan"
      class="btn btn-outline-secondary btn-md px-4 border border-dark btn-block"
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
import { ref, watch, defineProps, defineEmits, computed } from 'vue'
import type { FeathersError } from '@feathersjs/errors'
import FeathersErrorManager from './FeathersErrorManager.vue'
import Icon from './base/Icon.vue'
import type { UserChangePlanRequest } from '@/services/types'

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
  currentPlan?: string
  userChangePlanRequest: UserChangePlanRequest | null
  availablePlans?: string[]
  availablePlansLabels?: Record<string, string>
}

/**
 * Props definition for ChangePlanRequestForm component
 */
const props = withDefaults(defineProps<ChangePlanRequestFormProps>(), {
  availablePlans: () => [],
  availablePlansLabels: () => ({})
})

const emits = defineEmits(['submit'])

/**
 * Reactive state for selected plan
 */
const selectedPlan = ref<string | undefined>(props.currentPlan)
const pendingPlan = computed(() =>
  props.userChangePlanRequest?.status === 'pending'
    ? props.userChangePlanRequest?.plan.name
    : undefined
)

/**
 * Watches for changes in the plan prop and updates selectedPlan
 */
watch(
  () => props.currentPlan,
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
  border-color: var(--impresso-color-black) !important;
  /* add semi transparent shadow, solid */
  box-shadow: 0 0 0 4px var(--impresso-color-black-alpha-20) !important;
}
.ChangePlanRequestForm .current {
  border-color: var(--impresso-color-black) !important;
}
.ChangePlanRequestForm .pending {
  border-color: #17a2b8 !important;
  /* add semi transparent shadow, solid */
  box-shadow: 0 0 0 4px rgba(23, 162, 184, 0.25) !important;
}
</style>
