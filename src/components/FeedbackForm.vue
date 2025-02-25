<template>
  <form :class="['ChangePlanRequestForm', props.className]" @submit="handleOnSubmit">
    <FeathersErrorManager :error="props.error" />
    <section class="mb-3 d-flex flex-wrap gap-2 align-items-center justify-content-center">
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

    <label :for="uniqueId" class="form-label">Your feedback</label>
    <textarea
      class="form-control shadow-sm rounded-sm border border-dark"
      :id="uniqueId"
      v-model="feedbackContent"
      rows="3"
    >
    </textarea>
    <button
      type="submit"
      class="btn btn-outline-secondary btn-md px-4 border border-dark btn-block my-3"
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

const ContentItemMetadataIssue = 'ContentItemMetadataIssue'
const LayoutSegmentationIssue = 'LayoutSegmentationIssue'
const DocumentLoadingIssue = 'DocumentLoadingIssue'
const OtherIssue = 'OtherIssue'

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
