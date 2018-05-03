<template lang="html">
  <header id="header" v-bind:class="{loading: showProgress}">
    <b-container fluid>
      <b-row class="bb">
        <b-col cols="9">
          <div class="blocks">
            <div class="block br">
              <router-link :to="{name: 'home'}">
                <img src="./../assets/img/impresso-logo.v4-1.jpg" class="logo" />
              </router-link>
            </div>
            <div class="block">
              <router-link :to="{name: 'home'}" class="link">Home</router-link>
              <router-link :to="{name: 'dashboard'}" class="link">Newspapers</router-link>
              <router-link :to="{name: 'named_entities'}" class="link">Named Entities</router-link>
              <router-link :to="{name: 'about'}" class="link">About</router-link>
            </div>
          </div>
        </b-col>
        <b-col class="text-right">
          <!-- {{$t("language")}} -->
          <b-button v-show="!userData" v-bind:to="{name: 'login'}" variant="link">Login</b-button>

          <b-dropdown v-show="userData" right variant="link" :text="`${userData.username}`">
            <b-dropdown-item v-bind:to="{name: 'dashboard'}">Dashboard</b-dropdown-item>
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
        </b-col>
      </b-row>
    </b-container>
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

<style lang="less">
@import "./../assets/less/style.less";

header {
    background: @clr-white;
    transition: background-color 100ms;
    &.loading {
        background: @clr-yellow;
    }

    .br,
    .bb,
    .bt,
    .bl{
      border-color: @clr-black;
      border-style: solid;
      border-width: 0;
    }

    .br{ border-right-width: 1px; }
    .bb{ border-bottom-width: 1px; }
    .bl{ border-left-width: 1px; }
    .bt{ border-top-width: 1px; }

    .logo {
        height: 100%;
        padding-right: 20px;
    }

    .link{
      margin-right: 10px;
      padding: 5px 7px;
      color:black;
      &.router-link-exact-active{
        font-weight: bold;
      }
    }

    .blocks{
      width:100%;
      height:32px;
      margin-top: 5px;
      margin-bottom: 5px;
      .block{
        display: inline-block;
        height: 100%;
        margin-right: 20px;
        a.link{

        }
      }
    }
}
</style>
