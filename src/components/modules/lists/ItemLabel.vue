<template lang="html">
  <div class="d-inline" v-html="label" />
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  computed: {
    label() {
      let l = '';
      switch (this.type) {
        case 'location':
        case 'person':
        case 'newspaper':
          l = this.item.name;
          break;
        case 'topic':
          l = this.item.htmlExcerpt;
          break;
        default:
          l = this.$t(`buckets.${this.type}.${this.item.uid}`);
          break;
      }
      return l;
    },
  },
};
</script>

<style lang="css">
</style>
