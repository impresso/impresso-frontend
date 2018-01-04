<template lang="html">
  <header id="header" class="py-2" v-bind:class="{loading: showProgress}">
    <div class="container">
      <b-row>
        <b-col>
          <router-link :to="{name: 'home'}" class="logo">impresso</router-link>
        </b-col>
        <b-col class="text-right">
          {{$t("language")}}
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
    showProgress() {
      return 1;
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
@bg_color: #234;
@fg_color: #678;
header {
    background: @bg_color;
    color: white;
    position: relative;
    overflow: hidden;
    .logo {
        color: white;
        display: block;
        padding-top: 0.25rem; //inherterd from the language dropdown
    }

    &.loading {
        background: @bg_color;
        background: linear-gradient(45deg, @bg_color, @fg_color, @bg_color);
        animation: progress 2s linear infinite;
    }
}

@-webkit-keyframes progress {
    0% {
        background-position: -100vw 0;
    }
    100% {
        background-position: 0 0;
    }
}
</style>
