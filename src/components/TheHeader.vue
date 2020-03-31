<template lang="html">
  <div >
    <b-progress v-if='processingStatus' :value="100" variant="info" animated height="4px"></b-progress>
    <b-navbar id="TheHeader" toggleable="md" type="dark" variant="dark" class="py-0 pr-1 border-primary">
      <b-navbar-brand :to="{name: 'home'}">
        <img src="./../assets/img/impresso-logo-h-i@2x.png" />
      </b-navbar-brand>

      <b-navbar-nav>
        <b-nav-item v-if="!countActiveSearchFilters" v-bind:to="{ name: 'search', query: currentSearchQueryParams }" active-class="active">
          {{$tc("label_search", 0)}}
        </b-nav-item>

        <b-nav-item-dropdown  no-caret
          v-if="countActiveSearchFilters"
          ref="ddownSearchResults" v-on:shown="openSearchQueryExplorer" class="pl-3">
          <template slot="button-content">
            <span style="color: gold">
              <span v-if="countActiveSearchItems" v-html="$tc('label_search_with_items', countActiveSearchFilters, {
                items: $tc('numbers.items', countActiveSearchItems),
              })" />
              <span v-else>
                {{ $tc('label_search', countActiveSearchFilters) }}
              </span>
            </span>
          </template>
          <b-button class="ml-3 my-2" size="sm" variant="outline-primary outline-primary-contrast" :disabled="$route.name === 'search'" v-bind:to="{ name: 'search', query: currentSearchQueryParams }">
            {{$t('actions.searchMore')}}
          </b-button>
          <!-- <b-button class="ml-2 my-2" size="sm" variant="outline-primary bg-light" v-bind:to="{ name: 'search' }">
            {{$t('actions.resetQuery')}}
          </b-button> -->
          <search-query-explorer dark-mode/>
        </b-nav-item-dropdown>

        <b-nav-item v-bind:to="{ name: 'newspapers'}" active-class="active">
          {{$t("label_newspapers")}}
        </b-nav-item>
        <!-- <b-nav-item v-bind:to="{ name: 'entities'}" exact-active-class="active">
          {{$t("label_entities")}}
        </b-nav-item> -->
        <b-nav-item v-bind:to="{ name: 'topics', query: { pq: currentSearchHash } }" active-class="active">
          {{$t("label_topics")}}
        </b-nav-item>
        <b-nav-item v-bind:to="{ name: 'compare'}" active-class="active">
          {{$t("label_compare")}}
        </b-nav-item>
        <b-nav-item
          v-if="textReuseEnabled"
          v-bind:to="{ name: 'text-reuse-cluster-detail'}"
          active-class="active">
          {{$t("label_text_reuse")}}
        </b-nav-item>
        <b-nav-item v-if="!connectivityStatus">
          <span class="badge badge-warning">{{ $t('connectivityStatus.offline') }}</span>
        </b-nav-item>
      </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-item v-bind:to="{ name: 'faq'}" active-class="active">
            {{$t("label_faq")}}
          </b-nav-item>
          <b-nav-item v-bind:to="{ name: 'termsOfUse'}" active-class="active">
            {{$t("label_terms_of_use")}}
          </b-nav-item>
          <b-nav-item-dropdown right no-caret
            v-if="user"
            ref="ddownJobs" v-on:hidden="updateLastNotificationDate">
              <template slot="button-content">
                <div class="dripicons-cloud-download position-relative" style="top:0.25em" />
                <transition name="bounce">
                  <b-badge
                    v-if="runningJobs.length > 0" pill variant="danger" class="border">
                    {{runningJobs.length}}
                  </b-badge>
                </transition>
              </template>
            <div class="jobs">
              <div v-if="jobs.length === 0" class="text-center text-white p-4">
                {{ $t('no-jobs-yet' )}}
              </div>
              <div v-else>
                <toast v-for="(job, i) in jobs" v-bind:job="job" v-bind:key="i" />
                <div
                  v-if="paginationJobsList.totalRows > paginationJobsList.perPage"
                  class="my-4">
                  <div class="fixed-pagination-footer p-1 m-0">
                    <pagination
                      v-bind:perPage="paginationJobsList.perPage"
                      v-bind:currentPage="paginationJobsList.currentPage"
                      v-bind:totalRows="paginationJobsList.totalRows"
                      v-on:change="onChangeJobsPage"
                      class="small-caps"
                      v-bind:showDescription="false" />
                  </div>
                </div>
              </div>
            </div>
          </b-nav-item-dropdown>
          <!-- <b-nav-item-dropdown v-bind:text="languages[activeLanguageCode].code" class="p-2" right>
            <b-dropdown-item v-for="language in languages"
            v-bind:active="activeLanguageCode === language.code"
            v-bind:key="language.code"
            v-bind:disabled="language.disabled"
            v-on:click="selectLanguage(language.code)">
              <span>{{language.name}}</span>
            </b-dropdown-item>
          </b-nav-item-dropdown> -->
          <b-nav-item-dropdown v-if="user" class="user-space pl-1 pr-2 " right>
            <template slot="button-content">
              <div class='d-inline-block mt-2'>
                <div class='user-picture mt-1 float-left position-relative' :style='userPicture'>
                </div>
                <div class='user-label pt-2'>
                  <div class='user-fullname'>{{userFullName}}</div>
                  <div class='user-role small-caps'>{{userRole}}</div>
                </div>
              </div>
            </template>
            <b-dropdown-item v-bind:to="{ name: 'user'}">{{$t('profile')}}</b-dropdown-item>
            <b-dropdown-item v-bind:to="{ name: 'collections'}">{{$t("collections")}}</b-dropdown-item>
            <b-dropdown-item v-bind:to="{ name: 'logout'}">{{$t("logout")}}</b-dropdown-item>
            <b-dropdown-item v-if="user && user.isStaff" v-on:click="test()">send test job</b-dropdown-item>
            <b-dropdown-item
              target="_blank"
              href="https://join.slack.com/t/impresso-community/shared_invite/enQtNTg5MzY2NDg2NTAyLTdiMmI2ZWU5ZjliNGNjN2M4NTgxM2UzOTQyYTkxYWU4MTgwN2I1MzQxMzg3N2Y0NGU3OGFjMzFmMGIyNGRlZmQ">
              <icon name="slack"/>
              <span v-html="$t('join_slack_channel')"></span>
            </b-dropdown-item>

            <b-dropdown-text class="px-3" v-html="$t('current_version', { version })"/>
          </b-nav-item-dropdown>
          <b-nav-item class="small-caps border-left" v-else v-bind:to="loginRouteParams">{{$t("login")}}</b-nav-item>
        </b-navbar-nav>
    </b-navbar>
    <b-alert :show="showAlert" dismissible variant="warning" class="m-0 px-3">
      <div v-for="(error, idx) in errorMessages" v-bind:key="idx">
        <span>
          <span v-if="error.name === 'NotAuthenticated'">{{ $t('errors.Notauthenticated') }}</span>
          <span v-else-if="error.name === 'BadGateway'">{{ $t(`errors.BadGateway.${error.message}`) }}</span>
          <span v-else-if="error.name === 'TypeError'">{{ $t(`errors.TypeError`) }} {{ error.message }}</span>
          <span v-else-if="error.name === 'Timeout'">{{ $t(`errors.Timeout`) }} {{ error.message }}</span>
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
import Icon from 'vue-awesome/components/Icon';
import Toast from './modules/Toast';
import Pagination from './modules/Pagination';
import SearchQueryExplorer from './modals/SearchQueryExplorer';

