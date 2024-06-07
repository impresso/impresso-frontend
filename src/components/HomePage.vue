<template>
<main id="HomePage">
  <home-page-splash />
  <home-page-messages />
  <home-page-recipes />
  <home-page-faq />
  <home-page-footer />
</main>
</template>

<script>
import HomePageSplash from './HomePageSplash.vue';
import HomePageMessages from './HomePageMessages.vue';
import HomePageFaq from './HomePageFaq.vue';
import HomePageRecipes from './HomePageRecipes.vue';
import HomePageFooter from './HomePageFooter.vue';

/** @deprecated See HomePage2020 */
export default {
  name: 'HomePage',
  data: () => ({
  }),
  methods: {
  },
  components: {
    HomePageSplash,
    HomePageMessages,
    HomePageFaq,
    HomePageRecipes,
    HomePageFooter,
  },
};
</script>

<style lang="scss">
</style>

<i18n lang="json">
{
  "en": {
    "welcome": {
      "title": "Welcome",
      "body": "The language is English. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis auteirure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  },
  "fr": {
    "welcome": {
      "title": "Bonjour"
    }
  },
  "nl": {
    "welcome": {
      "title": "Welkom",
      "body": "De taal is Nederlands. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis auteirure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  }
}
</i18n>
