<template lang="html">
  <header id="header" v-bind:class="{loading: showProgress}">
    <router-link :to="{name: 'home'}">
      <img src="./../assets/img/impresso-logo-h-i@2x.png" class="logo br" />
    </router-link>
    <div class="navigation-left">

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
      <h1 class="text-serif">
        La Gazette de Lausanne / <strong>Lundi 16 Mai 2018</strong>
      </h1>
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
    height: 53px;
    z-index: 1;
    grid-template-columns: max-content max-content auto max-content;
    grid-template-rows: 100%;
    grid-template-areas: "logo navigation-left navigation-center navigation-right";

    background: @clr-black;
    background: linear-gradient(to top, #f0f0f0 2px, #000 2px, #000 100%);
    border-top: 2px solid @impresso-yellow;
    //border-bottom: 2px solid @clr-grey-100;
    border-bottom: 1px solid @clr-grey-400;
    //box-shadow: 0 1px 0 0 @clr-grey-400;
    //position: fixed;
    //width: 100%;

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
        h1 {
            display: inline;
            font-size: 1rem;
            background: white;
            padding: 1px 6px;
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
        // margin-right: 10px;
        // border-left: 1px solid @clr-grey-600;
        height: 100%;
        display: inline-block;
        // padding: 15px;
        color: @clr-grey-300;
        font-size: 0.75rem;
        outline: none;
        &.router-link-exact-active {
            //background-color: @impresso-yellow;
            //color: black;
        }
        &:hover {
            text-decoration: none;
            color: @clr-white;
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
