<template>
  <div>
    <b-navbar toggleable="md" type="dark" variant="dark" class="TheHeader py-0 pr-1 border-primary">
      <SwitchBetweenAppDatalab
        isDatalab
        href="/datalab"
        class="very-small-caps-medium shadow-sm"
        style="background-color: var(--impresso-color-yellow)"
      >
        switch to DataLab
      </SwitchBetweenAppDatalab>
      <a
        class="navbar-brand"
        @click="$router.push(getRouteWithSearchQuery({ name: 'home' }))"
        target="_self"
        title="Home"
      >
        <Logo />
      </a>

      <b-navbar-nav class="align-items-center text-center">
        <BDropdown class="px-2 text-white">
          <template v-slot:button-content>
            <span
              class="text-white"
              @click="$router.push(getRouteWithSearchQuery({ name: 'search' }))"
              >{{ $t('label_search') }}</span
            >
          </template>
          <li
            class="px-2"
            v-for="routeName in [
              Routes.search.name,
              Routes.searchImages.name,
              Routes.searchNgrams.name
            ]"
            :key="routeName"
          >
            <RouterLink
              :to="getRouteWithSearchQuery({ name: routeName })"
              active-class="active"
              :title="$t(`label_${routeName}`)"
              class="nav-link"
            >
              <span>{{ $t(`label_${routeName}`) }}</span>
            </RouterLink>
          </li>
        </BDropdown>
        <BDropdown class="px-2 text-white">
          <template v-slot:button-content>
            <span>{{ $t('label_explore') }}</span>
          </template>
          <li class="px-2">
            <RouterLink
              :to="getRouteWithSearchQuery({ name: 'sources' })"
              active-class="active"
              title="Sources"
              class="nav-link"
            >
              <span>{{ $t('label_media_sources') }}</span>
            </RouterLink>
          </li>
          <li class="px-2">
            <RouterLink
              :to="{ name: 'compare', query: { left: searchQueryHash } }"
              active-class="active"
              title="Inspect & Compare"
              class="nav-link"
            >
              <span>{{ $t('label_compare') }}</span></RouterLink
            >
          </li>

          <li class="px-2">
            <RouterLink
              v-if="textReuseEnabled"
              :to="getRouteWithSearchQuery({ name: 'textReuseOverview' }, { p: 1 })"
              active-class="active"
              title="Text reuse"
              class="nav-link"
            >
              <span>{{ $t('label_text_reuse') }}</span>
            </RouterLink>
          </li>
        </BDropdown>
        <b-nav-item
          v-if="user"
          :to="getRouteWithSearchQuery({ name: 'collections' })"
          :active="$route.path.indexOf('/collections') === 0"
        >
          <span>{{ $t('collections') }}</span>
        </b-nav-item>

        <!-- <b-nav-item :to="getRouteWithSearchQuery({ name: 'topics' })" active-class="active">
          <span>{{ $t('label_topics') }}</span>
        </b-nav-item> -->
        <!-- b-nav-item :to="getRouteWithSearchQuery({ name: 'entities' })" active-class="active">
          <span>{{$t("label_entities")}}</span>
        </b-nav-item -->
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="!connectivityStatus">
          <span class="badge badge-warning">{{ $t('connectivityStatus.offline') }}</span>
        </b-nav-item>
        <b-nav-item v-if="connectivityStatus">
          <span class="badge border border-accent rounded">{{
            $t('connectivityStatus.online')
          }}</span>
        </b-nav-item>
        <BDropdown class="px-2">
          <template v-slot:button-content>
            <span class="text-white">{{ $t('label_faq') }}</span>
          </template>
          <li>
            <LinkToModal class="nav-link px-3" :view="ViewCorpusOverview">
              <span>{{ $t('label_corpus_catalogue') }}</span>
            </LinkToModal>
          </li>
          <li>
            <RouterLink :to="{ name: 'faq' }" active-class="active" class="nav-link px-3">
              <span>{{ $t('label_documentation') }}</span>
            </RouterLink>
          </li>
        </BDropdown>
        <TasksDropdownPreview v-if="user" :max-items="4" />
        <BDropdown class="px-2">
          <template v-slot:button-content>
            <span>{{ $t('label_data_access') }}</span>
          </template>

          <li v-for="viewName in [ViewPlans, ViewTermsOfUse]" :key="viewName">
            <LinkToModal class="nav-link px-3" :view="viewName">
              <span>{{ $t(`label_${viewName.toLowerCase()}`) }}</span>
            </LinkToModal>
          </li>
        </BDropdown>
      </b-navbar-nav>
      <!-- user area -->
      <b-navbar-nav v-if="user" class="TheHeader__userArea mx-2">
        <UserArea :user="user" :userPlan="userPlan" :userPlanLabel="userPlanLabel" />
      </b-navbar-nav>
      <!-- end of user area -->
      <!-- login area -->
      <b-navbar-nav v-if="!user" class="TheHeader__userArea mx-2">
        <b-nav-item :to="loginRouteParams">
          <span class="small-caps">{{ $t('login') }}</span>
        </b-nav-item>
        <li class="navbar-text mx-1">|</li>
        <b-nav-item :to="registerRouteParams">
          <span class="small-caps">{{ $t('register') }}</span>
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <b-alert :show="showAlert" dismissible variant="warning" class="m-0 px-3">
      <div v-for="(error, idx) in errorMessages" v-bind:key="idx">
        <span class="error-alert">
          <span v-if="error.name === 'NotAuthenticated' && user">{{
            $t('errors.Notauthenticated')
          }}</span>
          <span v-else-if="error.name === 'BadGateway'">{{
            $t(`errors.BadGateway.${error.message}`)
          }}</span>
          <span v-else-if="error.name === 'TypeError'"
            >{{ $t(`errors.TypeError`) }} {{ error.message }}</span
          >
          <span v-else-if="error.name === 'Timeout'"
            >{{ $t(`errors.Timeout`) }} {{ error.message }}</span
          >
          <span v-else-if="error.name === 'BadRequest'">
            {{ $t('errors.BadRequest') }}
            <span>{{ error.message }}</span>
          </span>
          <span v-else-if="error.name === 'NotFound'">
            {{ $t(`errors.NotFound`) }}
          </span>
          <span v-else-if="error.name === 'GeneralError'">
            {{
              $t(`errors.GeneralError`, { error: error.message ?? 'general error, unspecified' })
            }}
          </span>
          <span v-else-if="error.name === 'Error'">
            {{ $t(`errors.Error`, { error: error.message ?? 'general error, unspecified' }) }}
          </span>
          <span v-else-if="error.name === 'NotImplemented'">
            {{ $t(`errors.Error`, { error: error.message ?? 'general error, unspecified' }) }}
          </span>
          <span v-else>{{ error }}</span>
          <span v-if="error.id" class="error-id">
            <info-button name="error-id" placement="bottom" class="ml-2" />
            [ {{ error.id }} ]
          </span>
        </span>
        <span v-if="error.route.length">&nbsp;{{ $t(['paths', ...error.route].join('.')) }}</span>
      </div>
    </b-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import Logo from '@/components/Logo.vue'
