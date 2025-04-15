<template>
  <Modal
    :show="isVisible"
    :title="title"
    modalClass="FeedbackModal"
    :dialogClass="props.dialogClass"
    @close="dismiss"
    @confirm="confirm"
    hideBackdrop
  >
    <LoadingBlock :height="100" v-if="isLoading" label="please wait ...."> </LoadingBlock>

    <b-tabs pills class="mb-4 mt-0 FeedbackModal__tabs">
      <template v-slot:tabs-end>
        <b-nav-item class="w-50">
          <button
            size="sm"
            class="w-100 btn btn-transparent nav-link"
            :class="{ active: mode === QuestionRemarksMode }"
            @click="mode = QuestionRemarksMode"
          >
            {{ $t('questionRemarks') }}
          </button>
        </b-nav-item>
        <b-nav-item class="w-50">
          <button
            size="sm"
            class="w-100 btn btn-transparent nav-link"
            :class="{ active: mode === ReportProblemMode }"
            @click="mode = ReportProblemMode"
          >
            {{ $t('reportProblem') }}
          </button>
        </b-nav-item>
      </template>
    </b-tabs>
    <div v-if="!feedbackFormError && errorMessages.length">
      <h3 class="form-label font-size-inherit font-weight-bold mb-3">
        Errors that will be reported
      </h3>
      <ul>
        <li v-for="(d, index) in errorMessages" :key="index">
          {{ d }}
          <b>{{ d.message }}</b
          ><br />id: {{ d.id }} <br />code: {{ d.code }}
          {{ d.route }}
        </li>
      </ul>
    </div>
    <FeedbackForm
      :available-feedback-options="availableOptions"
      v-if="!isLoading"
      class="mt-2"
      @submit="handleSubmit"
      :error="feedbackFormError"
    >
      <template v-slot:optionsHeading>
        <span v-if="mode === QuestionRemarksMode">
          {{ $t('questionRemarks_optionsHeading') }}
        </span>
        <span v-else-if="mode === ReportProblemMode">
          {{ $t('reportProblem_optionsHeading') }}
        </span>
      </template>
    </FeedbackForm>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import Modal from './base/Modal.vue'
import LoadingBlock from './LoadingBlock.vue'
import FeedbackForm from './FeedbackForm.vue'
import type { FeedbackFormPayload } from './FeedbackForm.vue'
import { computed, ref, watch } from 'vue'
import { BadRequestWithData } from './FeathersErrorManager.vue'
import { useRoute } from 'vue-router'
import { ErrorMessage } from '@/stores/notifications'
import {
  FeedbackOptionInterfaceIssue,
  FeedbackOptionDataIssue,
  FeedbackOptionOtherIssue,
  FeedbackOptionDataAvailabilityIssue,
  FeedbackOptionTermsOfUseIssue
} from '@/constants'

export interface FeedbackFormPayloadWithRoute extends FeedbackFormPayload {
  route: {
    fullPath: string
    params: Record<string, any>
    query: Record<string, any>
    name: string | null
  }
  errorMessages: ErrorMessage[]
}

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    title?: string
    isVisible?: boolean
    errorCode?: string
    isLoading?: boolean
    errorMessages?: ErrorMessage[]
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-md',
    isLoading: false,
    errorMessages: () => []
  }
)
const emit = defineEmits(['dismiss', 'confirm', 'submit'])
const route = useRoute()
const feedbackFormError = computed(() => {
  if (!props.errorMessages.length) return null
  // only forward 'feedback' service related error
  if ((props.errorMessages[0] as unknown as BadRequestWithData)?.data) {
    return new Error('HTML is not supported, please use plain text for your feedback.')
  }
  return null
})

const QuestionRemarksMode = 'questionRemarks'
const ReportProblemMode = 'reportProblem'
const mode = ref(QuestionRemarksMode)

const availableOptions = computed(() => {
  if (mode.value === ReportProblemMode) {
    return [FeedbackOptionInterfaceIssue, FeedbackOptionDataIssue, FeedbackOptionOtherIssue]
  } else if (mode.value === QuestionRemarksMode) {
    return [FeedbackOptionDataAvailabilityIssue, FeedbackOptionTermsOfUseIssue]
  }
  return []
})

const dismiss = () => {
  console.debug('[FeedbackModal] dismiss')
  emit('dismiss')
}
const confirm = () => {
  console.debug('[FeedbackModal] confirm')
  emit('confirm')
}

const handleSubmit = (payload: FeedbackFormPayload) => {
  const payloadWithRoute: FeedbackFormPayloadWithRoute = {
    ...payload,
    route: {
      fullPath: route.fullPath,
      params: route.params,
      query: route.query,
      name: route.name as string | null
    },
    errorMessages: props.errorMessages
  }
  console.debug('[FeedbackModal] handleSubmit', payloadWithRoute)
  emit('submit', payloadWithRoute)
}

watch(
  () => feedbackFormError.value,
  newValue => {
    if (newValue) {
      mode.value = ReportProblemMode
    }
  },
  { immediate: true }
)
</script>
<i18n lang="json">
{
  "en": {
    "questionRemarks": "Question, remarks",
    "questionRemarks_optionsHeading": "Please select a topic:",
    "reportProblem": "Report a Problem",
    "reportProblem_optionsHeading": "What is the origin of the issue you'd like to report?"
  }
}
</i18n>
<style lang="css">
ul.FeedbackModal__tabs.nav.nav-pills .nav-item .nav-link {
  font-size: var(--impresso-font-size);
  font-variant: normal;
  letter-spacing: normal;
  font-weight: var(--impresso-wght);
  font-variation-settings: 'wght' var(--impresso-wght);
  text-transform: none;
}
ul.FeedbackModal__tabs.nav.nav-pills .nav-item .nav-link.active {
  font-weight: var(--impresso-wght-bold);
  font-variation-settings: 'wght' var(--impresso-wght-bold);
}
</style>
