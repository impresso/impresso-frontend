<template lang="html">
  <header id="TheHeader" v-bind:class="{loading: showProgress}">
    <div class="header-logo">
      <router-link :to="{name: 'home'}">
        <img src="./../assets/img/impresso-logo-h-i@2x.png"  />
      </router-link>
    </div>
    <div class="header-left">
      <router-link v-bind:to="{ name: 'home'}">{{$t("home")}}</router-link> >
      <router-link v-bind:to="{ name: 'search'}">{{$t("search")}}</router-link>
    </div>
    <div class="header-center">
      <div v-html="headerTitle" v-show="headerTitle"></div>
    </div>
    <div class="header-right">
      <b-dropdown v-if="user" right no-caret>
        <template slot="button-content">
          <img src="http://via.placeholder.com/25&text=RA" alt="">
          <div>
            <strong>{{userFullName}}</strong><br>{{user.group}}
          </div>
        </template>
        <b-dropdown-item v-bind:to="{ name: 'dashboard'}">{{$t("dashboard")}}</b-dropdown-item>
        <b-dropdown-item v-bind:to="{ name: 'collection'}">{{$t("collections")}}</b-dropdown-item>
        <b-dropdown-item v-on:click.prevent="logout">{{$t("logout")}}</b-dropdown-item>
      </b-dropdown>
      <b-link v-else v-bind:to="{ name: 'login'}">{{$t("login")}}</b-link >
      <b-dropdown v-bind:text="languages[activeLanguageCode].name" right>
        <b-dropdown-item v-for="language in languages"
        v-bind:active="activeLanguageCode === language.code"
        v-bind:key="language.code"
        v-on:click="selectLanguage(language.code)">{{language.name}}</b-dropdown-item>
      </b-dropdown>
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
    user() {
      return this.$store.getters['user/user'];
    },
    headerTitle() {
      return this.$store.getters.headerTitle;
    },
    userFullName() {
      const name = (`${this.user.nameFirst} ${this.user.nameLast}`).trim();

      if (name !== '') {
        return name;
      }

      return 'John Doe';
    },
  },
  methods: {
    selectLanguage(languageCode) {
      window.app.$i18n.locale = languageCode;
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

#TheHeader {
    display: grid;
    height: 50px;
    z-index: 100;
    grid-template-columns: 180px max-content auto max-content;
    grid-template-rows: auto;
    grid-template-areas: "header-logo header-left header-center header-right";

    background: @clr-black;
    border-top: 2px solid @impresso-yellow;
    transition: background-color 100ms;

    .header-logo {
        grid-area: header-logo;
        padding: 10px;
        display: inline-block;
        height: 50px;
        padding: 10px 15px 10px 10px;
        img{
          width: 100%;
        }
    }

    .header-left {
        grid-area: header-left;
        height: 100%;
    }
    .header-center {
        grid-area: header-center;
        overflow: hidden;
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
    .header-right {
        grid-area: header-right;
        text-align: right;
    }

    &.loading {
        background: @clr-yellow;
    }
}
</style>

<i18n>
{
  "en": {
    "login": "login",
    "logout": "logout",
    "dashboard": "dashboard"
  }
}
</i18n>
