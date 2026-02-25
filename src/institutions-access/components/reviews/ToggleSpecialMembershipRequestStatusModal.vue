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
        :modelValue="reviewStatus"
        :options="[
          { value: 'pending', text: $t('userSpecialMembershipRequestsStatusPending') },
          { value: 'approved', text: $t('userSpecialMembershipRequestsStatusApproved') },
          { value: 'rejected', text: $t('userSpecialMembershipRequestsStatusRejected') }
        ]"
        @update:modelValue="reviewStatus = $event"
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
      >
        <Icon name="sendMail" />
        <span class="ml-2">{{ $t('actions.confirm') }}</span>
      </button>
    </form>
  </InfoModal>
</template>
<script setup lang="ts">
import Icon from '@/components/base/Icon.vue'
import InfoModal from '@/components/InfoModal.vue'
import RadioGroup from '@/components/layout/RadioGroup.vue'
import { UserSpecialMembershipRequest, UserSpecialMembershipRequestReview } from '@/services/types'
import { ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { maxLength, minLength } from '@vuelidate/validators'
import SpecialMembershipRequestReviewItem from '@/components/modules/lists/SpecialMembershipRequestReviewItem.vue'
import { userSpecialMembershipRequestsReviews as userSpecialMembershipRequestsReviewsService } from '@/services'

export interface ToggleSpecialMembershipRequestStatusModalProps {
  isVisible: boolean
  item?: UserSpecialMembershipRequestReview
  notesMinLength?: number
  notesMaxLength?: number
}

export interface SpecialMembershipReviewFormValidation {
  status: UserSpecialMembershipRequest['status']
  notes: string
}

const props = withDefaults(defineProps<ToggleSpecialMembershipRequestStatusModalProps>(), {
  notesMinLength: 10,
  notesMaxLength: 500
})

const form = ref<SpecialMembershipReviewFormValidation>({
  notes: '',
  status: props.item?.status || 'pending'
})

const reviewStatus = ref(props.item?.status)
const handleOnSubmit = async (event: Event) => {
  event.preventDefault()
  v$.value.$validate() // Trigger validation
  if (v$.value.$error) {
    return
  }
  emit('submit', form.value)
  await userSpecialMembershipRequestsReviewsService.patch(props.item.id, {
    status: reviewStatus.value
  })
}

const v$ = useVuelidate(
  {
    notes: {
      minLength: minLength(props.notesMinLength),
      maxLength: maxLength(props.notesMaxLength)
    }
  },
  form
)

const emit = defineEmits<{
  dismiss: []
  submit: [payload: SpecialMembershipReviewFormValidation]
}>()
</script>
<i18n lang="json">
{
  "en": {
    "specialMembershipAccessPlaceholder": "Note (optional)",
    "userSpecialMembershipRequestsStatusPending": "Pending",
    "userSpecialMembershipRequestsStatusApproved": "Approved",
    "userSpecialMembershipRequestsStatusRejected": "Rejected",
    "notesFieldHint": "Note (optional, min: { min} characters, max: {max} characters)",
    "toggleSpecialMembershipRequestStatusModalTitle": "Toggle special membership request status",
    "toggleSpecialMembershipRequestStatusModalMessage": "Are you sure you want to toggle the status of this special membership request?"
  }
}
</i18n>
