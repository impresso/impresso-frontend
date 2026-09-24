<template>
  <header class="Header position-fixed top-0 w-100">
    <nav class="h-100 navbar navbar-expand navbar-light">
      <div class="container-fluid">
        <span class="ml-2 navbar-brand">
          <a
            :href="InstitutionsAccessBaseUrl"
            class="text-decoration-none text-reset"
            target="_self"
          >
            <LogoImpressoInst :width="90" />
          </a>
        </span>
        <!-- <div class="mx-2 navbar-nav">
          <div class="nav-item">
            <a
              href="/datalab/about"
              class="text-decoration-none text-reset nav-link"
              target="_self"
            >
              Guide
            </a>
          </div>
        </div> -->
        <div class="ms-auto align-items-center mr-3 navbar-nav">
          <template v-if="isAuthenticated">
            <UserDropdown :user="user" :userPlan="userPlan" @logout="logout">
              <template #role>
                <div class="user-role small-caps text-left">
                  {{ $t('institutionContactpoint') }}
                </div>
              </template>
            </UserDropdown>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>
<script setup lang="ts">
import User from '@/models/User'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import LogoImpressoInst from '@/components/LogoImpressoInst.vue'
import { InstitutionsAccessBaseUrl } from '@/constants'
import UserDropdown from '@/components/UserDropdown.vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.userData !== false)
const userPlan = computed(() => userStore.userPlan)
const user = computed(() => (isAuthenticated.value ? (userStore.user as any as User) : null))
const router = useRouter()

const logout = () => {
  console.info('logging out..')
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>
<style>
.Header {
  background-color: #f5f4f3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1003;
}
.Header > nav.navbar {
  --bs-gutter-x: 1.5rem;
  --bs-gutter-y: 0;
  width: 100%;
  padding-right: calc(var(--bs-gutter-x) * 0.5);
  padding-left: calc(var(--bs-gutter-x) * 0.5);
}

.Header::before {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  height: 1.5px;
  background-color: var(--impresso-color-yellow);
  content: '';
}
</style>
<i18n lang="json">
{
  "en": {
    "institutionContactpoint": "Reviewer"
  }
}
</i18n>
