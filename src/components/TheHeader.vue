<template>
  <div>
    <div class="progress" v-if="processingStatus" style="height: 4px;">
      <div
        class="progress-bar bg-info progress-bar-animated progress-bar-striped"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="100"
        :style="`width: ${100}%;`"></div>
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
        <b-nav-item-dropdown
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
          <div v-if="!jobs.length" class="text-center text-white p-4">
            {{ $t('no-jobs-yet') }}
          </div>
          <div v-else class="jobs-list">
            <div class="list">
              <job-item
                :item="job"
                class="job px-3 pb-2 mt-2 border-bottom border-dark"
                v-for="(job, i) in jobs"
                :key="i"
              />
            </div>
            <div class="pt-2 pb-1">
              <pagination
                @click.prevent.stop
                :current-page="jobsPaginationCurrentPage"
                @change="$event => (jobsPaginationCurrentPage = $event)"
                :total-rows="jobsPaginationTotalRows"
                :per-page="jobsPaginationPerPage"
                aria-controls="my-table"
                class="small-caps justify-content-center"
                :showDescription="false"
              />
            </div>
          </div>
        </b-nav-item-dropdown>
      </b-navbar-nav>
      <!-- user area -->
      <b-navbar-nav v-if="user" class="TheHeader__userArea mx-2">
        <b-nav-item-dropdown class="px-0" right>
          <template v-slot:button-content>
            <div class="d-flex px-2 py-1 align-items-center">
              <div class="user-picture position-relative mr-2 me-2" :style="userPicture"></div>
              <div class="user-label mr-4 me-4">
                <div class="user-fullname">{{ userFullName }}</div>
                <div class="user-role mt-1 small-caps">{{ userRole }}</div>
              </div>
            </div>
          </template>
          <b-dropdown-item :to="{ name: 'user' }">{{ $t('profile') }}</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'termsOfUse' }" active-class="active">
            {{ $t('label_terms_of_use') }}
          </b-dropdown-item>
          <b-dropdown-item :to="{ name: 'collections' }" active-class="active">{{
            $t('collections')
          }}</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'logout' }">{{ $t('logout') }}</b-dropdown-item>
          <b-dropdown-item v-if="user && user.isStaff" v-on:click="test()"
            >send test job</b-dropdown-item
          >
          <b-dropdown-item
            target="_blank"
            href="https://join.slack.com/t/impresso-community/shared_invite/enQtNTg5MzY2NDg2NTAyLTdiMmI2ZWU5ZjliNGNjN2M4NTgxM2UzOTQyYTkxYWU4MTgwN2I1MzQxMzg3N2Y0NGU3OGFjMzFmMGIyNGRlZmQ"
          >
            <icon name="slack" />
            <span v-html="$t('join_slack_channel')"></span>
          </b-dropdown-item>

          <b-dropdown-item>
            <span v-html="$t('current_version', { version })"></span>
          </b-dropdown-item>
        </b-nav-item-dropdown>
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
        <span>
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
            {{ $t(`errors.BadRequest`) }}
            <span v-if="error.message === 'Login incorrect'">{{ error.message }}</span>
          </span>
          <span v-else>{{ error }}</span>
        </span>
        <span v-if="error.route.length">&nbsp;{{ $t(['paths', ...error.route].join('.')) }}</span>
      </div>
    </b-alert>
  </div>
</template>

<script>
import Icon from '@/components/base/Icon.vue'
import JobItem from '@/components/modules/lists/JobItem.vue'
import Pagination from '@/components/modules/Pagination.vue'
import Logo from '@/components/Logo.vue'
import { searchQueryGetter, searchQueryHashGetter } from '@/logic/queryParams'
import { mapStores } from 'pinia'
import { useJobsStore } from '@/stores/jobs'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'

