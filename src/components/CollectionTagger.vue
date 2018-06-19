<template lang="html">
  <div class="collection-tagger">
    <a v-on:click.prevent="toggle" href="#">toggle</a>
    <div v-show="show">
      <ul>
        <li v-for="collection in collections" class="form-check">
          <input
          class="form-check-input"
          type="checkbox"
          v-bind:checked="isActive(collection.uid)"
          v-on:click="toggleActive(collection.uid)"
           id="defaultCheck1">
          <label class="form-check-label" for="defaultCheck1">
            {{collection.name}}
          </label>
        </li>
      </ul>
      {{item}}
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    show: false,
  }),
  model: {
    prop: 'item',
  },
  methods: {
    isActive(needle) {
      return this.item.collections.find(collection => needle === collection);
    },
    toggleActive(collection) {
      const idx = this.item.collections.indexOf(collection);

      if (idx >= 0) {
        this.item.collections.splice(idx, 1);
      } else {
        this.item.collections.push(collection);
      }

      this.$emit('input', this.item);
    },
    toggle() {
      this.show = !this.show;
    },
  },
  props: {
    item: Object,
    collections: Array,
  },
};
</script>

<style scoped lang="less">
.collection-tagger {
    width: 300px;
    max-width: 100%;
    background: #ccc;
    border-radius: 3px;
    padding: 5px 10px;
}
</style>
