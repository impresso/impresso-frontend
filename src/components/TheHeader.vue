<template lang="html">
  <header id="header" class="py-2">
    <div class="container">
      <b-row>
        <b-col>
          <router-link :to="{name: 'home'}" class="logo">impresso</router-link>
        </b-col>
        <b-col class="text-right">
          {{$t("header.language")}}
          <b-dropdown right size="sm" variant="link" :text="languages[activeLanguageCode].name">
            <b-dropdown-item
              v-for="language in languages"
              v-bind:active="activeLanguageCode === language.code"
              v-bind:key="language.code"
              @click.prevent="selectLanguage(language.code)"
              href="#">{{language.name}}</b-dropdown-item>
          </b-dropdown>
        </b-col>
      </b-row>
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

<style scoped lang="less">
header {
    background: #234;
    color: white;
    .logo {
        color: white;
        display: block;
        padding-top: 0.25rem; //inherterd from the language dropdown
    }

}
</style>
