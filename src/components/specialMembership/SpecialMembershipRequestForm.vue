<template>
  <form class="form p-4" @submit.prevent="submitHandler">
    <p
      v-html="
        $t('userRequestSpecialMembershipAccess', {
          title: props.specialMembershipAccess.title
        })
      "
    ></p>
    <LoadingBlock v-if="isLoading"></LoadingBlock>
    <section v-else>
      <textarea
        class="form-control form-control-sm rounded-sm shadow-sm"
        rows="3"
        :placeholder="$t('specialMembershipAccessPlaceholder')"
        v-model="notes"
      ></textarea>
      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-sm btn-primary mt-3">
          {{ $t('requestSpecialMembershipAccess') }}
        </button>
        <button class="btn btn-sm btn-outline-secondary mt-3" @click="emit('dismiss')">
          {{ $t('actions.discard') }}
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

export interface SpecialMembershipRequestFormProps {
  specialMembershipAccess: SpecialMembershipAccess
  isLoading?: boolean
}

export type SpecialMembershipRequestFormPayload = {
  specialMembershipAccess: SpecialMembershipAccess
  notes: string
}

const props = defineProps<SpecialMembershipRequestFormProps>()
const notes = ref('')
const emit = defineEmits<{
  (e: 'submit', payload: SpecialMembershipRequestFormPayload): void
  (e: 'dismiss'): void
}>()

const submitHandler = () => {
  if (!props.specialMembershipAccess) {
    console.error('No special membership access provided')
    return
  }
  emit('submit', {
    specialMembershipAccess: props.specialMembershipAccess,
    notes: notes.value
  })
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
    }
  }
}
</i18n>
