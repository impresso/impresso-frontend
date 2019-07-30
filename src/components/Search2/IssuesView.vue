<template>
  <div>
    <h1>Search2/Issues</h1>
    <pre>{{query}}</pre>
  </div>
</template>

<script>
  export default {
    computed: {
      query() {
        return this.$store.getters['queries/QUERY'];
      },
    },
    methods: {
      search(payload) {
        console.log('issues/search', payload);
      },
    },
  };
</script>

<style lang="scss" scoped>

</style>
