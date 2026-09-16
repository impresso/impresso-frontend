<template>
  <header class="Header position-fixed top-0 w-100">
    <nav class="h-100 navbar navbar-expand navbar-light">
      <div class="container-fluid">
        <span class="ml-2 navbar-brand">
          <a
            :href="InstitutionsAccessBaseUrl"
            class="text-decoration-none text-reset"
            target="_self"
            :aria-label="$t('home')"
          >
            <LogoImpressoInst :width="90" />
          </a>
        </span>
        <div class="ms-auto align-items-center mr-3 navbar-nav gap-2">
          <template v-if="isAuthenticated">
            <div class="nav-item" v-for="section in sections" :key="section.name">
              <RouterLink
                :to="{ name: section.name }"
                class="text-decoration-none nav-link px-2 py-1"
                :class="{ active: activeSection === section.id }"
              >
                {{ $t(`sections.${section.id}`) }}
              </RouterLink>
            </div>
            <UserDropdown :user="user" :userPlan="userPlan" @logout="logout">
              <template #role>
                <div class="user-role small-caps text-left">
                  {{ $t('institutionContactpoint') }}
                </div>
              </template>
              <template #default>
                <li class="mx-3 mb-2">
                  <ReviewerSettings />
                </li>
                <li class="mx-3">
                  <hr class="dropdown-divider" />
                </li>
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
import ReviewerSettings from './ReviewerSettings.vue'
import { useRoute, useRouter } from 'vue-router'
import { Routes, RoutesByRequestStatus } from '../router/routes'

const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.userData !== false)
const userPlan = computed(() => userStore.userPlan)
const user = computed(() => (isAuthenticated.value ? (userStore.user as any as User) : null))
const route = useRoute()
const router = useRouter()

/**
 * App level sections. Status filtering is not navigation, it lives inside the
 * requests view, so the header only carries the workspace sections.
 */
const sections = [
  { id: 'requests', name: Routes.index.name },
  { id: 'emailTemplates', name: Routes.emailTemplates.name }
] as const

/** Every route name that belongs to the requests section. */
const requestsRouteNames: string[] = [
  ...RoutesByRequestStatus.map(([, , name]) => name as string),
  'SpecialMembershipRequest'
]

const activeSection = computed<'requests' | 'emailTemplates' | null>(() => {
  const name = route.name as string | undefined
  if (name === Routes.emailTemplates.name) return 'emailTemplates'
  if (name && requestsRouteNames.includes(name)) return 'requests'
  return null
})

const logout = () => {
  console.info('logging out..')
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>
<style>
.Header {
  background-color: var(--impresso-color-paper);
  border-bottom: 1px solid var(--clr-grey-600);
  z-index: 1003;
  height: var(--institutions-header-height);
}
.Header > nav.navbar {
  --bs-gutter-x: 1.5rem;
  --bs-gutter-y: 0;
  width: 100%;
  padding-right: calc(var(--bs-gutter-x) * 0.5);
  padding-left: calc(var(--bs-gutter-x) * 0.5);
}

/**
 * This header sits on a light background, unlike the main app's dark navbar,
 * so its accents use the site greys rather than the brand yellow, which has
 * too little contrast here.
 */
.Header::before {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  height: 1.5px;
  background-color: var(--clr-grey-200);
  content: '';
}

.Header .nav-link {
  color: var(--clr-grey-200);
  border-bottom: 2px solid transparent;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.Header .nav-link:hover {
  color: var(--clr-grey-100);
  border-bottom-color: var(--clr-grey-500);
}

.Header .nav-link.active {
  font-weight: 600;
  font-variation-settings: 'wght' 600;
  color: var(--clr-grey-100);
  border-bottom-color: var(--clr-grey-100);
}

.Header .nav-link:focus-visible {
  outline-offset: 4px;
}
</style>
<i18n lang="json">
{
  "en": {
    "home": "Institutional access home",
    "institutionContactpoint": "Reviewer",
    "sections": {
      "requests": "Requests",
      "emailTemplates": "Auto-reply"
    }
  }
}
</i18n>
