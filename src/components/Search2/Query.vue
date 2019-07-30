<template>
  <i-layout-section>
    <div class="p-2 border-bottom" slot="header">
      <autocomplete v-on:submit="onSuggestion" />
    </div>
    <h1>yo</h1>
    <div class="p-2 border-top">
      <div class="mb-2">
        <b-input-group prepend="Title">
          <b-form-input v-model="query.title"></b-form-input>
        </b-input-group>
      </div>
      <div>
        <b-button variant="danger" v-on:click="onDelete">Delete</b-button>
        <b-button variant="outline-primary" class="float-right">Save</b-button>
      </div>
    </div>
  </i-layout-section>
</template>

<script>
  import Autocomplete from '@/components/Autocomplete';

  export default {
    computed: {
      query() {
        return this.$store.getters['queries/QUERY'];
      },
    },
    methods: {
      onSuggestion(a, b, c) {
        console.log('onSuggestion', a, b, c);
      },
      onDelete() {
        this.$store.dispatch('queries/DELETE', this.query);
      },
    },
    components: {
      Autocomplete,
    },
  };
</script>

<style lang="scss" scoped>

</style>