import LinkToModal from './LinkToModal.vue'
import TasksDropdownPreview from '@/components/TasksDropdownPreview.vue'
import { getLatestSerializedSearchQuery } from '@/logic/storage'
import { useJobsStore } from '@/stores/jobs'
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'
import type { ErrorMessage } from '@/stores/notifications'
import UserArea from './UserArea.vue'
import { PlanLabels, ViewCorpusOverview, ViewPlans, ViewTermsOfUse } from '@/constants'
import { RouterLink } from 'vue-router'
import SwitchBetweenAppDatalab from 'impresso-ui-components/components/logos/SwitchBetweenAppDatalab.vue'
import { Routes } from '@/router/routes'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute } from 'vue-router'

const route = useRoute()
const jobsStore = useJobsStore()
const userStore = useUserStore()
const notificationsStore = useNotificationsStore()

const jobsPaginationPerPage = 4

const searchQueryHash = computed(() => {
  const sq = route.query.sq
  if (Array.isArray(sq) && sq[0] != null) return sq[0]
  if (!Array.isArray(sq) && sq != null) return String(sq)
  return getLatestSerializedSearchQuery() ?? ''
})

const loginRouteParams = computed(() => ({
  name: 'login',
  query: {
    redirect: route.fullPath
  }
}))

const registerRouteParams = computed(() => ({
  name: 'register',
  query: {
    redirect: route.fullPath
  }
}))

const user = computed(() => userStore.user)
const userPlan = computed(() => userStore.userPlan)
const userPlanLabel = computed(() => PlanLabels[userPlan.value] || '...')

const errorMessages = computed<ErrorMessage[]>(() => {
  return notificationsStore.errorMessages.filter(m => {
    if (m.name === 'NotAuthenticated' && !user.value) {
      return false
    }
    return true
  })
})
const showAlert = computed(() => errorMessages.value.length > 0)
const connectivityStatus = computed(() => notificationsStore.connectivityStatus)
const textReuseEnabled = computed(
  () =>
    !!(window as typeof window & { impressoFeatures?: any }).impressoFeatures?.textReuse?.enabled
)

