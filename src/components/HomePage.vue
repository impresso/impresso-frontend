<template>
<main id="HomePage" class="py-3">
  <b-container>
      <vue-simple-markdown :source="markdown" />
  </b-container>
</main>
</template>

<script>
import Vue from 'vue';
import VueSimpleMarkdown from 'vue-simple-markdown';
import axios from 'axios';

require('github-markdown-css/github-markdown.css');

Vue.use(VueSimpleMarkdown);

export default {
  name: 'HomePage',
  data: () => ({
    markdown: '',
    resource: process.env.GITHUB_WIKI_HOME,
  }),
  mounted() {
    axios.get(this.resource).then((res) => {
      this.markdown = res.data;
      console.log(res.data);
    });
  },
  methods: {
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
