<template>
  <div>
    <div class="progress" v-if="processingStatus" style="height: 4px">
      <div
        class="progress-bar bg-info progress-bar-animated progress-bar-striped"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="100"
        :style="`width: ${100}%;`"
      ></div>
    </div>
    <b-navbar
      id="TheHeader"
      toggleable="md"
      type="dark"
      variant="dark"
      class="py-0 pr-1 border-primary"
    >
      <a
        class="navbar-brand"
        @click="$router.push(getRouteWithSearchQuery({ name: 'home' }))"
        target="_self"
        title="Home"
      >
        <Logo />
      </a>

      <b-navbar-nav class="align-items-center text-center">
        <b-nav-item
          :to="getRouteWithSearchQuery({ name: 'search' })"
          active-class="active"
          class="position-relative"
          title="Search"
        >
          <span>{{ $tc('label_search', 0) }}</span>
          <!-- <transition name="bounce">
            <b-badge v-if="countActiveFilters" pill variant="tiny" class="position-absolute">
            </b-badge>
          </transition> -->
        </b-nav-item>

        <b-nav-item
          :to="getRouteWithSearchQuery({ name: 'newspapers' })"
          active-class="active"
          title="Newspapers"
        >
          <span>{{ $t('label_newspapers') }}</span>
        </b-nav-item>
        <!-- <b-nav-item :to="getRouteWithSearchQuery({ name: 'topics' })" active-class="active">
          <span>{{ $t('label_topics') }}</span>
        </b-nav-item> -->
        <!-- b-nav-item :to="getRouteWithSearchQuery({ name: 'entities' })" active-class="active">
          <span>{{$t("label_entities")}}</span>
        </b-nav-item -->
        <b-nav-item
          :to="{ name: 'compare', query: { left: searchQueryHash } }"
          active-class="active"
          title="Inspect & Compare"
        >
          <span>{{ $t('label_compare') }}</span>
        </b-nav-item>

        <b-nav-item
          v-if="textReuseEnabled"
          :to="getRouteWithSearchQuery({ name: 'textReuseOverview' }, { p: 1 })"
          active-class="active"
          title="Text reuse"
        >
          <span>{{ $t('label_text_reuse') }}</span>
        </b-nav-item>
        <b-nav-item>
          <LinkToModal class="nav-link" :view="ViewPlans">
            <span>
              {{ $t('label_plans') }}
            </span>
          </LinkToModal>
        </b-nav-item>
        <b-nav-item v-if="!connectivityStatus">
          <span class="badge badge-warning">{{ $t('connectivityStatus.offline') }}</span>
        </b-nav-item>
        <b-nav-item v-if="connectivityStatus">
          <span class="badge border border-accent rounded">{{
            $t('connectivityStatus.online')
          }}</span>
        </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-nav-item :to="{ name: 'faq' }" active-class="active">
          <span>{{ $t('label_faq') }}</span>
        </b-nav-item>
        <b-nav-item
          v-if="user"
          :to="getRouteWithSearchQuery({ name: 'collections' })"
          :active="$route.path.indexOf('/collections') === 0"
        >
          <span>{{ $t('collections') }}</span>
        </b-nav-item>
        <b-dropdown
          v-if="user && jobs.length"
          right
          no-caret
          ref="ddownJobs"
          v-on:hidden="updateLastNotificationDate"
        >
          <template v-slot:button-content>
            <div
              class="d-inline-block dripicons-cloud-download position-relative"
              style="top: 0.25em"
            />
            <span class="ml-1">{{ $t('label_jobs') }}</span>
            <transition name="bounce">
              <b-badge v-if="runningJobs.length > 0" pill variant="danger" class="border">
                {{ runningJobs.length }}
              </b-badge>
            </transition>
          </template>
          <template v-slot:button-icon>
            <Icon name="chevron" :scale="0.75" :strokeWidth="2" />
          </template>
          <div v-if="!jobs.length" class="bg-dark text-center text-white p-4">
            {{ $t('no-jobs-yet') }}
          </div>
          <div v-else class="jobs-list">
            <div class="list">
              <job-item
                :item="job"
                class="job px-3 py-2 border-bottom"
                v-for="(job, i) in jobs"
                :key="i"
                style="border-color: var(--clr-grey-200) !important"
              />
            </div>
            <div class="pt-2 pb-1 d-flex justify-content-center">
              <pagination
                @click.prevent.stop
                :current-page="jobsPaginationCurrentPage"
                @change="$event => (jobsPaginationCurrentPage = $event)"
                :total-rows="jobsPaginationTotalRows"
                :per-page="jobsPaginationPerPage"
                aria-controls="my-table"
                class="small-caps d-inline-block"
                :showDescription="false"
              />
            </div>
          </div>
        </b-dropdown>
      </b-navbar-nav>
      <!-- user area -->
      <b-navbar-nav v-if="user" class="TheHeader__userArea mx-2">
        <UserArea :user="user" />
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

