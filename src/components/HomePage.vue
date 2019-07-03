<template>
<main id="HomePage">
  <home-page-splash />
  <home-page-messages />
  <home-page-recipes v-show="false" />
  <home-page-faq />
  <home-page-footer />
</main>
</template>

<script>
import HomePageSplash from './HomePageSplash';
import HomePageMessages from './HomePageMessages';
import HomePageFaq from './HomePageFaq';
import HomePageRecipes from './HomePageRecipes';
import HomePageFooter from './HomePageFooter';

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

<i18n>
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
