<template>
  <FeedbackModal
    :title="$t('label_feedback_modal')"
    :isVisible="view === ViewFeedback"
    @dismiss="resetView"
    @submit="createFeedback"
    :errorMessages="errorMessages"
    :is-loading="feedbackCollectorResponse.status === 'loading'"
  />
  <div class="position-fixed" style="right: 0; top: 50%">
    <button
      type="button"
      class="btn btn-primary rounded-md FeedbackButton__trigger"
      @click="() => (store.view = ViewFeedback)"
    >
      <Icon name="sendMail" />
      <span class="ml-2">{{ $t('label_trigger_feedback_modal') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ViewFeedback } from '@/constants'
import { feedback as feedbackService } from '@/services'
import { BadRequest, type FeathersError } from '@feathersjs/errors'
import { useViewsStore } from '@/stores/views'
import { ErrorMessage, useNotificationsStore } from '@/stores/notifications'
import Icon from '@/components/base/Icon.vue'
import FeedbackModal from '@/components/feedback/FeedbackModal.vue'
import type { FeedbackFormPayloadWithRoute } from '@/components/feedback/FeedbackModal.vue'

const store = useViewsStore()
const notificationsStore = useNotificationsStore()
const view = computed(() => store.view)

const feedbackCollectorResponse = ref<{
  data: any
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: null
})

const errorMessages = computed<ErrorMessage[] | null>(() => {
  if (feedbackCollectorResponse.value.status === 'error') {
    return [new BadRequest('Error', feedbackCollectorResponse.value.data) as any as ErrorMessage]
  }
  return notificationsStore.errorMessages
})

const resetView = () => {
  store.view = null
}

const createFeedback = async (payload: FeedbackFormPayloadWithRoute) => {
  console.debug('[FeedbackModal] @createFeedback', payload)
  feedbackCollectorResponse.value = { data: null, status: 'loading' }
  await feedbackService
    .create(payload, {
      ignoreErrors: true
    })
    .then(data => {
      console.info('[FeedbackModal] Feedback sent successfully. data:', data)
      store.view = null
      feedbackCollectorResponse.value = { data, status: 'success' }
      notificationsStore.addNotification({
        type: 'success',
        title: 'Feedback sent',
        message: 'Thank you for your feedback. We received your message.'
      })
    })
    .catch((err: FeathersError) => {
      console.error('[FeedbackModal] create', err.message, err.data)
      feedbackCollectorResponse.value = { data: err.data, status: 'error' }
      notificationsStore.addNotification({
        type: 'error',
        title: 'Feedback failed',
        message: 'We could not send your feedback. Please try again.'
      })
    })
}
</script>

<i18n lang="json">
{
  "en": {
    "label_feedback_modal": "Help us improve Impresso",
    "label_trigger_feedback_modal": "Send feedback"
  }
}
</i18n>

<style lang="css">
.FeedbackButton__trigger {
  position: absolute;
  right: 0;
  transform: rotate(90deg);
  top: 100px;
  margin-right: 5px;
  transform-origin: right top;
  display: flex;
}
.FeedbackButton__trigger:hover span {
  text-decoration: underline;
}
.FeedbackButton__trigger svg {
  stroke: currentColor;
}
.FeedbackButton__trigger span {
  white-space: nowrap;
}
</style>
