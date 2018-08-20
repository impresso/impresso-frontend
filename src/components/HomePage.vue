<template>
<main id="HomePage">
  <div class="search_wrapper">
    <b-container>
      <b-row>
        <b-col md="6" offset-md="3">
          <SearchBar v-on:search="redirect" />
        </b-col>
      </b-row>
    </b-container>
  </div>
  <b-container>
    <b-row>
      <b-col>
        <h1 class="text-serif font-weight-bold">{{$t("welcome.title")}}</h1>
        <p>{{$t("welcome.body")}}</p>
      </b-col>
    </b-row>
  </b-container>
</main>
</template>

<script>
import SearchBar from './SearchInputQueryWrapper';

export default {
  name: 'HelloWorld',
  components: {
    SearchBar,
  },
  methods: {
    redirect() {
      this.$router.push({
        name: 'search',
      });
    },
  },
};
</script>

<style scoped lang="less">
.search_wrapper {
    background: #d460ff;
    padding: 70px 0;
    margin-bottom: 50px;
}
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
