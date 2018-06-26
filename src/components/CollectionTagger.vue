<template lang="html">
  <div v-if="isLoggedIn()" class="collection-tagger">
    <a v-on:click.prevent="toggle" href="#">Save</a>
    <div class="overlay" v-show="show">
      <div class="body">
        <a v-on:click.prevent="toggle" href="#">Close</a>
        <hr>
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
            v-bind:id="collection.uid">
            <label class="form-check-label" v-bind:for="collection.uid">
              {{collection.name}}
            </label>
          </li>
        </ul>
        <pre>
        {{item}}
        </pre>
      </div>
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
      return this.item.collections.find(collection => needle.uid === collection.uid);
    },
    toggleActive(collection) {
      const idx = this.item.collections.findIndex(c => (c.uid === collection.uid));

      if (idx >= 0) {
        this.item.collections.splice(idx, 1);
        this.$store.dispatch('collections/REMOVE_COLLECTION_ITEM', {
          collection,
          item: this.item,
        });
      } else {
        this.item.collections.push(collection);
        this.$store.dispatch('collections/ADD_COLLECTION_ITEM', {
          collection,
          item: this.item,
        });
      }
    },
    toggle() {
      this.show = !this.show;
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
  },
};
</script>

<style scoped lang="less">
.collection-tagger {
    display: inline-block;
    .overlay {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.4);
        z-index: 10001;
        .body {
            width: 50%;
            left: 25%;
            position: absolute;
            height: 50%;
            top: 25%;
            overflow-y: auto;
            background: white;
        }
    }
}
</style>
