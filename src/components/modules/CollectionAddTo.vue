<template lang="html">
  <b-dropdown
    size="sm" variant="outline-secondary"
    v-on:show="fetch"
    v-bind:text="text">
    <div v-if="!isLoggedIn()" class="p-2 bg-light">
      <b-button size="sm" class="w-100" variant="outline-primary" v-bind:to="{ name: 'login'}">
        {{$t("login")}}
      </b-button>
    </div>
    <collection-add-to-list v-else :item="item" :items="items" />
  </b-dropdown>
</template>

<script>
import CollectionAddToList from './CollectionAddToList';

export default {
  data: () => ({
    show: false,
  }),
  props: {
    text: String,
    item: Object,
    items: Array,
  },
  components: {
    CollectionAddToList,
  },
  methods: {
    fetch() {
      if (this.isLoggedIn()) {
        return this.$store.dispatch('collections/LOAD_COLLECTIONS');
      }
      return {};
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
  },
};
</script>
