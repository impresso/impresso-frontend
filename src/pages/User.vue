<template>
  <div class="container mb-5 User">
    <div class="row">
      <div class="col-12 col-lg-8 offset-lg-2">
        <div class="d-flex align-items-center my-5">
          <div class="colors-wrapper flex-shrink-1">
            <Sunset :colors="colouredPattern" :radius="40"></Sunset>
          </div>
          <div class="ml-4">
            <h1 class="m-0 sans font-weight-bold">
              {{ userLabel }}
            </h1>
            <div class="small-caps-bold mt-1">
              {{ userPlanLabel }}
            </div>
          </div>
        </div>

        <ProfileForm
          :mode="'edit'"
          @submit="handleOnSubmit"
          :initialValues="signUpFormInitialValues"
          bodyClass="px-3 pt-3 pb-0"
          dialogClass="SignUpModal modal-lg modal-dialog
    modal-dialog-centered modal-dialog-scrollable"
        >
          <template v-if="error" #form-errors>
            <Alert class="mb-3" type="error">{{ error.message }}</Alert>
          </template>
        </ProfileForm>
      </div>
    </div>
  </div>
</template>
<style>
.User h1 {
  font-size: 1.5rem;
}
.User .SignUpForm .bg-white {
  background-color: transparent !important;
}
</style>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Sunset from 'impresso-ui-components/components/Sunset.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import ProfileForm from 'impresso-ui-components/components/ProfileForm.vue'
import type { ProfileFormPayload } from 'impresso-ui-components/components/ProfileForm.vue'
import type { FeathersError } from '@feathersjs/errors'

import { me as userService } from '@/services'
import { useUserStore } from '@/stores/user'
import User from '@/models/User'
import { PlanGuest, PlanLabels } from '@/constants'

const userStore = useUserStore()
const userPlanLabel = computed(() => {
  return PlanLabels[userStore.userPlan] || PlanLabels[PlanGuest]
})
const isLoading = ref(true)
const error = ref<FeathersError | null>(null)
const signUpFormInitialValues = ref<ProfileFormPayload>({
  firstname: '',
  lastname: '',
  institutionalUrl: '',
  affiliation: '',
  email: '',
  password: '',
  repeatPassword: '',
  pattern: ''
})

function handleOnSubmit(payload: ProfileFormPayload): void {
  isLoading.value = true
  console.debug('[User] @sublmit handleOnSubmit...')
  userService
    .patch(null, payload)
    .then(data => {
      console.debug('[User] update success', data)
      updateStoredUserData(data)
    })
    .catch((err: FeathersError) => {
      error.value = err
      console.warn('[ProfileModal] update error ', err, err.message, err.data)
    })
    .finally(() => {
      isLoading.value = false
    })
}
const colouredPattern = computed(() => {
  return signUpFormInitialValues.value.pattern
    ? signUpFormInitialValues.value.pattern.split(',')
    : ['#000000', '#FFFFFF']
})

const userLabel = computed(() => {
  const { firstname, lastname } = signUpFormInitialValues.value
  return `${firstname} ${lastname}`.trim() || 'User'
})

function fetchUser(): void {
  isLoading.value = true
  userService
    .find()
    .then(data => {
      console.debug('[ProfileModal] fetchUser success:', data)
      updateStoredUserData(data)
    })
    .catch((err: FeathersError) => {
      error.value = err
      console.warn('[RegisterModal] fetchUser error ', err, err.message, err.data)
    })
    .finally(() => {
      isLoading.value = false
    })
}

function updateStoredUserData(data: any): void {
  signUpFormInitialValues.value = {
    firstname: data.firstname,
    lastname: data.lastname,
    institutionalUrl: data.institutionalUrl,
    affiliation: data.affiliation,
    email: data.email,
    password: '',
    repeatPassword: '',
    pattern: data.pattern || ''
  }
  userStore.setUserData(new User({ ...userStore.userData, ...signUpFormInitialValues.value }))
}

onMounted(() => {
  fetchUser()
})
</script>
