<template>
  <section class="AcceptTermsOfUse border-top mx-0 py-4 mt-0 d-flex justify-content-center">
    <div class="form-check d-inline-block w-auto">
      <input
        class="form-check-input"
        type="checkbox"
        id="terms-of-use"
        :checked="checked"
        @change="handleChange"
        :disabled="disabled"
      />
      <label class="form-check-label font-weight-bold" for="terms-of-use">
        {{ $t('label_read_and_agree') }}
        <LinkToModal class="text-decoration-underline" :view="ViewTermsOfUse">{{
          $t('label_ToU_link')
        }}</LinkToModal>
      </label>
    </div>
  </section>
</template>
<i18n lang="json">
{
  "en": {
    "label_read_and_agree": "I HAVE READ and I AGREE to the ",
    "label_ToU_link": "Impresso Terms of Use"
  }
}
</i18n>
<script setup lang="ts">
import LinkToModal from '@/components/LinkToModal.vue'
import { ViewTermsOfUse } from '@/constants'

const props = defineProps<{
  onChange?: (event: Event) => void
  checked?: boolean
  isLoading?: boolean
  disabled?: boolean
}>()

const handleChange = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) {
    console.error('event.target is not an HTMLInputElement')
  }
  if (typeof props.onChange === 'function') {
    props.onChange(event)
  }
}
</script>
