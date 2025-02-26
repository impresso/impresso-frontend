<template>
  <form :class="['ChangePlanRequestForm', props.className]" @submit="handleOnSubmit">
    <FeathersErrorManager :error="props.error" />
    <h3 class="form-label font-size-inherit font-weight-bold mb-3">
      {{ $t('label_type_of_issue') }}
    </h3>
    <section class="mb-2 d-flex flex-wrap gap-2 align-items-center">
      <label
        v-for="(availableIssue, i) in availableFeedbackOptions"
        :key="availableIssue"
        :class="[
          'border rounded-md shadow-sm d-block py-2 pr-3 pl-2 d-flex ',
          { active: selectedIssue === availableIssue }
        ]"
      >
        <input
          type="radio"
          :name="'plan'"
          :id="`feedback-form-${uniqueId}-${i}`"
          :checked="selectedIssue === availableIssue"
          @change="selectedIssue = availableIssue"
        />
        <div class="ml-2">
          {{ $t('label_' + availableIssue) }}
        </div>
      </label>
    </section>
    <label :for="uniqueId" class="form-label font-size-inherit font-weight-bold">{{
      $t('label_additional_details')
    }}</label>
    <p class="text-muted small">{{ $t('label_additional_details_hint') }}</p>
    <textarea
      class="form-control shadow-sm rounded-sm border border-dark"
      :id="uniqueId"
      v-model="feedbackContent"
      rows="3"
    >
    </textarea>
    <button
      type="submit"
      :disabled="!selectedIssue"
      class="btn btn-outline-secondary btn-md px-4 rounded-sm border border-dark btn-block my-3"
    >
      <Icon name="sendMail" />
      <span class="ml-2">Send feedback</span>
    </button>
  </form>
</template>
<script setup lang="ts">
import type { FeathersError } from '@feathersjs/errors'
import { ref } from 'vue'
import Icon from './base/Icon.vue'
import { AvailableFeedbackOptions } from '@/constants'

const feedbackContent = ref<string>('')
const selectedIssue = ref<string>('')
const uniqueId = ref<string>('feedbackform-' + Math.random().toString(36).substring(7))

export interface FeedbackFormProps {
  className?: string
  availableFeedbackOptions: typeof AvailableFeedbackOptions
  error?: FeathersError | null
}

const props = withDefaults(defineProps<FeedbackFormProps>(), {
  className: '',
  availableFeedbackOptions: () => [...AvailableFeedbackOptions],
  error: null
})

const emits = defineEmits(['submit'])

const handleOnSubmit = (event: Event) => {
  event.preventDefault()
  emits('submit')
}
</script>
<i18n lang="json">
{
  "en": {
    "label_ContentItemMetadataIssue": "Content item metadata issue",
    "label_LayoutSegmentationIssue": "Layout segmentation issue",
    "label_DocumentLoadingIssue": "Document loading issue",
    "label_OtherIssue": "Other issue",
    "label_type_of_issue": "What type of issue are you reporting?",
    "label_additional_details": "Additional details (optional)",
    "label_additional_details_hint": "(Provide any extra information that might help us understand the issue better.)"
  }
}
</i18n>
