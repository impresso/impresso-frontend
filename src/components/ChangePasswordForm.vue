<template>
  <form @submit.prevent="submitForm" class="password-change-form">
    <!-- Current Password Field -->
    <div class="form-group">
      <label for="currentPassword">Current Password:</label>
      <div class="password-field">
        <input
          :type="showCurrentPassword ? 'text' : 'password'"
          id="currentPassword"
          v-model="formData.currentPassword"
          :disabled="isLoading"
          :class="{
            'border-danger': v$.currentPassword.$error,
            'border-success': !v$.currentPassword.$error && v$.currentPassword.$dirty
          }"
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
        <input
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
      <div id="passwordRequirements" class="password-requirements">
        <p>Password requirements:</p>
        <ul>
          <li :class="{ 'requirement-met': formData.newPassword.length >= 8 }">
            At least 8 characters
          </li>
          <li :class="{ 'requirement-met': /[A-Z]/.test(formData.newPassword) }">
            Contains uppercase letter
          </li>
          <li :class="{ 'requirement-met': /[a-z]/.test(formData.newPassword) }">
            Contains lowercase letter
          </li>
          <li :class="{ 'requirement-met': /[0-9]/.test(formData.newPassword) }">
            Contains number
          </li>
          <li :class="{ 'requirement-met': /[^A-Za-z0-9]/.test(formData.newPassword) }">
            Contains special character
          </li>
        </ul>
      </div>
      <div v-if="v$.newPassword.$error" id="newPasswordError" role="alert">
        <p v-for="(error, key) in v$.newPassword.$errors" :key="key" class="error-message">
          {{ error.$message }}
        </p>
      </div>
    </div>

    <!-- Repeat New Password Field -->
    <div class="form-group">
      <label for="repeatNewPassword">Repeat New Password:</label>
      <div class="password-field">
        <input
          :type="showRepeatPassword ? 'text' : 'password'"
          id="repeatNewPassword"
          v-model="formData.repeatNewPassword"
          :disabled="isLoading"
          :class="{
            'border-danger': v$.repeatNewPassword.$error,
            'border-success': !v$.repeatNewPassword.$error && v$.repeatNewPassword.$dirty
          }"
          aria-describedby="repeatPasswordError"
        />
        <button
          type="button"
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

    <button type="submit" :disabled="isLoading" class="submit-button">
      <span v-if="isLoading">Updating...</span>
      <span v-else>Change Password</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, sameAs, helpers } from '@vuelidate/validators'

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

const props = withDefaults(defineProps<ChangePasswordFormProps>(), {
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
  currentPassword: { required: helpers.withMessage('Current password is required', required) },
  newPassword: {
    required: helpers.withMessage('New password is required', required),
    minLength: helpers.withMessage('Password must be at least 8 characters', minLength(8)),
    strongPassword
  },
  repeatNewPassword: {
    required: helpers.withMessage('Please confirm your new password', required),
    sameAs: helpers.withMessage('Passwords do not match', sameAs(formData, 'newPassword'))
  }
}

// Initialize validation
const v$ = useVuelidate(rules, formData)

// Define emits with type safety
const emit = defineEmits<{
  (e: 'form-submitted', payload: PasswordChangePayload): void
}>()

// Form submission handler
const submitForm = async () => {
  // Trigger validation
  const isFormValid = await v$.value.$validate()

  if (isFormValid) {
    // Form is valid, emit event with password data
    emit('form-submitted', {
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
.password-change-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.password-field {
  display: flex;
  position: relative;
}

.password-field input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  font-size: 0.85rem;
}

.password-requirements {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.password-requirements ul {
  padding-left: 1.5rem;
  margin-top: 0.25rem;
}

.requirement-met {
  color: #28a745;
}

.border-danger {
  border-color: #dc3545 !important;
}

.border-success {
  border-color: #28a745 !important;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.submit-button {
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
