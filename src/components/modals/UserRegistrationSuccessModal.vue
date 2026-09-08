<template>
  <InfoModal
    :is-visible="isVisible"
    :modalTitle="$t('userRegister.title')"
    dialogClass="modal-dialog-centered modal-md"
    @dismiss="emit('close')"
    hideFooter
  >
    <h3 class="mb-3">{{ $t('userRegister.signupSuccessTitle') }}</h3>
    <h4 class="font-weight-bold font-size-inherit">
      {{ $t('userRegister.signupSuccessVerifyInbox') }}
    </h4>
    <Alert type="info" class="my-3">
      {{ $t('userRegister.signupSuccessVerifyYourEmail') }}
    </Alert>
    <h4 class="font-weight-bold font-size-inherit">
      {{ $t('userRegister.signupSuccessAccountReview') }}
    </h4>
    <p>{{ $t('userRegister.signupSuccessReviewMessage') }}</p>
    <Alert type="info" class="my-3">
      {{ $t('userRegister.signupSuccessActivationMessage') }}
    </Alert>
    <p v-html="$t('userRegister.signupSuccessPlanReviewMessage')"></p>
    <RouterLink to="/" class="btn btn-md btn-outline-secondary border border-dark btn-block">
      {{ $t('userRegister.backToHomepage') }}
    </RouterLink>
  </InfoModal>
</template>

<script setup lang="ts">
import Alert from 'impresso-ui-components/components/Alert.vue'
import InfoModal from '@/components/InfoModal.vue'

export type UserRegistrationSuccessModalProps = {
  isVisible?: boolean
}

withDefaults(defineProps<UserRegistrationSuccessModalProps>(), {
  isVisible: false
})

const emit = defineEmits<{
  close: []
}>()
</script>

<i18n lang="json">
{
  "en": {
    "userRegister": {
      "title": "Register",
      "signupSuccessTitle": "Thanks for signing up for Impresso!",
      "signupSuccessVerifyInbox": "Step 1: Verify your email address",
      "signupSuccessVerifyYourEmail": "We’ve sent a verification link to your inbox. Please check your email and click the link to confirm your address.",
      "signupSuccessAccountReview": "Step 2: Account review & activation",
      "signupSuccessReviewMessage": "One of our team members will then review your information to ensure everything is set up correctly.",
      "signupSuccessActivationMessage": "You'll receive a separate email notification as soon as your account is activated and ready to go.",
      "signupSuccessPlanReviewMessage": "If you have registered with a <b>Student User</b> or <b>Academic User</b> plan, please be aware that your account will be reviewed by our team before activation. We appreciate your patience during this process.",
      "backToHomepage": "Back to homepage"
    }
  }
}
</i18n>