<script lang="js">
import { defineComponent } from 'vue'
import Icon from '@/components/base/Icon.vue'
import JobItem from '@/components/modules/lists/JobItem.vue'
import Pagination from '@/components/modules/Pagination.vue'
import Logo from '@/components/Logo.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import { searchQueryGetter, searchQueryHashGetter } from '@/logic/queryParams'
import { mapStores } from 'pinia'
import { useJobsStore } from '@/stores/jobs'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'
import UserArea from './UserArea.vue'
import { ViewPlans } from '@/constants'
import LinkToModal from './LinkToModal.vue'

export default defineComponent({
  // props: {
  //   searchQuery: Object,
  // },
  data: () => ({
    ViewPlans,
    languages: {
      de: {
        code: 'de',
        name: 'Deutsch',
        disabled: true
      },
      en: {
        code: 'en',
        name: 'English'
      },
      fr: {
        code: 'fr',
        name: 'Français',
        disabled: true
      },
      it: {
        code: 'it',
        name: 'Italiano',
        disabled: true
      },
      nl: {
        code: 'nl',
        name: 'Nederlands',
        disabled: true
      }
    },
    jobsPaginationPerPage: 4,
    jobsCurrentPage: 1,
    jobsPaginationCurrentPage: 1
  }),
  // mounted() {
  //   if (this.user) {
  //     this.jobsStore.loadJobs().then(() => {
  //       console.info('Jobs loaded.');
  //     });
  //   }
  // },
  computed: {
    ...mapStores(useJobsStore, useSettingsStore, useUserStore, useNotificationsStore),
    searchQueryHash: searchQueryHashGetter(),
    searchQuery: searchQueryGetter(),
    loginRouteParams() {
      return {
        name: 'login',
        query: {
          redirect: this.$route.fullPath
        }
      }
    },
    registerRouteParams() {
      return {
        name: 'register',
        query: {
          redirect: this.$route.fullPath
        }
      }
    },
    countActiveFilters() {
      return this.searchQuery.countActiveFilters()
    },
    countActiveItems() {
      return this.searchQuery.countActiveItems()
    },
    jobs() {
      return this.jobsStore.items
    },
    jobsPaginationTotalRows() {
      return this.jobsStore.totalItems
    },
    runningJobs() {
      return this.jobs.filter(d => d.status === 'RUN')
    },
    activeLanguageCode() {
      return this.settingsStore.language_code
    },
    showAlert() {
      return this.errorMessages.length > 0
    },
    errorMessages() {
      return this.notificationsStore.errorMessages.filter(m => {
        if (m.name === 'NotAuthenticated' && !this.user) {
          return false
        }
        return true
      })
    },
    processingStatus() {
      return this.notificationsStore.processingStatus
    },
    user() {
      return this.userStore.user
    },
    userFullName() {
      const name = `${this.user.firstname} ${this.user.lastname}`.trim()
      return name === '' ? this.user.username : name
    },
    userRole() {
      // if (this.user.displayName && this.user.displayName.length) {
      //   return this.user.displayName
      // }
      return this.user.isStaff ? this.$t('staff') : this.$t('researcher')
    },
    userPicture() {
      const style = {
        backgroundColor: 'black'
      }

      if (this.user.pattern) {
        const gradient = []

        this.user.pattern.forEach((color, i) => {
          const start = Math.round((100 * i) / this.user.pattern.length)
          const stop = Math.round((100 * (i + 1)) / this.user.pattern.length)
          gradient.push(`${color} ${start}%, ${color} ${stop}%`)
        })

        style.backgroundImage = `linear-gradient(90deg,${gradient.join(',')})`
      }
      return style
    },
    connectivityStatus() {
      return this.notificationsStore.connectivityStatus
    },
    version() {
      return window.impressoFrontendVersion
    },
    textReuseEnabled() {
      // @ts-ignore
      return !!window.impressoFeatures?.textReuse?.enabled
    }
  },
  methods: {
    updateLastNotificationDate() {
      this.settingsStore.updateLastNotificationDate()
    },
    test() {
      return this.jobsStore.createTestJob()
    },
    selectLanguage(languageCode) {
      window.app.$i18n.locale = languageCode
      this.settingsStore.setLanguageCode(languageCode)
    },
    getRouteWithSearchQuery(route, additionalQueryParameters = {}) {
      return {
        ...route,
        query: {
          ...route.query,
          ...additionalQueryParameters,
          sq: this.searchQueryHash
        }
      }
    }
  },
  watch: {
    jobsPaginationCurrentPage: {
      handler(page) {
        if (this.user) {
          this.jobsStore.loadJobs({
            page,
            limit: this.jobsPaginationPerPage
          })
        }
      },
      immediate: true
    },
    user: {
      handler(user) {
        if (user) {
          this.jobsStore.loadJobs({
            page: 1,
            limit: this.jobsPaginationPerPage
          })
        }
      }
    },
    jobs: {
      handler(jobs) {
        if (jobs.length && this.$refs.ddownJobs) {
          const lastModifiedDate = jobs
            .map(d => d.lastModifiedDate.getTime())
            .sort()
            .pop()
          const lastNotificationDate = this.settingsStore.lastNotificationDateAsDate

          if (lastNotificationDate - lastModifiedDate < 0) {
            console.info(
              'Stored settings.lastNotificationDate is behind a job lastModifiedDate, show job dropdown.'
            )
            this.$refs.ddownJobs.show()
          } else {
            console.info(
              'Stored settings.lastNotificationDate is synced with job lastModifiedDate, nothing to show.'
            )
          }
        }
      }
    }
  },
  components: {
    Icon,
    Logo,
    // Toast,
    JobItem,
    Pagination,
    InfoButton,
    UserArea,
    LinkToModal
  }
})
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

