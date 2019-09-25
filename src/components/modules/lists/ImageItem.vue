<template lang="html">
  <div class="image-item">
    <b-img fluid-grow class="image" v-bind:src="src" />
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
    },
    showPages: {
      type: Boolean,
    },
  },
  computed: {
    pages() {
      return this.$tc('pp', this.item.nbPages, { pages: this.item.pages.map(d => d.num).join(',') });
    },
    src() {
      return this.item.regions[0].iiifFragment;
    },
  },
};
</script>

<style lang="css">
</style>
