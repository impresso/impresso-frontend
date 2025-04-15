<template>
  <form :class="['FeedbackForm', props.className]" @submit="handleOnSubmit">
    <FeathersErrorManager :error="props.error" v-if="error" />

    <h3 class="form-label font-size-inherit font-weight-bold mb-3">
      <slot name="optionsHeading">
        {{ $t('label_type_of_issue') }}
      </slot>
    </h3>
    <section class="mb-2 d-flex flex-wrap gap-2 align-items-center">
      <label
        v-for="(availableIssue, i) in availableFeedbackOptions"
        :key="availableIssue"
        :class="[
          'border rounded-md shadow-sm d-block py-2 pr-3 pl-2 d-flex ',
          { active: form.issue === availableIssue }
        ]"
      >
        <input
          type="radio"
          :name="'plan'"
          :id="`feedback-form-${uniqueId}-${i}`"
          :checked="form.issue === availableIssue"
          @change="form.issue = availableIssue"
        />
        <div class="ml-2">
          {{ $t('label_' + availableIssue) }}
        </div>
      </label>
    </section>
    <label :for="uniqueId" class="form-label font-size-inherit font-weight-bold"
      ><slot name="additionalDetails">
        {{ $t('label_additional_details') }}
      </slot>
    </label>

    <p class="text-muted small">
      <slot name="additionalDetailsHint">
        {{ $t('label_additional_details_hint') }}
      </slot>
    </p>
    <textarea
      class="form-control shadow-sm rounded-sm border"
      :id="uniqueId"
      v-model="form.content"
      rows="3"
      :class="{
        'is-invalid': v$.content.$error,
        'border-danger': v$.content.$error,
        'border-success': !v$.content.$error
      }"
    >
    </textarea>
    <span v-if="v$.content.$error" class="text-danger">
      {{ $t('label_max_length_exceeded') }}
    </span>
    <button
      type="submit"
      :disabled="!form.issue"
      class="btn btn-outline-secondary btn-md px-4 rounded-sm border border-dark btn-block my-3"
    >
      <Icon name="sendMail" />
      <span class="ml-2">Send feedback</span>
    </button>
  </form>
</template>
<script setup lang="ts">
import type { FeathersError } from '@feathersjs/errors'
import { computed, ref } from 'vue'
import Icon from './base/Icon.vue'
import FeathersErrorManager from './FeathersErrorManager.vue'
import { AvailableFeedbackOptions } from '@/constants'
import useVuelidate from '@vuelidate/core'
import { maxLength, minLength } from '@vuelidate/validators'

const uniqueId = ref<string>('feedbackform-' + Math.random().toString(36).substring(7))

export interface FeedbackFormProps {
  className?: string
  availableFeedbackOptions?: typeof AvailableFeedbackOptions
  error?: FeathersError | Error | null
}

export interface FeedbackFormPayload {
  issue: string
  content: string
}

const form = ref<FeedbackFormPayload>({
  issue: '',
  content: ''
})
// Validation rules
const rules = computed(() => ({
  issue: { required: true, minLength: minLength(1) },
  content: { required: true, minLength: minLength(1), maxLength: maxLength(500) }
}))
// Use Vuelidate
const v$ = useVuelidate(rules, form)

const props = withDefaults(defineProps<FeedbackFormProps>(), {
  className: '',
  availableFeedbackOptions: () => [...AvailableFeedbackOptions],
  error: null
})

const emits = defineEmits(['submit'])

const handleOnSubmit = (event: Event) => {
  event.preventDefault()
  v$.value.$validate() // Trigger validation
  if (v$.value.$error) {
    return
  }
  emits('submit', {
    issue: form.value.issue,
    content: form.value.content
  } as FeedbackFormPayload)
}
</script>
<i18n lang="json">
{
  "en": {
    "label_ContentItemMetadataIssue": "Faulty or missing metadata",
    "label_ContentItemFacsimileIssue": "Facsimile issue",
    "label_ContentItemTranscriptionIssue": "Transcription issue",
    "label_LayoutSegmentationIssue": "Wrong Facsimile Layout segmentation",
    "label_DocumentLoadingIssue": "User interface issue",
    "label_OtherIssue": "Other issue",
    "label_InterfaceIssue": "Interface",
    "label_DataIssue": "Data",
    "label_DataAvailabilityIssue": "Data availability",
    "label_TermsOfUseIssue": "Terms of use",
    "label_UnknownIssue": "I don't know",
    "label_type_of_issue": "What type of issue are you experiencing?",
    "label_additional_details": "Additional details",
    "label_additional_details_hint": "Please provide any extra information that might help us understand the issue better.",
    "label_max_length_exceeded": "The content exceeds the maximum length of 500 characters."
  }
}
</i18n>
