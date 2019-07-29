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
    <query v-model="query" />
  </i-layout-section>
</template>

<script>
  import Query from './Query';

  export default {
    computed: {
      queries() {
        return this.$store.state.queries.queries;
      },
      query: {
        get() {
          return this.$store.state.queries.query;
        },
        set(query) {
          this.$store.commit('queries/select', query);
        },
      },
    },
    methods: {
      selectQuery(query) {
        this.query = query;
      },
      addQuery() {
        this.$store.commit('queries/new');
      },
    },
    components: {
      Query,
    },
  };
</script>

<style lang="scss" scoped>

</style>
