<template lang="html">
  <div style="margin-bottom: -1px;">
    <b-progress :value="100" variant="info" animated :height="progressBarHeight"></b-progress>
    <b-navbar id="TheHeader" toggleable="md" type="dark" variant="dark" class="py-0 pr-1">
      <b-navbar-brand :to="{name: 'home'}">
        <img src="./../assets/img/impresso-logo-h-i@2x.png" />
      </b-navbar-brand>
        <b-navbar-nav>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'home'}" exact-active-class="active" class="nav-link small-caps">{{$t("label_home")}}</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'search'}" exact-active-class="active" class="nav-link small-caps">{{$t("label_search")}}</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'newspapers'}" exact-active-class="active" class="nav-link small-caps">{{$t("label_newspapers")}}</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'topics'}" exact-active-class="active" class="nav-link small-caps">{{$t("label_topics")}}</router-link>
          </li>
          <li class="nav-item small-caps text-white ml-2" v-on:click="test()">send test job</li>
        </b-navbar-nav>
        <b-navbar-nav class="nav-title mx-auto">
          <h1 v-show="headerTitle" class="nav-title" v-html="headerTitle"></h1>
        </b-navbar-nav>
        <b-navbar-nav>
        <b-nav-item
          class="p-2 small-caps border-left"
          v-b-tooltip.hover.bottom.html.o100.d250 v-bind:title="$t('join_slack_channel')"
          target="_blank"
          href="https://join.slack.com/t/impresso-community/shared_invite/enQtNTQ5MzEzNTk3MTY5LWM5NDMxOTFiOWM2OTAzY2ZjYmM2MjQ2YzU5OTkwN2Y0NWRmNDRjY2UxMzcyYTVmOWRjN2RiMGM3OWQ2NmZmMjQ"><icon name="slack"/></b-nav-item>
          <b-nav-item-dropdown v-bind:text="languages[activeLanguageCode].code" class="small-caps border-left p-2" right>
            <b-dropdown-item v-for="language in languages"
            v-bind:active="activeLanguageCode === language.code"
            v-bind:key="language.code"
            v-bind:disabled="language.disabled"
            v-on:click="selectLanguage(language.code)">{{language.name}}</b-dropdown-item>
          </b-nav-item-dropdown>
<<<<<<< HEAD
          <b-nav-item-dropdown no-caret right
            v-bind:disabled="runningJobs.length < 1"
            class="small-caps border-left p-2">
=======
          <b-nav-item-dropdown no-caret right class="small-caps border-left p-2">
>>>>>>> 3120e6aa9b3e5e96e8a4fe75bff66e764cbf428d
              <template slot="button-content">
                <div class="dripicons-bell position-relative" style="top:0.25em" />
                <transition name="bounce">
                  <b-badge
                    v-if="runningJobs.length > 0" pill variant="danger" class="border">
                    {{runningJobs.length}}
                  </b-badge>
                </transition>
              </template>
              <div class="jobs">
                <toast v-for="(job, i) in this.runningJobs"
                  v-bind:job="job"
                  v-bind:key="job.id"
                  style="min-width: 400px"
                  />
              </div>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown v-if="user" class="user-space pb-1 pl-1 pr-2 border-left" right>
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
            <b-dropdown-item disabled v-bind:to="{ name: 'dashboard'}">{{$t("dashboard")}}</b-dropdown-item>
            <b-dropdown-item v-bind:to="{ name: 'collections'}">{{$t("collections")}}</b-dropdown-item>
            <b-dropdown-item v-bind:to="{ name: 'logout'}">{{$t("logout")}}</b-dropdown-item>
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
  async mounted() {
    this.$store.state.jobs = await this.$store.dispatch('jobs/LOAD_JOBS');
  },
  computed: {
    runningJobs() {
      return this.$store.state.jobs.data.filter(job => job.status === 'RUN');
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
    async test() {
      await this.$store.dispatch('jobs/TEST');
    },
    selectLanguage(languageCode) {
      window.app.$i18n.locale = languageCode;
      this.$store.commit('settings/SET_LANGUAGE', {
        language_code: languageCode,
      });
    },
  },
  watch: {
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
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

#app-header {
    .progress {
        position: absolute;
        width: 100%;
        z-index: 100;
        top: 0;
        left: 0;
    }
    .badge-pill {
      position: absolute;
      top:0.5em;
      right:0.3em;
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
        color: $clr-bg-secondary;
    }
    .navbar-dark .navbar-nav .nav-link:focus,
    .navbar-dark .navbar-nav .nav-link:hover {
        color: $clr-bg-primary;
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

    .dropdown-toggle {
        padding-right: 1.25rem;

        &::after {
            position: absolute;
            top: 50%;
            right: 0.75rem;
            line-height: 2rem;
            margin-top: -1rem;
        }
    }

    .user-space > a.dropdown-toggle {
        padding: 0.25rem 1.5rem 0.125rem 0.5rem;
        &::after {
            font-size: 0.75em;
        }
    }

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

// extend application styles
.border-tertiary {
    border-color: $clr-tertiary !important;
}
.pt-1px {
    padding-top: 1px;
}
.custom-radio > .custom-control-label::before {
    border: inherit;
    outline: inherit;
}
.tooltip-inner {
    max-width: auto;
    color: $clr-primary;
    text-align: left;
    background-color: $clr-bg-primary;
    border: 1px solid $clr-primary;
    box-shadow: 0.3em 0.3em 0 rgba(17, 17, 17, 0.2);
}
.dropdown-menu {
    padding: 0;
}
.fixed-pagination-footer {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(calc(200px - 50%));
    background: $clr-bg-secondary;
    max-width: calc(100% - 400px);
    .pagination {
        li.page-item > a,
        li.page-item > span.page-link {
            border-color: $clr-secondary;
            padding: 0.15em 0.6em;
        }
    }
}
/* bounce animation */
.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
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
    "label_newspapers": "Newspaper Titles",
    "label_topics": "Topics",
    "join_slack_channel": "Join us on <b>Slack!</b>"
  }
}
</i18n>
