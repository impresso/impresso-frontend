<template lang="html">
  <div style="margin-bottom: -1px;">
    <b-progress :value="100" variant="info" animated :height="progressBarHeight"></b-progress>
    <b-navbar id="TheHeader" toggleable="md" type="dark" variant="dark" class="py-0 pr-1 border-bottom border-primary">
      <b-navbar-brand :to="{name: 'home'}">
        <img src="./../assets/img/impresso-logo-h-i@2x.png" />
      </b-navbar-brand>
        <b-navbar-nav>
          <!-- <li class="nav-item">
            <router-link v-bind:to="{ name: 'home'}" exact-active-class="active" class="nav-link small-caps">{{$t("label_home")}}</router-link>
          </li> -->
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'search'}" active-class="active" class="nav-link">{{$t("label_search")}}</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'newspapers'}" active-class="active" class="nav-link">{{$t("label_newspapers")}}</router-link>
          </li>
          <!-- <li class="nav-item">
            <router-link v-bind:to="{ name: 'entities'}" exact-active-class="active" class="nav-link">{{$t("label_entities")}}</router-link>
          </li> -->
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'topics'}" active-class="active" class="nav-link">{{$t("label_topics")}}</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'faq'}" active-class="active" class="nav-link">{{$t("label_faq")}}</router-link>
          </li>

        </b-navbar-nav>
        <b-navbar-nav class="nav-title mx-auto">
          <h1 v-show="headerTitle" class="nav-title" v-html="headerTitle"></h1>
        </b-navbar-nav>
        <b-navbar-nav>
          <b-nav-item-dropdown right no-caret
            v-if="user"
            ref="ddownJobs" class="p-2">
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
          <b-nav-item-dropdown v-bind:text="languages[activeLanguageCode].code" class="p-2" right>
            <b-dropdown-item v-for="language in languages"
            v-bind:active="activeLanguageCode === language.code"
            v-bind:key="language.code"
            v-bind:disabled="language.disabled"
            v-on:click="selectLanguage(language.code)">
              <span>{{language.name}}</span>
            </b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown v-if="user" class="user-space pb-1 pl-1 pr-2 " right>
            <template slot="button-content">
              <div class='d-inline-block'>
                <div class='user-picture mt-1 float-left position-relative' :style='userPicture'>
                </div>
                <div class='user-label pt-2'>
                  <div class='user-fullname'>{{userFullName}}</div>
                  <div class='user-role small-caps'>{{userRole}}</div>
                </div>
              </div>
            </template>
            <!-- <b-dropdown-item disabled v-bind:to="{ name: 'dashboard'}">{{$t("dashboard")}}</b-dropdown-item> -->
            <b-dropdown-item v-bind:to="{ name: 'collections'}">{{$t("collections")}}</b-dropdown-item>
            <b-dropdown-item v-bind:to="{ name: 'logout'}">{{$t("logout")}}</b-dropdown-item>
            <b-dropdown-item v-if="user && user.isStaff" v-on:click="test()">send test job</b-dropdown-item>
            <b-dropdown-item
              target="_blank"
              href="https://impresso-community.slack.com/join/shared_invite/enQtNTg5MzY2NDg2NTAyLWJkNWI5ZTU3ZGI1ZGE1YTg2YmViOWQ1OWMyYTRkMDY1OGM0MWUwNGQzYjYxYTA4ZGU0YzBjMGU4ZmQxNmY5Njc">
              <icon name="slack"/>
              <span v-html="$t('join_slack_channel')"></span>
            </b-dropdown-item>

          </b-nav-item-dropdown>
          <b-nav-item class="p-2 small-caps border-left" v-else v-bind:to="{ name: 'login'}">{{$t("login")}}</b-nav-item>
        </b-navbar-nav>
    </b-navbar>
    <b-alert :show="showAlert" dismissible v-html="" variant="warning" class="m-0 px-3">{{ alertMessage }}</b-alert>

  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/slack';
import Toast from './modules/Toast';
import Pagination from './modules/Pagination';

export default {
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
  }),
  mounted() {
    if (this.user) {
      this.$store.dispatch('jobs/LOAD_JOBS').then((res) => {
        console.info('Jobs loaded.', res);
      });
    }
  },
  computed: {
    jobs() {
      return this.$store.state.jobs.items;
    },
    runningJobs() {
      return this.$store.state.jobs.items.filter(d => d.status === 'RUN');
    },
    paginationJobsList() {
      return this.$store.state.jobs.pagination;
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    showAlert() {
      return this.$store.state.error_message !== '';
    },
    alertMessage() {
      return this.$store.state.error_message;
    },
    progressBarHeight() {
      return this.$store.state.processing_status ? '2px' : '0';
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
  },
  methods: {
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
    runningJobs: {
      handler(val) {
        if (val.length > 0 && this.$refs.ddownJobs) {
          this.$refs.ddownJobs.show();
        }
      },
    },
    $route: {
      handler(val, oldVal) {
        if (val.meta.realm !== oldVal.meta.realm) {
          this.$store.commit('SET_HEADER_TITLE', {});
        }
      },
    },
  },
  components: {
    Icon,
    Toast,
    Pagination,
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

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
        margin-bottom: 1px;
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
</style>

<i18n>
{
  "en": {
    "login": "Login",
    "logout": "Logout",
    "dashboard": "Dashboard",
    "collections": "Collections",
    "label_home": "Home",
    "label_search": "Search",
    "label_newspapers": "Newspapers",
    "label_entities": "Entities",
    "label_topics": "Topics",
    "staff": "staff",
    "researcher": "researcher",
    "join_slack_channel": "Join us on <b>Slack!</b>",
    "no-jobs-yet": "Here you will find notifications about your collections and your downloads."
  }
}
</i18n>