function getRouteWithSearchQuery(
  routeParams: RouteLocationRaw,
  additionalQueryParameters: Record<string, unknown> = {}
) {
  const normalizedRoute = routeParams as { query?: Record<string, unknown> }

  return {
    ...normalizedRoute,
    query: {
      ...normalizedRoute.query,
      ...additionalQueryParameters,
      sq: searchQueryHash.value
    }
  }
}

watch(
  user,
  value => {
    if (value) {
      void jobsStore.loadJobs({ page: 1, limit: jobsPaginationPerPage })
    }
  },
  { immediate: true }
)

</script>

<style lang="css">
.TheHeader {
  height: 56px;
}

.TheHeader .navbar-nav .nav-link {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100px;
  min-width: 50px;
}

#app-header .Cookie--blood-orange {
  background: var(--impresso-clr-secondary);
  border-bottom: 2px solid var(--impresso-clr-accent);
  box-shadow: 0 0 5vh 0vw rgba(0, 0, 0, 0.8);
}

#app-header .Cookie--blood-orange a {
  color: white;
  text-decoration: underline;
}

#app-header .Cookie--blood-orange .Cookie__button {
  background: var(--impresso-clr-accent);
  color: black;
}

#app-header .Cookie--blood-orange .Cookie__message {
  color: yellow;
}

#app-header .progress {
  position: absolute;
  width: 100%;
  z-index: 100;
  top: 0;
  left: 0;
}

#app-header .badge-pill {
  position: absolute;
  line-height: 0.9;
  top: -5px;
  right: -15px;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
}

#app-header .badge-pill.badge-tiny {
  right: 0;
  top: 18px;
  width: 0.4rem;
  padding: 0;
  height: 0.4rem;
  overflow: hidden;
  background: var(--impresso-yellow);
  display: block;
  min-width: auto;
}

#app-header .toaster {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 100;
}

#app-header nav {
  margin-top: 0;
}

#app-header nav .navbar-collapse {
  height: 44px;
}

#app-header nav .border-left {
  border-color: var(--impresso-clr-tertiary) !important;
}

#app-header .navbar-brand img {
  height: 30px;
}

#app-header .nav-title {
  margin: auto;
}

#app-header .nav-title h1 {
  background: transparent;
  color: white;
  text-align: center;
  padding: 1px 4px;
}

#app-header .nav-title h1 .title {
  font-weight: normal;
}

#app-header .nav-title h1 .subtitle {
  font-weight: bold;
}

#app-header .navbar-dark .navbar-nav .nav-link {
  color: var(--clr-grey-800);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 50px;
  text-decoration: none;
}

#app-header .navbar-dark .navbar-nav .nav-link > span {
  position: relative;
}

#app-header .navbar-dark .navbar-nav .nav-link > span:before {
  content: '';
  position: absolute;
  width: 100%;
  height: 0px;
  border-bottom: 1px solid var(--impresso-yellow);
  bottom: 0px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease-in;
}

#app-header .navbar-dark .navbar-nav .nav-link:hover > span:before {
  border-color: white;
}

#app-header .navbar-dark .navbar-nav .nav-link:hover > span:before,
#app-header .navbar-dark .navbar-nav .nav-link.active > span:before {
  transform: scaleX(1);
}

#app-header .navbar-dark .navbar-nav .nav-link.active > span {
  color: white;
}

#app-header .navbar-dark .dropdown.show .dropdown-toggle {
  background-color: var(--clr-grey-100);
  color: #fff;
}

#app-header .navbar-dark .navbar-nav .nav-link:focus,
#app-header .navbar-dark .navbar-nav .nav-link:hover {
  color: var(--impresso-color-white);
  background: var(--clr-grey-100) !important;
}

#app-header::before {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  height: 2px;
  background-color: var(--impresso-color-yellow);
  content: '';
}

#app-header .navbar-dark .b-nav-dropdown {
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
}

#app-header .navbar-dark .b-nav-dropdown.show {
  background: var(--clr-grey-200) !important;
}

#app-header .navbar-dark .b-nav-dropdown.show > a {
  color: var(--impresso-color-white);
}

