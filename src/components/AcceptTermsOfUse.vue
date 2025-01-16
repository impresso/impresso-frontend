<template>
  <section class="AcceptTermsOfUse border-top mx-0 py-4 mt-0 d-flex justify-content-center">
    <div class="form-check d-inline-block w-auto">
      <input
        class="form-check-input"
        type="checkbox"
        id="terms-of-use"
        :checked="checked"
        @change="handleChange"
        :disabled="isLoading"
      />
      <label class="form-check-label font-weight-bold" for="terms-of-use">
        I HAVE READ and I AGREE to the Impresso
        <LinkToModal class="text-decoration-underline" :view="ViewTermsOfUse"
          >Terms of Use.</LinkToModal
        >
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { termsOfUse as termsOfUseService } from '../services'
import LinkToModal from './LinkToModal.vue'
import { ViewTermsOfUse } from '@/stores/views'

const userStore = useUserStore()
const checked = ref<boolean>(userStore.acceptTermsDate !== null)
const isLoading = ref<boolean>(false)

const props = defineProps<{
  onChange?: (event: Event) => void
  localStorageOnly?: boolean
}>()

const handleChange = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) {
    console.error('event.target is not an HTMLInputElement')
  }
  userStore.acceptTermsDate = (event.target as HTMLInputElement).checked
    ? new Date().toISOString()
    : null
  userStore.acceptTermsDateOnLocalStorage = userStore.acceptTermsDate

  if (typeof props.onChange === 'function') {
    props.onChange(event)
  }
  if (props.localStorageOnly) {
    return
  }

  termsOfUseService
    .patch(null, {
      acceptTerms: !!(event.target as HTMLInputElement).checked
    })
    .then(data => {
      console.debug(
        '[TermsOfUseModal] AcceptTermsOfUse@onChange call accountDetails.patch() success:',
        data
      )
    })
    .finally(() => {
      isLoading.value = false
    })
}

userStore.$subscribe((mutation, state) => {
  checked.value = state.acceptTermsDate !== null
})
</script>
