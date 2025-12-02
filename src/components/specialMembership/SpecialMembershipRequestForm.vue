<template>
  <form class="form" @submit.prevent="submitHandler">
    <LoadingBlock v-if="isLoading"></LoadingBlock>
    <section v-else>
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
import { ref } from 'vue'
import type { SpecialMembershipAccess } from '@/services/types'
import LoadingBlock from '../LoadingBlock.vue'
import Icon from 'impresso-ui-components/components/Icon.vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength, minLength } from '@vuelidate/validators'

export interface SpecialMembershipRequestFormProps {
  specialMembershipAccess: SpecialMembershipAccess
  isLoading?: boolean
  notesMinLength?: number
  notesMaxLength?: number
}

export type SpecialMembershipRequestFormPayload = {
  specialMembershipAccess: SpecialMembershipAccess
  notes: string
}

const props = withDefaults(defineProps<SpecialMembershipRequestFormProps>(), {
  isLoading: false,
  notesMinLength: 10,
  notesMaxLength: 500
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
    "notesFieldHint": "You must provide additional information or context for your request here, between <span class=\"number\">{min}</span> and <span class=\"number\">{max}</span> characters."
  }
}
</i18n>
