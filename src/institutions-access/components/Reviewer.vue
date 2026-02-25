<template>
  <div class="d-flex px-2 py-2 align-items-center border shadow-sm rounded-pill" v-if="user">
    <div class="user-picture position-relative mr-2 me-2" style="width: 40px; height: 40px">
      <Sunset :radius="20" :colors="user.pattern" class="position-absolute left-0 top-0 m-0" />
    </div>
    <div class="">
      <div class="user-fullname font-weight-bold mb-1">{{ userFullName }}</div>
      <div class="user-role small-caps">{{ userPlanLabel }} + {{ $t('institutionAccess') }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import Sunset from 'impresso-ui-components/components/Sunset.vue'
import { PlanLabels } from '@/constants'

const userStore = useUserStore()

const user = computed(() => userStore.userData)
const logout = () => {
  console.info('logging out..')
  userStore.logout()
}
const userFullName = computed(() => {
  if (!user.value) {
    return ''
  }
  const name = `${user.value.firstname} ${user.value.lastname}`.trim()
  if (name === '') {
    console.warn('User has no name', user.value)
    return user.value.username ?? '-'
  }
  return name
})

const userPlanLabel = computed(() => {
  return PlanLabels[userStore.userPlan] || userStore.userPlan
})
</script>
<i18n lang="json">
{
  "en": {
    "reviewer": "Reviewer",
    "institutionAccess": "Institution Access"
  }
}
</i18n>
