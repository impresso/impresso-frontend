<template>
  <main id="PasswordReset">
    <b-container class="mb-5">
      <b-row>
        <b-col md="6" offset-md="3">
          <div class="my-5">
            <h1 class="border-dark my-3 pb-3 sans">{{ $t('ResetPassword') }}</h1>
            <p>
              Enter your email address and we will send you a link to reset your password.
            </p>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" offset-md="3">
          <b-alert
            v-if="error"
            variant="danger"
            dismissible
            :show="Boolean(error)"
            @dismissed="error = null"
            v-html="$t('errors.ResetPasswordGeneralError', { error })"
          >
          </b-alert>
          <form @submit.prevent="onSubmit">
            <b-form-group
              id="input-group-1"
              label="Email address:"
              label-for="input-1"
              description="We'll never share your email with anyone else."
            >
              <b-form-input
                id="input-1"
                v-model="email"
                type="email"
                required
                placeholder="Enter email"
              ></b-form-input>
            </b-form-group>
            <b-button type="submit" class="mt-2" size="sm" variant="outline-primary">{{
              $t('actions.resetPassword')
            }}</b-button>
          </form>
        </b-col>
      </b-row>
    </b-container>
  </main>
</template>

<script>
import { passwordReset as passwordResetService } from '@/services'
const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default {
  name: 'PasswordReset',
  data() {
    return {
      email: '',
      error: null,
      isLoading: false,
    }
  },
  methods: {
    onSubmit(e) {
      e.stopPropagation()
      e.preventDefault()
      this.error = null
      if (this.isLoading) {
        console.warn('[PasswordReset] onSubmit is loading')
        return
      }
      this.isLoading = true
      console.log('[PasswordReset] @onSubmit', this.email)
      if (!EmailRegex.test(this.email)) {
        console.log('[UserPasswordReset]emai not valid', this.email)
        return
      }

      passwordResetService
        .create({ email: this.email }, { ignoreErrors: true })
        .then(res => {
          console.log('[PasswordReset] res', res)
          this.isLoading = false
          this.$router.push({ name: 'passwordResetSent' })
        })
        .catch(err => {
          this.error = err.message
          this.isLoading = false
        })
    },
  },
}
</script>
