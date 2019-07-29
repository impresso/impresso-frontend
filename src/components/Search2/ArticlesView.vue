<template>
  <div>
    <h1>Search2/Articles</h1>
    <pre>{{query}}</pre>
  </div>
</template>

<script>
  export default {
    computed: {
      query() {
        return this.$store.state.queries.query;
      },
    },
    methods: {
      search(payload) {
        console.log('articles/search', payload);
      },
    },
  };
</script>

<style lang="scss" scoped>

</style>
