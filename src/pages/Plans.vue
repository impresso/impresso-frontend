<template>
  <div class="PlansPage container my-5">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">{{ $t('plansPageTitle') }}</h1>
        <PlansContent :userPlan="userPlan" :acceptedTermsDate="acceptedTermsDate" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PlansContent from '@/components/modules/PlansContent.vue'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const userPlan = computed(() => userStore.userPlan)
const acceptedTermsDate = computed(() => userStore.acceptTermsDate)
</script>

<i18n lang="json">
{
  "en": {
    "plansPageTitle": "Impresso User Plans"
  }
}
</i18n>