#TheHeader {
  height: 56px;
}

.TheHeader .navbar-nav .nav-link {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100px;
  min-width: 50px;
}

#app-header {
  .Cookie--blood-orange {
    background: $clr-secondary;
    border-bottom: 2px solid $clr-accent;
    box-shadow: 0 0 5vh 0vw rgba(0, 0, 0, 0.8);
    a {
      color: white;
      text-decoration: underline;
    }
    .Cookie__button {
      background: $clr-accent;
      color: black;
    }

    .Cookie__message {
      color: yellow;
    }
  }
  .progress {
    position: absolute;
    width: 100%;
    z-index: 100;
    top: 0;
    left: 0;
  }

  .badge-pill {
    position: absolute;
    line-height: 0.9;
    top: -5px;
    right: -15px;
    border-radius: 10px;
    min-width: 20px;
    height: 20px;

    &.badge-tiny {
      right: 0;
      top: 18px;
      width: 0.4rem;
      padding: 0;
      height: 0.4rem;
      overflow: hidden;
      background: var(--impresso-yellow);
      display: block;
      min-width: auto;
      // border: 1px solid black!important;
    }
  }

  .toaster {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 100;
  }
  .jobs {
    min-width: 400px;
  }
  nav {
    margin-top: 0;
    .navbar-collapse {
      height: 44px;
    }
    .border-left {
      border-color: $clr-tertiary !important;
    }
  }
  .navbar-brand {
    img {
      height: 30px;
    }
  }
  .nav-title {
    margin: auto;
    h1 {
      background: transparent;
      color: white;
      text-align: center;
      padding: 1px 4px;
      .title {
        font-weight: normal;
      }
      .subtitle {
        font-weight: bold;
      }
    }
  }

  .navbar-dark .navbar-nav .nav-link {
    color: $clr-grey-800;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    min-width: 50px;
    > span {
      position: relative;
    }
    > span:before {
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
    &:hover > span:before {
      border-color: white;
    }
    &:hover > span:before,
    &.active > span:before {
      transform: scaleX(1);
    }
    &.active > span {
      color: white;
    }
  }
  .navbar-dark .dropdown.show .dropdown-toggle {
    background-color: var(--clr-grey-100);
    color: #fff;
  }
  .navbar-dark .navbar-nav .nav-link:focus,
  .navbar-dark .navbar-nav .nav-link:hover {
    color: $clr-white;
    background: var(--clr-grey-100) !important;
  }
  &::before {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    height: 2px;
    background-color: $clr-accent-light;
    content: '';
  }

  .navbar-dark .b-nav-dropdown {
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;

    &.show {
      background: var(--clr-grey-100) !important;
    }

    &.show > a {
      color: $clr-white;
    }
  }
  .navbar-dark .b-nav-dropdown .dropdown-menu {
    background: var(--clr-grey-100) !important;
    padding: 0.5rem 0;
    margin-top: 0px;
    top: auto !important;

    border: 0px solid;
    border-bottom-left-radius: var(--border-radius-sm);
    border-bottom-right-radius: var(--border-radius-sm);

    &.dropdown-menu-right {
      margin-right: -1px;
    }
    .dropdown-item {
      color: $clr-grey-800;
      padding: 0.5rem 1rem;
    }
    .dropdown-item.disabled {
      text-decoration: line-through;
    }

    .dropdown-item.active {
      color: $clr-white;
      background: var(--clr-grey-400);
    }

    .btn-outline-primary {
      border: 1px solid #caccce;
      color: #caccce;
      &:hover {
        border-color: $clr-white;
        color: $clr-white;
      }
    }
  }

  .dropdown-toggle::after {
    position: absolute;
    top: 50%;
    right: 0.75rem;
    line-height: 2.25rem;
    margin-top: -1rem;
  }
}