#app-header .navbar-dark .b-nav-dropdown .dropdown-menu {
  background: var(--clr-grey-100) !important;
  padding: 0.5rem 0;
  margin-top: 0px;
  top: auto !important;
  border: 0px solid;
  border-bottom-left-radius: var(--impresso-border-radius-sm);
  border-bottom-right-radius: var(--impresso-border-radius-sm);
}

#app-header .navbar-dark .b-nav-dropdown .dropdown-menu.dropdown-menu-right {
  margin-right: -1px;
}

#app-header .navbar-dark .b-nav-dropdown .dropdown-menu .dropdown-item {
  color: var(--clr-grey-800);
  padding: 0.5rem 1rem;
}

#app-header .navbar-dark .b-nav-dropdown .dropdown-menu .dropdown-item.disabled {
  text-decoration: line-through;
}

#app-header .navbar-dark .b-nav-dropdown .dropdown-menu .dropdown-item.active {
  color: var(--impresso-color-white);
  background: var(--clr-grey-400);
}

#app-header .navbar-dark .b-nav-dropdown .dropdown-menu .btn-outline-primary {
  border: 1px solid #caccce;
  color: #caccce;
}

#app-header .navbar-dark .b-nav-dropdown .dropdown-menu .btn-outline-primary:hover {
  border-color: var(--impresso-color-white);
  color: var(--impresso-color-white);
}

#app-header .dropdown-toggle::after {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  line-height: 2.25rem;
  margin-top: -1rem;
}

@media (min-width: 992px) {
  #app-header .navbar-nav .nav-link {
    max-width: 120px;
  }
}

@media (min-width: 1200px) {
  #app-header .navbar-nav .nav-link {
    max-width: 220px;
  }
}

.error-alert {
  display: flex;
  justify-content: space-between;
  padding-right: 2rem;
}

.error-alert .error-id {
  margin-left: 1rem;
  white-space: nowrap;
}

.TheHeader.bg-dark .dropdown .dropdown-menu {
  border-color: transparent;
  background-color: var(--clr-grey-100);
  color: var(--impresso-color-paper);
  border-top-left-radius: var(--impresso-border-radius-sm);
}

.TheHeader.bg-dark .dropdown .btn.dropdown-toggle {
  display: flex;
  align-items: center;
  color: var(--impresso-color-paper);
  border-color: transparent;
  padding: 0 var(--impresso-spacing-2);
}

.TheHeader.bg-dark .dropdown .btn.dropdown-toggle:focus-visible {
  outline: none;
  box-shadow: none;
}

.TheHeader.bg-dark .dropdown .btn.dropdown-toggle:not(.disabled):hover,
.TheHeader.bg-dark .dropdown .btn.dropdown-toggle:not(.disabled):focus {
  background-color: var(--clr-grey-100);
  border-radius: var(--impresso-border-radius-sm);
  box-shadow: none;
}

.TheHeader.bg-dark .dropdown.show .btn.dropdown-toggle {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.TheHeader.bg-dark .dropdown-toggle[aria-expanded='true'] {
  border-bottom: 1px solid var(--clr-grey-100) !important;
}

.TheHeader_switchToDatalab {
  color: var(--impresso-color-black);
  background-color: var(--impresso-color-yellow);
  z-index: 1100;
  text-decoration: none;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -48px);
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  padding: 50px var(--spacing-3) 2px;
  border-bottom-left-radius: var(--impresso-border-radius-xs);
  border-bottom-right-radius: var(--impresso-border-radius-xs);
  transition: transform var(--impresso-transition-duration) var(--impresso-transition-ease);
  box-shadow: var(--bs-box-shadow-lg);
}
.TheHeader_switchToDatalab:hover {
  transform: translate(-50%, 0);
}
</style>

<i18n lang="json">
{
  "en": {
    "login": "login",
    "register": "register",
    "logout": "Logout",
    "dashboard": "Dashboard",
    "collections": "Collections",
    "profile": "Profile",
    "label_home": "Home",
    "label_data_access": "Data Access",
    "label_plans": "User Plans",
    "label_search": "Search",
    "label_media_sources": "Sources",
    "label_explore": "Explore",
    "label_topics": "Topics",
    "label_entities": "Entities",
    "label_compare": "Inspect & Compare",
    "label_corpus_catalogue": "Corpus Catalogue",
    "label_text_reuse": "Text reuse",
    "label_text_reuse_star": "Text reuse (experimental)",
    "label_search_text": "Search text",
    "label_searchImages": "Search images",
    "label_searchNgrams": "Search ngrams",
    "label_faq": "Documentation",
    "label_documentation": "Web App Documentation",
    "label_terms-of-use": "Terms of Use"
  }
}
</i18n>