export default {
  // props: {
  //   searchQuery: Object,
  // },
  data: () => ({
    languages: {
      de: {
        code: 'de',
        name: 'Deutsch',
        disabled: true,
      },
      en: {
        code: 'en',
        name: 'English',
      },
      fr: {
        code: 'fr',
        name: 'Français',
        disabled: true,
      },
      it: {
        code: 'it',
        name: 'Italiano',
        disabled: true,
      },
      nl: {
        code: 'nl',
        name: 'Nederlands',
        disabled: true,
      },
    },
    jobsPaginationPerPage: 4,
    jobsCurrentPage: 1,
    jobsPaginationCurrentPage: 1,
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
          redirect: this.$route.path,
        },
      }
    },
    registerRouteParams() {
      return {
        name: 'register',
        query: {
          redirect: this.$route.path,
        },
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
      const messages = this.notificationsStore.errorMessages
      if (
        messages.length &&
        !this.user &&
        messages[0].name === 'NotAuthenticated'
      ) {
        return false
      }
      return messages.length > 0
    },
    errorMessages() {
      return this.notificationsStore.errorMessages
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
        backgroundColor: 'black',
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
    },
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
          sq: this.searchQueryHash,
        },
      }
    },
  },
  watch: {
    jobsPaginationCurrentPage: {
      handler(page) {
        if (this.user) {
          this.jobsStore.loadJobs({
            page,
            limit: this.jobsPaginationPerPage,
          })
        }
      },
      immediate: true,
    },
    user: {
      handler(user) {
        if (user) {
          this.jobsStore.loadJobs({
            page: 1,
            limit: this.jobsPaginationPerPage,
          })
        }
      },
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
              'Stored settings.lastNotificationDate is behind a job lastModifiedDate, show job dropdown.',
            )
            this.$refs.ddownJobs.show()
          } else {
            console.info(
              'Stored settings.lastNotificationDate is synced with job lastModifiedDate, nothing to show.',
            )
          }
        }
      },
    },
  },
  components: {
    Icon,
    Logo,
    // Toast,
    JobItem,
    Pagination,
  },
}
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

#TheHeader {
  height: 56px;
}

.TheHeader__userArea {
  background-color: transparent;
}
.TheHeader__userArea .nav-item .nav-link.dropdown-toggle {
  // padding: 0;
  border-radius: var(--border-radius-sm);
}
.TheHeader__userArea .nav-item.show {
  border-radius: var(--border-radius-sm);
}
.TheHeader__userArea .nav-item.show .nav-link.dropdown-toggle {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.TheHeader .navbar-nav .nav-link {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100px;
}

#app-header .dropdown-toggle[aria-expanded='true'] {
  border-bottom: 0px solid transparent !important;
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
    top: 0;
    right: 0;
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

  .user-picture {
    background: $clr-primary;
    width: 2em;
    height: 2em;
    border-radius: 2em;
    border: 1px solid $clr-accent-light;
  }

  .user-fullname {
    padding-bottom: 0.125rem;

    line-height: 1em;
    font-weight: bold;
    color: white;
  }

  .user-role {
    line-height: 1;
    // font-size: 0.8em;
  }
}

.jobs-list > .list {
  width: 350px;
  height: 300px;
  overflow: scroll;
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
</style>

<i18n lang="json">
{
  "en": {
    "login": "login",
    "register": "register",
    "logout": "logout",
    "dashboard": "Dashboard",
    "collections": "Collections",
    "profile": "Profile",
    "label_home": "Home",
    "label_search": "Search | Search* ({n} filter) | Search* ({n} filters)",
    "label_search_with_items": "Search | Search* ({n} filter, {items}) | Search* ({n} filters, {items})",
    "label_newspapers": "Newspapers",
    "label_entities": "Entities",
    "label_explore": "explore...",
    "label_topics": "Topics",
    "label_entities": "Entities",
    "label_compare": "Inspect & Compare",
    "label_text_reuse": "Text reuse",
    "label_text_reuse_star": "Text reuse (experimental)",
    "label_current_search": "browse results ...",
    "label_faq": "Help",
    "label_jobs" : "Running tasks",
    "label_terms_of_use": "Terms of Use",
    "staff": "staff",
    "researcher": "researcher",
    "join_slack_channel": "Join us on <b>Slack!</b>",
    "current_version": "frontend <span class='small-caps'>{version}</span>"
  }
}
</i18n>
