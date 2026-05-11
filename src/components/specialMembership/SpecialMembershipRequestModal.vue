<template>
  <Modal
    :show="isVisible"
    :title="titleModal ?? (title || $t('title'))"
    modalClass="SpecialMembershipRequestModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0"
    @close="emit('dismiss')"
  >
    <p class="m-3" v-html="$t(specialMembershipRequestStatusTranslationKey)"></p>
    <section class="m-3 p-3 border border-dark rounded">
      <SpecialMembershipAccessItem :as-container="false" :item="props.item" with-metadata />
    </section>
    <Alert class="m-3 border border-info" v-if="isPending">
      {{ $t('alert.pending') }}
    </Alert>
    <Alert class="m-3 border border-success" v-else-if="isPendingTemporary">
      {{ $t('alert.pendingTemporary') }}
    </Alert>
    <Alert class="m-3 border border-danger" type="warning" v-if="isRevoked">
      {{ $t('alert.revoked') }}
    </Alert>
    <Alert type="success" class="m-3 border border-success" v-else-if="isSuccess">
      {{ $t('alert.success') }}
    </Alert>
    <div v-if="showForm">
      <SpecialMembershipRequestForm
        class="px-3 pb-3"
        :isLoading="isLoading"
        :specialMembershipAccess="props.item"
        @dismiss="emit('dismiss')"
        @submit="onSubmitHandler"
      >
        <FeathersErrorManager v-if="error" :error="error" class="m-3" />
      </SpecialMembershipRequestForm>
    </div>

    <template #modal-footer="{ close }">
      <button class="btn btn-sm btn-outline-secondary" @click="close" :disabled="isLoading">
        {{ $t('actions.dismiss') }}
      </button>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import { SpecialMembershipAccess } from '@/services/types'
import SpecialMembershipRequestForm, {
  SpecialMembershipRequestFormPayload
} from './SpecialMembershipRequestForm.vue'
import type { FeathersError } from '@feathersjs/errors'
import { userSpecialMembershipRequests as userSpecialMembershipRequestsService } from '@/services'
import SpecialMembershipAccessItem from '../modules/lists/SpecialMembershipAccessItem.vue'
import FeathersErrorManager from '../FeathersErrorManager.vue'
import { computed } from 'vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import {
  SpecialMembershipRequestStatusPending,
  SpecialMembershipRequestStatusPendingTemporary,
  SpecialMembershipRequestStatusRevoked
} from '@/constants'

export type SpecialMembershipRequestModalProps = {
  item?: SpecialMembershipAccess
  dialogClass?: string
  title?: string
  titleModal?: string
  isVisible?: boolean
}

const props = withDefaults(defineProps<SpecialMembershipRequestModalProps>(), {
  dialogClass: ' modal-lg p-0 modal-dialog-centered',
  title: ''
})
const isLoading = ref(false)
const isSuccess = ref(false)
const error = ref<FeathersError | null>(null)
const emit = defineEmits<{
  dismiss: []
  success: []
}>()
const specialMembershipRequestStatusTranslationKey = computed(() => {
  if (!Array.isArray(props.item?.requests) || props.item.requests.length === 0)
    return 'notYetRequested'
  return props.item.requests[0]?.status
})

const hasRequests = computed(() => {
  return Array.isArray(props.item?.requests) && props.item.requests.length > 0
})

const isPendingTemporary = computed(() => {
  return (
    hasRequests.value &&
    props.item!.requests![0].status === SpecialMembershipRequestStatusPendingTemporary
  )
})
const isPending = computed(() => {
  return (
    hasRequests.value && props.item!.requests![0].status === SpecialMembershipRequestStatusPending
  )
})

const isRevoked = computed(() => {
  return (
    hasRequests.value && props.item!.requests![0].status === SpecialMembershipRequestStatusRevoked
  )
})

const showForm = computed(() => {
  if (!hasRequests.value) {
    return true
  }
  if (isRevoked.value) {
    return true
  }
  return false
})
const onSubmitHandler = async (payload: SpecialMembershipRequestFormPayload) => {
  if (!props.item) {
    console.error('No special membership access provided')
    return
  }
  error.value = null
  isLoading.value = true
  isSuccess.value = false
  await userSpecialMembershipRequestsService
    .create({
      specialMembershipAccessId: props.item.id,
      notes: payload.notes,
      isTemporary: payload.requestProvisionalAccess
    })
    .then(() => {
      console.debug('Special membership request created successfully')
      isSuccess.value = true
      emit('success')
    })
    .catch(err => {
      console.error('Failed to create special membership request:', err, JSON.stringify(err))
      if (err.code === 409) {
        // probably already requested, but we can consider this a success for the user since the end result is the same (request exists)
        isSuccess.value = true
      } else {
        error.value = err as FeathersError
      }
    })
  isLoading.value = false
}
</script>
<i18n lang="json">
{
  "en": {
    "title": "Request Special Membership Access",
    "alert": {
      "pending": "You have already requested access to this special membership, and your request is currently pending review. You will be notified once a decision has been made.",
      "pendingTemporary": "Your Provisional Access request for this special membership is being processed and will be available shortly. If you don't see it soon, try refreshing the page or clearing your cache. If the issue continues, please contact us.",
      "revoked": "You have already requested access to this special membership.",
      "success": "Your request for special membership access has been submitted successfully."
    },
    "notYetRequested": "To access the facsimile and transcript of content items in this domain via Datalab or CSV Export, special membership is required.",
    "pending": "Your request for special membership access is pending review. You will be notified once a decision has been made.",
    "approved": "Your request for special membership access has been approved. You can now access the transcript of this content item and of other items in the same domain in Datalab or in CSV Export.",
    "rejected": "Your request for special membership access has been rejected. You will not be able to access the transcript of this content item and of other items in the same domain in Datalab or in CSV Export.",
    "revoked": "Your provisional access to this special membership has ended. <br/>However, you can now submit a request to regain access. Please note that your request will need to be reviewed before you can once again access the transcript of the items in this domain in Datalab or in CSV Export. Thank you for your understanding!",
    "temporary": "Your request for special membership access has been temporarily approved. You can access the transcript of this content item and of other items in the same domain in Datalab or in CSV Export for a limited time. Please check your notifications for more details.",
    "rtemporary": "Almost there: Provisional Access on the Way..."
  }
}
</i18n>
