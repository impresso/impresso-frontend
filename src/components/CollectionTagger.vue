<template lang="html">
  <div class="collection-tagger">
    <a v-on:click.prevent="toggle" href="#">toggle</a>
    <div v-show="show">
      <select v-model="collectionsSortOrder">
        <option value="name">A-Z</option>
        <option value="-name">Z-A</option>
        <option value="created">Oldest</option>
        <option value="-created">Newest</option>
        <option value="-modified">Last Edit</option>
      </select>
      <ul>
        <li v-for="collection in collections" class="form-check">
          <input
          class="form-check-input"
          type="checkbox"
          v-bind:checked="isActive(collection)"
          v-on:click="toggleActive(collection)"
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
  props: {
    item: Object,
  },
  computed: {
    collections: {
      get() {
        return this.$store.getters['collections/collections'];
      },
    },
    collectionsSortOrder: {
      get() {
        return this.$store.getters['collections/collectionsSortOrder'];
      },
      set(collectionsSortOrder) {
        this.$store.commit('collections/SET_COLLECTIONS_SORT_ORDER', {
          collectionsSortOrder,
        });
      },
    },
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

      console.log(collection, this.item);
    },
    toggle() {
      this.show = !this.show;
    },
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
