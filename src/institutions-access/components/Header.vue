<template>
  <header class="Header position-fixed top-0 w-100 z-1">
    <nav class="h-100 navbar navbar-expand navbar-light">
      <div class="container-fluid">
        <span class="ml-2 navbar-brand">
          <a href="/instit" class="text-decoration-none text-reset" target="_self">
            <LogoImpressoApp :width="90" />
          </a>
        </span>
        <div class="mx-2 navbar-nav">
          <div class="nav-item">
            <a
              href="/datalab/about"
              class="text-decoration-none text-reset nav-link"
              target="_self"
            >
              Guide
            </a>
          </div>
        </div>
        <div class="ms-auto align-items-center me-3 navbar-nav">
          <template v-if="isAuthenticated"> Logged in </template>
        </div>
      </div>
    </nav>
  </header>
</template>
<script setup lang="ts">
import UserArea from '@/components/UserArea.vue'
import User from '@/models/User'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import { PlanLabels } from '@/constants'
import LogoImpressoApp from 'impresso-ui-components/components/logos/LogoImpressoApp.vue'

const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.userData !== false)
const userPlan = computed(() => userStore.userPlan)
const user = computed(() => (isAuthenticated.value ? (userStore.user as any as User) : null))
</script>
<style>
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
