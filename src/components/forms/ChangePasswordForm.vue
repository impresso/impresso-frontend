<template>
  <form @submit.prevent="submitForm" class="password-change-form">
    <!-- Current Password Field -->
    <div class="form-group">
      <label for="currentPassword">Current Password:</label>
      <div class="password-field">
        <b-form-input
          :type="showCurrentPassword ? 'text' : 'password'"
          id="currentPassword"
          v-model="formData.currentPassword"
          :disabled="isLoading"
          :class="{
            'border-danger': v$.currentPassword.$error,
            'border-success': !v$.currentPassword.$error && v$.currentPassword.$dirty
          }"
          class="rounded-sm shadow-sm"
          aria-describedby="currentPasswordError"
        />
        <button
          type="button"
          class="toggle-password"
          @click="showCurrentPassword = !showCurrentPassword"
          aria-label="Toggle current password visibility"
        >
          {{ showCurrentPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
      <div v-if="v$.currentPassword.$error" id="currentPasswordError" role="alert">
        <p v-for="(error, key) in v$.currentPassword.$errors" :key="key" class="error-message">
          {{ error.$message }}
        </p>
      </div>
    </div>

    <!-- New Password Field -->
    <div class="form-group">
      <label for="newPassword">New Password:</label>
      <div class="password-field">
        <b-form-input
          class="rounded-sm shadow-sm"
          :type="showNewPassword ? 'text' : 'password'"
          id="newPassword"
          v-model="formData.newPassword"
          :disabled="isLoading"
          :class="{
            'border-danger': v$.newPassword.$error,
            'border-success': !v$.newPassword.$error && v$.newPassword.$dirty
          }"
          aria-describedby="newPasswordError passwordRequirements"
        />
        <button
          type="button"
          class="toggle-password"
          @click="showNewPassword = !showNewPassword"
          aria-label="Toggle new password visibility"
        >
          {{ showNewPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
      <div
        id="passwordRequirements"
        class="password-requirements p-2"
        v-if="formData.newPassword.length > 0"
      >
        <ul class="list-unstyled m-0 text-muted small">
          <li>
            <span>Password requirements:</span>
          </li>
          <li class="requirement" :class="{ 'requirement-met': formData.newPassword.length >= 8 }">
            At least 8 characters
          </li>
          <li
            class="requirement"
            :class="{ 'requirement-met': /[A-Z]/.test(formData.newPassword) }"
          >
            Contains uppercase letter
          </li>
          <li
            class="requirement"
            :class="{ 'requirement-met': /[a-z]/.test(formData.newPassword) }"
          >
            Contains lowercase letter
          </li>
          <li
            class="requirement"
            :class="{ 'requirement-met': /[0-9]/.test(formData.newPassword) }"
          >
            Contains number
          </li>
          <li
            class="requirement"
            :class="{ 'requirement-met': /[^A-Za-z0-9]/.test(formData.newPassword) }"
          >
            Contains special character
          </li>
        </ul>
      </div>
      <div v-if="v$.newPassword.$error" id="newPasswordError" role="alert">
        <span v-for="(error, key) in v$.newPassword.$errors" :key="key" class="error-message mr-1">
          {{ error.$message }}
        </span>
      </div>
    </div>

    <!-- Repeat New Password Field -->
    <div class="form-group">
      <label for="repeatNewPassword">Repeat New Password:</label>
      <div class="password-field">
        <b-form-input
          :type="showRepeatPassword ? 'text' : 'password'"
          id="repeatNewPassword"
          v-model="formData.repeatNewPassword"
          :disabled="isLoading"
          class="rounded-sm shadow-sm"
          :class="{
            'border-danger': v$.repeatNewPassword.$error,
            'border-success': !v$.repeatNewPassword.$error && v$.repeatNewPassword.$dirty
          }"
          aria-describedby="repeatPasswordError"
        />

        <button
          type="submit"
          class="toggle-password"
          @click="showRepeatPassword = !showRepeatPassword"
          aria-label="Toggle repeat password visibility"
        >
          {{ showRepeatPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
      <div v-if="v$.repeatNewPassword.$error" id="repeatPasswordError" role="alert">
        <p v-for="(error, key) in v$.repeatNewPassword.$errors" :key="key" class="error-message">
          {{ error.$message }}
        </p>
      </div>
    </div>
    <div class="position-sticky bottom-0 bg-white border-top py-3">
      <slot name="form-errors">
        <Alert type="warning" class="mb-3" role="alert" v-if="v$.$error">
          <p class="m-0">Please correct the errors in the form before submitting.</p>
        </Alert>
      </slot>
      <button
        class="btn btn-outline-secondary btn-md px-4 border border-dark btn-block"
        type="submit"
        :disabled="
          isLoading ||
          v$.currentPassword.$error ||
          v$.newPassword.$error ||
          v$.repeatNewPassword.$error
        "
        aria-label="Change password"
      >
        <Icon name="key" :strokeWidth="1.5" />
        <span class="ml-2" v-if="isLoading">Updating...</span>
        <span class="ml-2" v-else>Change Password</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, sameAs, helpers } from '@vuelidate/validators'
import Icon from '@/components/base/Icon.vue'
import Alert from '@/components/Alert.vue'
// Define more specific types for form data and emitted events
interface PasswordFormData {
  currentPassword: string
  newPassword: string
  repeatNewPassword: string
}

export interface PasswordChangePayload {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordFormProps {
  isLoading: boolean
}

withDefaults(defineProps<ChangePasswordFormProps>(), {
  isLoading: false
})

// Password visibility toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showRepeatPassword = ref(false)

// Form data
const formData = reactive<PasswordFormData>({
  currentPassword: '',
  newPassword: '',
  repeatNewPassword: ''
})

// Custom password validator
const strongPassword = helpers.withMessage(
  'Password must include uppercase, lowercase, number, and special character',
  (value: string) => {
    return (
      /[A-Z]/.test(value) && // has uppercase
      /[a-z]/.test(value) && // has lowercase
      /[0-9]/.test(value) && // has number
      /[^A-Za-z0-9]/.test(value) // has special character
    )
  }
)

// Validation rules
const rules = {
  currentPassword: {
    required: helpers.withMessage('Current password is required.', required)
  },
  newPassword: {
    required: helpers.withMessage('New password is required.', required),
    minLength: helpers.withMessage('Password must be at least 8 characters.', minLength(8)),
    strongPassword
  },
  repeatNewPassword: {
    required: helpers.withMessage('Please confirm your new password.', required),

    sameAs: helpers.withMessage(
      'Passwords do not match.',
      sameAs(computed(() => formData.newPassword))
    )
  }
}

// Initialize validation
const v$ = useVuelidate(rules, formData)

// Define emits with type safety
const emit = defineEmits<{
  (e: 'submit', payload: PasswordChangePayload): void
}>()

// Form submission handler
const submitForm = async () => {
  // Trigger validation
  const isFormValid = await v$.value.$validate()
  console.info('[ChangePasswordForm] Form validation result:', isFormValid)
  if (isFormValid) {
    // Form is valid, emit event with password data
    emit('submit', {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    })

    // Reset form after successful submission
    formData.currentPassword = ''
    formData.newPassword = ''
    formData.repeatNewPassword = ''
    v$.value.$reset()

    // Reset visibility toggles
    showCurrentPassword.value = false
    showNewPassword.value = false
    showRepeatPassword.value = false
  }
}
</script>

<style scoped>
.password-field {
  display: flex;
  position: relative;
}

.password-field input {
  flex: 1;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  /* color: #777; */
  cursor: pointer;
  font-size: var(--impresso-font-size-smaller);
}

.requirement-met {
  color: #28a745;
}
.password-requirements li {
  position: relative;
  display: inline;
  margin-inline-end: var(--spacing-3);
}
.password-requirements li.requirement:before {
  content: 'x';
  position: absolute;
  left: -8px;
  top: -2px;
}
.password-requirements li.requirement.requirement-met:before {
  content: '✓';
  color: #28a745;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}
</style>
