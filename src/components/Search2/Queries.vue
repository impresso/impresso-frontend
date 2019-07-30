<template>
  <i-layout-section>
    <b-tabs card slot="header" content-class="d-none">
      <template slot="tabs">
        <b-nav-item
          href="#"
          v-on:click="addQuery">+</b-nav-item>
        <b-nav-item
          v-for="(q, i) in queries"
          v-bind:key="i"
          href="#"
          v-on:click="selectQuery(q)"
          v-bind:active="q.uuid === query.uuid">{{q.title}}</b-nav-item>
      </template>
    </b-tabs>
    <query />
  </i-layout-section>
</template>

<script>
  import Query from './Query';

  export default {
    computed: {
      queries() {
        return this.$store.getters['queries/QUERIES'];
      },
      query: {
        get() {
          return this.$store.getters['queries/QUERY'];
        },
        set(query) {
          this.$store.commit('queries/SELECT', query);
        },
      },
    },
    methods: {
      selectQuery(query) {
        this.query = query;
      },
      addQuery() {
        this.$store.commit('queries/NEW');
      },
    },
    components: {
      Query,
    },
  };
</script>

<style lang="scss" scoped>

</style>
