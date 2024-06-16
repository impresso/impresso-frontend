<template>
  <main id="PasswordChange">
    <b-container class="mb-5">
      <b-row>
        <b-col md="6" offset-md="3">
          <div class="my-5">
            <h1 class="border-dark my-3 pb-3 sans">{{ $t('ChangePassword') }}</h1>
            <p>
              Type your new password below.
            </p>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6" offset-md="3">
          <b-alert v-if="formError" variant="danger" dismissible :show="Boolean(formError)"
            @dismissed="formError = null" v-html="$t('errors.formError', { error: formError })">
          </b-alert>
          <b-alert v-if="error" :show="Boolean(error)" variant="danger">
            <p>
              An error has occurred in the process of changing your password ({{ error }}). Please
              restart the process.
            </p>

            <router-link :to="{ name: 'passwordReset' }" class="btn btn-sm btn-outline-secondary"
              v-html="$t('actions.resetMyPassword')" />
          </b-alert>
          <form @submit.prevent="onSubmit">
            <b-form-group id="input-group-1" label="New password:" label-for="input-1"
              description="Enter your new password.">
              <b-form-input id="input-1" @update:modelValue="() => (error = null)" v-model="password" type="password"
                required placeholder="Enter new password"></b-form-input>
            </b-form-group>
            <b-form-group id="input-group-2" label="Confirm new password:" label-for="input-2"
              description="Confirm your new password.">
              <b-form-input @update:modelValue="() => (error = null)" id="input-2" v-model="passwordConfirm"
                type="password" required placeholder="Confirm new password"></b-form-input>
            </b-form-group>
            <b-button type="submit" class="mt-2" size="sm" variant="outline-secondary">{{
              $t('actions.changePassword')
              }}</b-button>
          </form>
        </b-col>
      </b-row>
    </b-container>
  </main>
</template>

<script>
import { mapActions } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'

import { passwordReset as passwordResetService } from '@/services'

const PasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_\-@$!%*?&])[A-Za-z\d@$!%*?&_-]{8,}$/

export default {
  name: 'PasswordChange',
  data() {
    return {
      password: '',
      passwordConfirm: '',
      error: null,
      formError: null,
      isLoading: false,
      completed: false,
      isComplete: false,
    }
  },
  methods: {
    ...mapActions(useNotificationsStore, ['addNotification']),
    onSubmit(e) {
      e.stopPropagation()
      e.preventDefault()
      this.error = null
      this.formError = null
      if (this.isLoading) {
        console.warn('[PasswordChange] onSubmit is loading')
        return
      }
      if (this.isComplete) {
        console.warn('[PasswordChange] onSubmit is complete')
        return
      }
      if (!this.password || !this.passwordConfirm) {
        this.formError = 'Please enter your new password twice.'
        return
      }
      if (this.password !== this.passwordConfirm) {
        this.formError = 'The two passwords do not match.'
        return
      }
      if (!PasswordRegex.test(this.password)) {
        this.formError =
          'Your password must be at least 8 characters long and contain at least one number and one uppercase letter.'
        return
      }
      this.isLoading = true
      passwordResetService
        .patch(
          0,
          {
            token: this.$route.params.token,
            password: this.password,
          },
          { ignoreErrors: true },
        )
        .then(() => {
          // add a toast message
          this.addNotification({
            title: 'Password changed successfully.',
            message: 'Your password has been changed.',
            type: 'success'
          })
          this.isComplete = true
          // go to login pqge qfter 500 ms
          setTimeout(() => {
            this.$router.push({ name: 'home' })
          }, 1500)
        })
        .catch(error => {
          console.log('[PasswordChange] error', error.message)
          this.error = String(error.message)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
  },
}
</script>
