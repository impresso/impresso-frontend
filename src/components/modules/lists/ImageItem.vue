<template lang="html">
  <div class="image-item w-100">
    <b-img-lazy :height="height" class="image" flex-grow v-bind:src="src" />
    <figcaption class="small py-2" v-if="item.title.length">{{ item.title }}</figcaption>
  </div>
</template>

<script>
export default {
  props: {
    height: {
      type: Number,
      default: 100,
    },
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
.image-item figcaption {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 300px;
}
</style>
