<template>
  <form class="form" @submit.prevent="submitHandler">
    <LoadingBlock v-if="isLoading"></LoadingBlock>
    <section v-else>
      {{ specialMembershipAccess.metadata }}
      <Alert v-if="currentRequestStatus === 'rejected'" variant="danger">
        {{ $t('specialMembershipRequestModal.specialMembershipAccess.rejected') }}
      </Alert>
      <Alert v-else-if="currentRequestStatus === 'revoked'" class="m-3 border border-info">
        {{ $t('specialMembershipRequestModal.specialMembershipAccess.revoked') }}
      </Alert>
      <p v-if="doesMetadataAllowTemporaryAutomaticAcceptance" class="small text-muted mb-3">
        This special membership access allows for temporary automatic acceptance, which means that
        your request may be automatically approved for a limited time based on the provider's
        settings. If your request is automatically approved, you will receive temporary access to
        the special membership, and you will be notified about the duration of this access. Please
        note that after the temporary access period ends, you may need to submit a new request or
        wait for a review to regain access if needed.
      </p>
      <textarea
        autofocus
        class="form-control border rounded-sm shadow-sm"
        rows="5"
        :placeholder="$t('specialMembershipAccessPlaceholder')"
        v-model="form.notes"
        @input="handleContentInput"
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
      <div>
        <button
          type="submit"
          class="btn btn-outline-secondary btn-md px-4 border border-dark btn-block mt-3"
        >
          <Icon name="sendMail" class="mr-2" :size="16" />
          <span> {{ $t('requestSpecialMembershipAccess') }}</span>
        </button>
      </div>
    </section>
    <slot></slot>
  </form>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SpecialMembershipAccess, UserSpecialMembershipRequest } from '@/services/types'
import LoadingBlock from '../LoadingBlock.vue'
import Icon from 'impresso-ui-components/components/Icon.vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength, minLength } from '@vuelidate/validators'
import Alert from 'impresso-ui-components/components/Alert.vue'
import { FormatSpecifier } from 'd3'

export interface SpecialMembershipRequestFormProps {
  specialMembershipAccess: SpecialMembershipAccess
  isLoading?: boolean
  notesMinLength?: number
  notesMaxLength?: number
  currentRequestStatus?: UserSpecialMembershipRequest['status']
}

export type SpecialMembershipRequestFormPayload = {
  specialMembershipAccess: SpecialMembershipAccess
  notes: string
}

const props = withDefaults(defineProps<SpecialMembershipRequestFormProps>(), {
  isLoading: false,
  notesMinLength: 1,
  notesMaxLength: 1000
})
const emit = defineEmits<{
  (e: 'submit', payload: SpecialMembershipRequestFormPayload): void
  (e: 'dismiss'): void
}>()

export interface SpecialMembershipRequestFormValidation {
  notes: string
}
const form = ref<SpecialMembershipRequestFormValidation>({
  notes: ''
})

const doesMetadataAllowTemporaryAutomaticAcceptance = computed(
  () => props.specialMembershipAccess.metadata?.enableTemporaryAutomaticAcceptance
)

const submitHandler = (event: Event) => {
  event.preventDefault()
  v$.value.$validate() // Trigger validation
  if (v$.value.$error) {
    return
  }
  if (!props.specialMembershipAccess) {
    console.error('No special membership access provided')
    return
  }

  emit('submit', {
    specialMembershipAccess: props.specialMembershipAccess,
    notes: form.value.notes
  })
}

const v$ = useVuelidate(
  {
    notes: {
      required,
      minLength: minLength(props.notesMinLength),
      maxLength: maxLength(props.notesMaxLength)
    }
  },
  form
)

const handleContentInput = () => {
  v$.value.notes.$touch() // This triggers validation for this field
}
</script>
<i18n lang="json">
{
  "en": {
    "requestSpecialMembershipAccess": "Request Special Membership Access",
    "userRequestSpecialMembershipAccess": "Request special membership access for <b>{ title }</b>",
    "specialMembershipAccessPlaceholder": "Please provide a reason for your request.",
    "actions": {
      "discard": "Discard"
    },
    "specialMembershipRequestModal": {
      "specialMembershipAccess": {
        "revoked": "You can now ask  for special membership access again if you want to, but your previous temporary access has ended."
      }
    },
    "notesFieldHint": "You must provide additional information or context for your request here, between <span class=\"number\">{min}</span> and <span class=\"number\">{max}</span> characters."
  }
}
</i18n>
