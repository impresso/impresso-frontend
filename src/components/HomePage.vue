<template>
<main id="HomePage">
  <SearchBar class="searchbar" v-on:add="redirect" />
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
      }, () => {
        this.$store.dispatch('search/SEARCH');
      });
    },
  },
};
</script>

<style scoped lang="less">
#HomePage {
    background: url("../assets/img/matterhorn_custom.jpg");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    height: 100%;
    display: grid;
    grid-template-columns: auto minmax(250px 400px) auto;
    grid-template-rows: auto min-content auto;
    grid-template-areas: ' . . .' '. searchbar .' ' . . .';
    .searchbar {
        grid-area: searchbar;
        box-shadow: 0 0px 60px rgba(0,0,0,.8);
        background: rgba(0,0,0,.4);
    }
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
