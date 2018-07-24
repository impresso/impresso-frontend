<template lang="html">
  <b-navbar id="TheHeader" toggleable="md" type="dark" v-bind:variant="navbarVariant">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand :to="{name: 'home'}">
      <img src="./../assets/img/impresso-logo-h-i@2x.png"  />
    </b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <li class="nav-item">
          <router-link v-bind:to="{ name: 'home'}" exact-active-class="active" class="nav-link">{{$t("home")}}</router-link>
        </li>
        <li class="nav-item">
          <router-link v-bind:to="{ name: 'search'}" exact-active-class="active" class="nav-link">{{$t("search")}}</router-link>
        </li>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown v-bind:text="languages[activeLanguageCode].name" right>
          <b-dropdown-item v-for="language in languages"
          v-bind:active="activeLanguageCode === language.code"
          v-bind:key="language.code"
          v-on:click="selectLanguage(language.code)">{{language.name}}</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown v-if="user" right>
          <template slot="button-content">
            <em>{{userFullName}}</em>
          </template>
          <b-dropdown-item v-bind:to="{ name: 'dashboard'}">{{$t("dashboard")}}</b-dropdown-item>
          <b-dropdown-item v-bind:to="{ name: 'collection'}">{{$t("collections")}}</b-dropdown-item>
          <b-dropdown-item v-on:click.prevent="logout">{{$t("logout")}}</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item v-else v-bind:to="{ name: 'login'}">{{$t("login")}}</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
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
    navbarVariant() {
      return this.$store.state.processing_status ? 'warning' : 'dark';
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
#TheHeader {
    .navbar-brand {
        padding: 0;
        img {
            height: 30px;
        }
    }
}
</style>

<i18n>
{
  "en": {
    "login": "Login",
    "logout": "Logout",
    "dashboard": "Dashboard"
  }
}
</i18n>
