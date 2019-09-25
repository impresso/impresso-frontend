<template>
  <i-layout id="Search2Page">
    <i-layout-section width="400px" class="border-right" id="search-sidebar">
      <transition name="sidebar-slide-left">
        <pre v-if="detail">{{detail}}</pre>
      </transition>
      <transition name="sidebar-slide-right">
        <queries v-if="!detail" />
      </transition>
    </i-layout-section>
    <i-layout-section>
      <b-tabs card content-class="d-none" slot="header">
        <template v-slot:tabs-end>
          <li class="nav-item">
            <router-link class="nav-link" v-bind:to="{ name: 'search-articles' }" exact-active-class="active">Articles</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" v-bind:to="{ name: 'search-issues' }" exact-active-class="active">Issues</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'search-pages' }" exact-active-class="active" class="nav-link">Pages</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'search-sentences' }" exact-active-class="active" class="nav-link">Senteces</router-link>
          </li>
          <div class="pr-2 mr-2 border-right"></div>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'search-images' }" exact-active-class="active" class="nav-link">Images</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'search-titles' }" exact-active-class="active" class="nav-link">Newspaper Titles</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'search-entities' }" exact-active-class="active" class="nav-link">Entities</router-link>
          </li>
          <li class="nav-item">
            <router-link v-bind:to="{ name: 'search-topics' }" exact-active-class="active" class="nav-link">Topics</router-link>
          </li>
        </template>
      </b-tabs>
      <router-view ref="searchComponent" />
    </i-layout-section>
  </i-layout>
</template>

<script>
  import Queries from './Queries';

  export default {
    data: () => ({
      results: {
        articles: {
          total: 100,
        },
        issues: {
          total: 0,
        },
      },
      detail: false,
    }),
    components: {
      Queries,
    },
    methods: {
      search(payload) {
        this.$refs.searchComponent.search(payload);
      },
      init() {
      },
    },
    created() {
      this.init();
    },
  };
</script>

<style lang="scss" scoped>
#search-sidebar{
  overflow:hidden;
  position: relative;
}
.sidebar-slide-left-enter-active,
.sidebar-slide-left-leave-active,
.sidebar-slide-right-enter-active,
.sidebar-slide-right-leave-active {
  transition: transform 200ms;
  position: absolute;
  top:0;
  width: 400px;
  z-index: -1;
}
.sidebar-slide-left-enter, .sidebar-slide-left-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateX(400px);
}

.sidebar-slide-right-enter, .sidebar-slide-right-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateX(-400px);
}
</style>
