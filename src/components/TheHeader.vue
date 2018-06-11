<template lang="html">
  <header v-bind:class="{loading: showProgress}">
      <router-link :to="{name: 'home'}" class="logo">
        <img src="./../assets/img/impresso-logo.v4-1.jpg" />
      </router-link>
    <div class="navigation-left">
      <router-link :to="{name: 'home'}">Home</router-link>
      <a href="https://impresso-project.ch/" target="_blank">About</a>
    </div>
    <div class="navigation-right">
      <b-button v-show="!userData" v-bind:to="{name: 'login'}" variant="link">Login</b-button>

      <b-dropdown v-show="userData" right variant="link" :text="`${userData.username}`">
        <b-dropdown-item v-bind:to="{name: 'dashboard'}">Dashboard</b-dropdown-item>
        <b-dropdown-item v-bind:to="{name: 'collection', params: {collection_uid: 'all'}}">Collections</b-dropdown-item>
        <b-dropdown-item v-on:click.prevent="logout">Logout</b-dropdown-item>
      </b-dropdown>

      <b-dropdown right variant="link" :text="languages[activeLanguageCode].name">
        <b-dropdown-item
          v-for="language in languages"
          v-bind:active="activeLanguageCode === language.code"
          v-bind:key="language.code"
          @click.prevent="selectLanguage(language.code)"
          href="#">{{language.name}}</b-dropdown-item>
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
    userData() {
      return this.$store.state.user.userData;
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
};
</script>

<style scoped lang="less">
@import "./../assets/less/style.less";

header {
    display: grid;
    grid-template-columns: max-content auto 300px;
    grid-template-rows: 100%;
    height: 100%;
    grid-template-areas: "logo navigation-left navigation-right";
    background: @clr-black;
    transition: background-color 100ms;
    &.loading {
        background: @clr-yellow;
    }

    .logo {
        grid-area: logo;
        padding: 10px;
        img {
            width: auto;
            height: 100%;
        }

    }

    .navigation-left {
        grid-area: navigation-left;
        display: table;
        width: max-content;
        height: 100%;
        a{
          display: table-cell;
          vertical-align: middle;
          padding: 0 20px;
          color:@clr-white;
          &.router-link-exact-active {
              font-weight: bold;
          }
        }
    }

    .navigation-right {
        grid-area: navigation-right;
        text-align: right;
    }

}
</style>
