<template>
  <InfoModal
    :show="isVisible"
    :title="$t('toggleSpecialMembershipRequestStatusModalTitle')"
    @close="emit('dismiss')"
    :dialogClass="'modal-dialog-scrollable modal-lg p-0 modal-dialog-centered'"
    hide-footer
  >
    <p class="mb-0" v-html="$t('toggleSpecialMembershipRequestStatusModalMessage')"></p>

    <SpecialMembershipRequestReviewItem class="m-2" v-if="props.item" :item="props.item" />

    <form @submit.prevent="handleOnSubmit">
      <RadioGroup
        class="my-1 p-3 rounded"
        :modelValue="form.status"
        :options="statusOptions.map(value => ({ value, text: $t(`status.${value}`) }))"
        @update:modelValue="form.status = $event as ReviewableStatus"
        type="radio"
      />
      <textarea
        autofocus
        class="form-control border border-dark rounded-sm shadow-sm mt-3"
        rows="5"
        :placeholder="$t('specialMembershipAccessPlaceholder')"
        v-model="form.notes"
        :class="{
          'is-invalid': v$.notes.$error,
          'border-danger': v$.notes.$error,
          'border-success': v$.notes.$dirty && !v$.notes.$error
        }"
      ></textarea>

      <div class="text-muted small p-2">
        <span
          :class="{ 'text-danger': v$.notes.$error }"
          v-html="
            $t('notesFieldHint', {
              min: props.notesMinLength,
              max: props.notesMaxLength
            })
          "
        />
      </div>
      <button
        type="submit"
        class="mt-3 btn btn-outline-secondary btn-md px-4 border border-dark btn-block"
        :disabled="isSubmitting || !props.item"
      >
        <Icon name="sendMail" />
        <span class="ml-2">{{
          $t(isSubmitting ? 'actions.submitting' : 'actions.confirm')
        }}</span>
      </button>
    </form>
  </InfoModal>
</template>
<script setup lang="ts">
import Icon from '@/components/base/Icon.vue'
import InfoModal from '@/components/InfoModal.vue'
import RadioGroup from '@/components/layout/RadioGroup.vue'
import { UserSpecialMembershipRequestReview } from '@/services/types'
import { ref, watch } from 'vue'
import useVuelidate from '@vuelidate/core'
import { maxLength, minLength } from '@vuelidate/validators'
import SpecialMembershipRequestReviewItem from '@/components/modules/lists/SpecialMembershipRequestReviewItem.vue'
import { userSpecialMembershipRequestsReviews as userSpecialMembershipRequestsReviewsService } from '@/services'
import { useNotificationsStore } from '@/stores/notifications'
import {
  SpecialMembershipRequestStatusApproved,
  SpecialMembershipRequestStatusPending,
  SpecialMembershipRequestStatusRejected,
  SpecialMembershipRequestStatusRevoked,
  SpecialMembershipRequestStatusTemporary
} from '@/constants'

/** The statuses a reviewer is allowed to set by hand. */
const statusOptions = [
  SpecialMembershipRequestStatusPending,
  SpecialMembershipRequestStatusApproved,
  SpecialMembershipRequestStatusRejected,
  SpecialMembershipRequestStatusTemporary,
  SpecialMembershipRequestStatusRevoked
] as const

export type ReviewableStatus = (typeof statusOptions)[number]

export interface ToggleSpecialMembershipRequestStatusModalProps {
  isVisible: boolean
  item?: UserSpecialMembershipRequestReview
  notesMinLength?: number
  notesMaxLength?: number
}

export interface SpecialMembershipReviewFormValidation {
  status: ReviewableStatus
  notes: string
}

const notificationStore = useNotificationsStore()
const props = withDefaults(defineProps<ToggleSpecialMembershipRequestStatusModalProps>(), {
  notesMinLength: 10,
  notesMaxLength: 500
})

const form = ref<SpecialMembershipReviewFormValidation>({
  notes: '',
  status: (props.item?.status as ReviewableStatus) ?? SpecialMembershipRequestStatusPending
})

const isSubmitting = ref(false)

// The note is optional; vuelidate length rules only apply once something is
// typed, which is what the hint below the field describes.
const v$ = useVuelidate(
  {
    notes: {
      minLength: minLength(props.notesMinLength),
      maxLength: maxLength(props.notesMaxLength)
    }
  },
  form
)

/**
 * The modal stays mounted between reviews, so the form has to follow the item
 * rather than being seeded once during setup.
 */
watch(
  () => props.item,
  item => {
    form.value = {
      notes: '',
      status: (item?.status as ReviewableStatus) ?? SpecialMembershipRequestStatusPending
    }
    v$.value.$reset()
  }
)

const handleOnSubmit = async (event: Event) => {
  event.preventDefault()
  const isValid = await v$.value.$validate()
  if (!isValid || !props.item) {
    return
  }
  emit('submit', form.value)
  isSubmitting.value = true
  try {
    await userSpecialMembershipRequestsReviewsService.patch(props.item.id, {
      status: form.value.status,
      notes: form.value.notes
    })
    notificationStore.addNotification({
      type: 'success',
      title: 'Request updated',
      message: 'The requester is notified of the new status.'
    })
    emit('success')
    emit('dismiss')
  } catch (error) {
    console.error('Error updating special membership request review status:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Error',
      message: 'The request status could not be updated. Please try again.'
    })
  } finally {
    isSubmitting.value = false
  }
}

const emit = defineEmits<{
  dismiss: []
  submit: [payload: SpecialMembershipReviewFormValidation]
  success: []
}>()
</script>
<i18n lang="json">
{
  "en": {
    "specialMembershipAccessPlaceholder": "Note (optional)",
    "status": {
      "pending": "Pending",
      "approved": "Approved",
      "rejected": "Rejected",
      "temporary": "Temporary access",
      "revoked": "Revoked"
    },
    "notesFieldHint": "Optional note. If you write one, use between {min} and {max} characters.",
    "actions": {
      "confirm": "Confirm",
      "submitting": "Saving..."
    },
    "toggleSpecialMembershipRequestStatusModalTitle": "Change special membership request status",
    "toggleSpecialMembershipRequestStatusModalMessage": "Set the new status for this special membership request. The requester is notified by email."
  }
}
</i18n>
