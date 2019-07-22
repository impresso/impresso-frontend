<template>
<i-layout id="Search2Page">
    <i-layout-section width="400px" class="border-right">
      <queries />
    </i-layout-section>
    <i-layout-section>
      <b-tabs card content-class="d-none">
        <template slot="tabs">
          <b-nav-item v-bind:to="{ name: 'search-articles' }" active>Articles</b-nav-item>
          <b-nav-item v-bind:to="{ name: 'search-issues' }">Issues</b-nav-item>
          <b-nav-item v-bind:to="{ name: 'search-pages' }">Pages</b-nav-item>
          <b-nav-item v-to="{ name: 'search' }">Senteces</b-nav-item>
          <div class="pr-2 mr-2 border-right"></div>
          <b-nav-item v-bind:to="{ name: 'search' }">Newspaper Titles</b-nav-item>
          <b-nav-item v-bind:to="{ name: 'search' }">Entities</b-nav-item>
          <b-nav-item v-bind:to="{ name: 'search' }">Topics</b-nav-item>
        </template>
      </b-tabs>
      <keep-alive>
        <router-view />
      </keep-alive>
    </i-layout-section>
  </i-layout>
</template>

<script>
  import Queries from './Queries';

  export default {
    components: {
      Queries,
    },
  };
</script>

<style lang="scss" scoped>

</style>
