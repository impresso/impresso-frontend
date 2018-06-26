<template lang="html">
  <header id="header" v-bind:class="{loading: showProgress}">
    <router-link :to="{name: 'home'}">
      <img src="./../assets/img/impresso-logo-h-i@2x.png" class="logo br" />
    </router-link>
    <div class="navigation-left" v-show="false">
      <div class="dropdown">
        <button class="dropbtn link">{{$t("explore")}}</button>
        <div class="dropdown-content">
          <a href="#" class="link">Link 1</a>
          <a href="#" class="link">Link 2</a>
          <a href="#" class="link">Link 3</a>
        </div>
      </div>
    </div>
    <div class="navigation-center">
      <div v-html="headerTitle" v-show="headerTitle"></div>
    </div>
    <div class="navigation-right">
      <div v-if="userData" class="dropdown">
        <button class="dropbtn link">
          <img src="http://via.placeholder.com/25&text=RA" alt="">
          <div class="two-lines" >
            <strong>Alba Rorwacher</strong>  Researcher
          </div>
        </button>
        <div class="dropdown-content right">
          <router-link class="link" v-bind:to="{ name: 'dashboard'}">{{$t("dashboard")}}</router-link>
          <router-link class="link" v-bind:to="{ name: 'collection'}">{{$t("collections")}}</router-link>
          <a v-on:click.prevent="logout" href="#" class="link" >{{$t("logout")}}</a>
        </div>
      </div>
      <router-link v-else class="link" v-bind:to="{ name: 'login'}">{{$t("login")}}</router-link>
      <div class="dropdown">
        <button class="dropbtn link capital">{{languages[activeLanguageCode].code}}</button>
        <div class="dropdown-content right">
          <a
            v-for="language in languages"
            v-bind:active="activeLanguageCode === language.code"
            v-bind:key="language.code"
            @click.prevent="selectLanguage(language.code)"
            href="#" class="link">{{language.name}}</a>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  data: () => ({
    languages: {
      de: {
        code: 'de',
        name: 'Deutsch',
      },
      en: {
        code: 'en',
        name: 'English',
      },
      fr: {
        code: 'fr',
        name: 'Français',
      },
      it: {
        code: 'it',
        name: 'Italiano',
      },
      nl: {
        code: 'nl',
        name: 'Nederlands',
      },
    },
  }),
  computed: {
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    showProgress() {
      return this.$store.state.processing_status;
    },
    userData() {
      return this.$store.state.user.userData;
    },
    headerTitle() {
      return this.$store.getters.headerTitle;
    },
  },
  methods: {
    selectLanguage(languageCode) {
      this.$i18n.locale = languageCode;
      this.$store.commit('settings/SET_LANGUAGE', {
        language_code: languageCode,
      });
    },
    logout() {
      this.$store.dispatch('user/LOGOUT').then(() => {
        this.$router.push('/');
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
};
</script>

<style lang="less">
@import "./../assets/less/style.less";

header {
    display: grid;
    height: 53px;
    z-index: 1;
    grid-template-columns: max-content max-content auto max-content;
    grid-template-rows: 100%;
    grid-template-areas: "logo navigation-left navigation-center navigation-right";

    background: @clr-black;
    background: linear-gradient(to top, #f0f0f0 2px, #000 2px, #000 100%);
    border-top: 2px solid @impresso-yellow;
    border-bottom: 1px solid @clr-grey-400;

    transition: background-color 100ms;

    .navigation-left {
        grid-area: navigation-left;
        display: table;
        width: max-content;
        height: 100%;
    }
    .navigation-center {
        grid-area: navigation-center;
        margin-top: 14px;
        overflow: hidden;
        width: 100%;
        text-align: center;
        > div {
            display: inline-block;
            font-size: 1rem;
            background: white;
            padding: 1px 6px;
            .text-serif();
            .title {}
            .subtitle {
                font-weight: bold;
            }
        }
    }
    .navigation-right {
        grid-area: navigation-right;
        text-align: right;
    }

    &.loading {
        border-bottom-color: @clr-yellow;
    }

    .logo {
        grid-area: logo;
        padding: 10px;
        display: inline-block;
        height: 50px;
        padding: 10px 15px 10px 10px;
    }

    .link {
        height: 100%;
        display: inline-block;
        color: @clr-grey-300;
        font-size: 0.75rem;
        outline: none;
        &:hover {
            text-decoration: none;
            color: @clr-white;
        }
    }

    .dropdown {
        overflow: hidden;
        display: unset;
        position: relative;
        &:hover .dropdown-content {
            display: block;
        }
        .dropbtn {
            background: transparent;
            border: 0;
            margin: inherit;
            height: 100%;
            .two-lines {
                position: relative;
                top: -7px;
                left: 3px;
                text-align: left;
                padding-right: 10px;
                line-height: 16px;
                display: inline-table;
                strong {
                    display: block;
                }
            }
        }
        .dropdown-content {
            display: none;
            position: absolute;
            left: 0;
            top: 31px;
            min-width: 160px;
            background-color: black;
            border: 1px solid @clr-grey-500;
            text-align: left;
            z-index: 1;
            &.right {
                left: inherit;
                right: 0;
            }
            a {
                display: block;
                padding: 15px 10px;
            }
            a:hover {}
        }
    }
}
</style>

<i18n>
{
  "en": {
    "explore": "explore",
    "login": "login",
    "logout": "logout",
    "profile": "profile",
    "dashboard": "dashboard"
  },
  "fr": {
    "explore": "découvrir"
  }
}
</i18n>