Icon.register({slack:{width:1664,height:1792,d:'M1519 776q62 0 103.5 40.5t41.5 101.5q0 97-93 130l-172 59 56 167q7 21 7 47 0 59-42 102t-101 43q-47 0-85.5-27t-53.5-72l-55-165-310 106 55 164q8 24 8 47 0 59-42 102t-102 43q-47 0-85-27t-53-72l-55-163-153 53q-29 9-50 9-61 0-101.5-40t-40.5-101q0-47 27.5-85t71.5-53l156-53-105-313-156 54q-26 8-48 8-60 0-101-40.5t-41-100.5q0-47 27.5-85t71.5-53l157-53-53-159q-8-24-8-47 0-60 42-102.5t102-42.5q47 0 85 27t53 72l54 160 310-105-54-160q-8-24-8-47 0-59 42.5-102t101.5-43q47 0 85.5 27.5t53.5 71.5l53 161 162-55q21-6 43-6 60 0 102.5 39.5t42.5 98.5q0 45-30 81.5t-74 51.5l-157 54 105 316 164-56q24-8 46-8zM725 1038l310-105-105-315-310 107z'}})

export default {
  data: () => ({
    countActiveSearchFilters: [],
    countActiveSearchItems: 0,
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
  }),
  mounted() {
    if (this.user) {
      this.$store.dispatch('jobs/LOAD_JOBS').then(() => {
        console.info('Jobs loaded.');
      });
    }
    this.countActiveSearchFilters = this.$store.getters['search/getCurrentSearch'].countActiveFilters();
  },
  computed: {
    loginRouteParams() {
      return {
        name: 'login',
        query: {
          redirect: this.$route.path,
        },
      };
    },
    jobs() {
      return this.$store.state.jobs.items;
    },
    runningJobs() {
      return this.$store.state.jobs.items.filter(d => d.status === 'RUN');
    },
    currentSearchResults() {
      return this.$store.state.search.paginationTotalRows;
    },
    paginationJobsList() {
      return this.$store.state.jobs.pagination;
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    currentSearchHash() {
      return this.$store.getters['search/getCurrentSearchHash'];
    },
    currentSearchQueryParams() {
      return this.$store.state.search.search.getSerialized();
    },
    showAlert() {
      return this.$store.state.errorMessages.length > 0;
    },
    errorMessages() {
      return this.$store.state.errorMessages;
    },
    processingStatus() {
      return this.$store.state.processingStatus;
    },
    user() {
      return this.$store.getters['user/user'];
    },
    headerTitle() {
      return this.$store.getters.headerTitle;
    },
    userFullName() {
      const name = (`${this.user.firstname} ${this.user.lastname}`).trim();
      return name === '' ? this.user.username : name;
    },
    userRole() {
      if (this.user.displayName && this.user.displayName.length) {
        return this.user.displayName;
      }
      return this.user.isStaff ? this.$t('staff') : this.$t('researcher');
    },
    userPicture() {
      const style = {
        backgroundColor: 'black',
      };

      if (this.user.pattern) {
        const gradient = [];

        this.user.pattern.forEach((color, i) => {
          const start = Math.round((100 * i) / this.user.pattern.length);
          const stop = Math.round((100 * (i + 1)) / this.user.pattern.length);
          gradient.push(`${color} ${start}%, ${color} ${stop}%`);
        });

        style.backgroundImage = `linear-gradient(90deg,${gradient.join(',')})`;
      }
      return style;
    },
    connectivityStatus() {
      return this.$store.state.connectivityStatus;
    },
    version() {
      return [window.impressoVersion, window.impressoDataVersion].join('/');
    },
    textReuseEnabled() {
      // @ts-ignore
      return !!window.impressoFeatures?.textReuse?.enabled
    }
  },
  methods: {
    updateLastNotificationDate() {
      this.$store.dispatch('settings/UPDATE_LAST_NOTIFICATION_DATE');
    },
    openSearchQueryExplorer() {
      this.$store.dispatch('searchQueryExplorer/TOGGLE');
    },
    onChangeJobsPage(page = 1) {
      console.info('onChangeJobsPage', page);
      this.$store.dispatch('jobs/LOAD_JOBS', {
        page,
      });
    },
    test() {
      return this.$store.dispatch('jobs/TEST');
    },
    selectLanguage(languageCode) {
      window.app.$i18n.locale = languageCode;
      this.$store.commit('settings/SET_LANGUAGE', {
        language_code: languageCode,
      });
    },
  },
  watch: {
    jobs: {
      handler(jobs) {
        if (jobs.length && this.$refs.ddownJobs) {
          const lastModifiedDate = new Date(jobs.map(d => d.lastModifiedDate).sort().pop());
          if (this.$store.getters['settings/lastNotificationDate'] - lastModifiedDate < 0) {
            console.info('Stored settings.lastNotificationDate is behind a job lastModifiedDate, show job dropdown.');
            this.$refs.ddownJobs.show();
          } else {
            console.info('Stored settings.lastNotificationDate is synced with job lastModifiedDate, nothing to show.');
          }
        }
      },
    },
    currentSearchHash: {
      handler(val) {
        if (val.length) {
          this.countActiveSearchFilters = this.$store.getters['search/getCurrentSearch'].countActiveFilters();
          this.countActiveSearchItems = this.$store.getters['search/getCurrentSearch'].countActiveItems();
        }
      },
      immediate: false,
    },
  },
  components: {
    Icon,
    Toast,
    Pagination,
    SearchQueryExplorer,
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

#TheHeader {
  height: 56px;
}
#app-header {
    .Cookie--blood-orange {
      background: $clr-secondary;
      border-bottom: 2px solid $clr-accent;
      box-shadow: 0 0 5vh 0vw rgba(0,0,0,0.8);
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
      top:0.5em;
      right:0.5em;
      border-radius:10px;
      min-width:20px;
      height:20px;
    }
    .toaster {
      position:absolute;
      bottom:0;
      left:0;
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
            font-size: 1.1em;
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
    .navbar-nav .nav-link {
      padding-top: 0;
      padding-bottom: 0;
      line-height: 56px;
      height: 56px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 100px;
      font-size: .9rem;
    }
    .navbar-dark .navbar-nav .nav-link {
        color: $clr-grey-800;
        &.active {
          color: $clr-white;
        }
    }
    .navbar-dark .navbar-nav .nav-link:focus,
    .navbar-dark .navbar-nav .nav-link:hover {
        color: $clr-white;
        background: transparent;
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
      border-right: 1px solid $clr-grey-400;

      &.show{
        background: $clr-grey-300 !important;
        border-color: $clr-grey-100;
        box-shadow: 1px 0px 0px $clr-grey-400;
      }

      &.show > a{
        color: $clr-white;
      }


    }
    .navbar-dark .b-nav-dropdown .dropdown-menu {
      background: $clr-grey-300 !important;
      padding: .5rem 0;
      border-top-color: $clr-primary;
      margin-top: 0px;

      &.dropdown-menu-right{
        margin-right: -1px;
      }
      .dropdown-item{
        color: $clr-grey-800;
        font-size:0.9em;
        padding: .5rem 1rem;
      }
      .dropdown-item.disabled{
        text-decoration: line-through;
      }

      .dropdown-item.active{
        color: $clr-white;
        background: $clr-grey-400;
      }

      .btn-outline-primary{
        border: 1px solid #caccce;
        color: #caccce;
        &:hover{
          border-color: $clr-white;
          color: $clr-white;
        }
      }
    }

    .dropdown-toggle {
        padding-right: 1.25rem;

        &::after {
            position: absolute;
            top: 50%;
            right: 0.75rem;
            line-height: 2.25rem;
            margin-top: -1rem;
            font-size: .8em;
        }
    }

    // .user-space > a.dropdown-toggle {
    //     padding: 0.25rem 1.5rem 0.125rem 0.5rem;
    //
    // }

    .user-picture {
        background: $clr-primary;
        width: 2em;
        height: 2em;
        border-radius: 2em;
        border: 1px solid $clr-accent-light;
    }

    .user-label {
        margin-left: 2.5em;
    }

    .user-fullname {
        padding-bottom: 0.125rem;
        font-size: 0.8em;
        line-height: 1em;
        font-weight: bold;
        color: white;
    }

    .user-role {
        line-height: 1;
        font-size: 0.8em;
    }
}


@media (min-width: 992px) {
  #app-header .navbar-nav .nav-link{
    max-width: 120px;
    font-size: 1rem;
  }
}
@media (min-width: 1200px) {
  #app-header .navbar-nav .nav-link{
    max-width: 220px;
    font-size: 1rem;
  }
}
</style>

<i18n>
{
  "en": {
    "login": "Login",
    "logout": "Logout",
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
    "label_compare": "Inspect & Compare",
    "label_text_reuse": "Text reuse",
    "label_current_search": "browse results",
    "label_faq": "FAQ",
    "label_terms_of_use": "Terms of Use",
    "staff": "staff",
    "researcher": "researcher",
    "join_slack_channel": "Join us on <b>Slack!</b>",
    "no-jobs-yet": "Here you will find notifications about your collections and your downloads.",
    "current_version": "v <span class='small-caps'>{version}</span>"
  }
}
</i18n>
