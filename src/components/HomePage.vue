<template>
<main id="HomePage">
  <div class="search_wrapper">
    <b-container>
      <b-row>
        <b-col md="6" offset-md="3">
          <SearchBar />
        </b-col>
      </b-row>
    </b-container>
  </div>
  <b-container>
    <b-row>
      <b-col>
        <h1>{{$t("welcome.title")}}</h1>
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
};
</script>

<style scoped lang="less">
.search_wrapper {
    /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#d460ff+0,63f9ff+100 */
    background: #d460ff; /* Old browsers */
    background: -moz-linear-gradient(-45deg, #d460ff 0%, #63f9ff 100%); /* FF3.6-15 */
    background: -webkit-linear-gradient(-45deg, #d460ff 0%,#63f9ff 100%); /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(135deg, #d460ff 0%,#63f9ff 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#d460ff', endColorstr='#63f9ff',GradientType=1 ); /* IE6-9 fallback on horizontal gradient */
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
