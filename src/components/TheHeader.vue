<template lang="html">
  <header id="header" class="py-2" v-bind:class="{loading: showProgress}">
    <b-container fluid>
      <b-row>
        <b-col>
          <router-link :to="{name: 'home'}" class="logo">impresso</router-link>
        </b-col>
        <b-col class="text-right">
          <!-- {{$t("language")}} -->
          <b-button v-bind:to="{name: 'login'}" variant="link">Login</b-button>
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
  },
  methods: {
    selectLanguage(languageCode) {
      this.$i18n.locale = languageCode;
      this.$store.commit('settings/SET_LANGUAGE', {
        language_code: languageCode,
      });
    },
  },
};
</script>

<style lang="less">
header {
    background: #345;
    color: white;
    transition: background-color 100ms;
    .logo {
        color: white;
        display: block;
        padding-top: 0.25rem; //inherterd from the language dropdown
    }

    .btn {
        color: white;
        &:hover {
            color: #ccc;
        }
    }

    &.loading {
        background: #f50;
    }
}
</style>