.jobs-list > .list {
  width: 350px;
  height: 300px;
  overflow: auto;
  border-bottom: 1px solid #3d434a;
}

@media (min-height: 600px) {
  .jobs-list > .list {
    max-height: 550px;
    height: auto;
  }
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

  .error-id {
    margin-left: 1rem;
    white-space: nowrap;
  }
}

#TheHeader.bg-dark .dropdown .dropdown-menu {
  border-color: transparent;
  background-color: var(--clr-grey-100);
  color: var(--impresso-color-paper);
  border-top-left-radius: var(--impresso-border-radius-sm);
}
#TheHeader.bg-dark .dropdown .btn.dropdown-toggle {
  display: flex;
  align-items: center;
  color: var(--impresso-color-paper);
  border-color: transparent;
  padding: 0 var(--spacing-2);
}
#TheHeader.bg-dark .dropdown .btn.dropdown-toggle:focus-visible {
  outline: none;
  box-shadow: none;
}
#TheHeader.bg-dark .dropdown .btn.dropdown-toggle:not(.disabled):hover,
#TheHeader.bg-dark .dropdown .btn.dropdown-toggle:not(.disabled):focus {
  background-color: var(--clr-grey-100);
  border-radius: var(--impresso-border-radius-sm);
  box-shadow: none;
}
#TheHeader.bg-dark .dropdown.show .btn.dropdown-toggle {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
#TheHeader.bg-dark .dropdown-toggle[aria-expanded='true'] {
  border-bottom: 1px solid var(--clr-grey-100) !important;
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
    "label_plans": "Plans",
    "label_search": "Search | Search* ({n} filter) | Search* ({n} filters)",
    "label_search_with_items": "Search | Search* ({n} filter, {items}) | Search* ({n} filters, {items})",
    "label_newspapers": "Newspapers",
    "label_explore": "explore...",
    "label_topics": "Topics",
    "label_entities": "Entities",
    "label_compare": "Inspect & Compare",
    "label_text_reuse": "Text reuse",
    "label_text_reuse_star": "Text reuse (experimental)",
    "label_current_search": "browse results ...",
    "label_faq": "Help",
    "label_terms": "Terms of Use",
    "label_jobs": "Running tasks",
    "label_terms_of_use": "Terms of Use",
    "staff": "staff",
    "researcher": "researcher",
    "join_slack_channel": "Join us on <b>Slack!</b>",
    "current_version": "frontend <span class='small-caps'>{version}</span>"
  }
}
</i18n>
