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
    <LoadingBlock :height="100" v-if="isLoading" label="please wait ...."> </LoadingBlock>
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
      v-if="!isLoading"
      class="mt-2"
      @submit="handleSubmit"
      :error="feedbackFormError"
    />
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
import { computed } from 'vue'
import { BadRequestWithData } from './FeathersErrorManager.vue'
import { useRoute } from 'vue-router'

export interface FeedbackFormPayloadWithRoute extends FeedbackFormPayload {
  route: {
    fullPath: string
    params: Record<string, any>
    query: Record<string, any>
    name: string | null
  }
  errorMessages: {
    id: string
    code: number
    name: string
    message: string
    route: string[]
  }[]
}

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    title?: string
    isVisible?: boolean
    errorCode?: string
    isLoading?: boolean
    errorMessages?: {
      id: string
      code: number
      name: string
      message: string
      route: string[]
    }[]
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
    return props.errorMessages[0] as unknown as BadRequestWithData
  }
  return null
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
</script>
