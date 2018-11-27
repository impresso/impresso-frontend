<template lang="html">
  <div class="collection-add-to">
    <div class="header bg-light p-2 border-bottom">
      <label>Add to collection</label><br>
      <input type="text" name="" value="" class="w-100 p-1" v-bind:placeholder="$t('placeholder')" />
    </div>
    <div class="inputList">
      <ul>
        <li class="form-check">
          <input class="form-check-input" type="checkbox" id="collection.uid" />
          <span class="checkmark dripicons-checkmark" />
          <label class="form-check-label py-3" for="collection.uid">
            collection.name 2
            <div class="description small text-muted">This is another description.</div>
          </label>
        </li>
        <li class="form-check">
          <input class="form-check-input" type="checkbox" id="collection.2" />
          <span class="checkmark dripicons-checkmark" />
          <label class="form-check-label py-3" for="collection.2">
            This is just a very very long title. Some people like to put a whole sentence.
          </label>
        </li>
        <li class="form-check">
          <input class="form-check-input" type="checkbox" id="collection.3" />
          <span class="checkmark dripicons-checkmark" />
          <label class="form-check-label py-3" for="collection.3">
            collection.name 3
            <div class="description small text-muted">This is just a very very long description.
              Some people like to put a whole sentence. Or two. Some people like to put a whole sentence. Or two.
</div>
          </label>
        </li>
        <li class="form-check">
          <input class="form-check-input" type="checkbox" id="collection.4" />
          <span class="checkmark dripicons-checkmark" />
          <label class="form-check-label py-3" for="collection.4">
            This one has no description.
          </label>
        </li>
      </ul>
      <!-- <div class="overlay" v-show="show">
        <div class="panel">
          <div class="header">
            <router-link class="btn btn-sm btn-primary" v-bind:to="{ name: 'collection'}">Manage collections</router-link>
            <a v-on:click.prevent="toggle" href="#" class='btn btn-sm btn-dark'><icon name="times"/></a>
          </div>
          <div class="body">
            <label for="">Order by</label>
            <select v-model="collectionsSortOrder">
              <option value="name">A-Z</option>
              <option value="-name">Z-A</option>
              <option value="created">Oldest</option>
              <option value="-created">Newest</option>
              <option value="-modified">Last Edit</option>
            </select>
            <hr>
            <ul class="list-unstyled">
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
          </div>
        </div>
      </div> -->
    </div>
    <div class="footer bg-light p-2 border-top">
        <b-button size="sm" variant="outline-primary" disabled>Create New</b-button>
        <b-button size="sm" variant="outline-primary" class="float-right">Manage my Collections</b-button>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/times';

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
  components: {
    Icon,
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.collection-add-to {
  min-width: 400px;
  input {
    font-style: italic;
    &:focus {
    }
  }
  .inputList {
    height: 25vh;
    ul {
      overflow-y: auto;
      height: 100%;
      list-style: none;
      padding: 0;
      li {
        padding: 0;
        input {
          display: none;
        }
        .checkmark {
          display: none;
          position: absolute;
          font-size: larger;
          height: 1em;
          margin: auto;
          top: 0;
          bottom: 0;
          left: 0.75em;
        }
        input:checked ~ .checkmark {
          display: block;
        }
        input:checked ~ label {
          background: rgba($clr-accent-secondary, 0.5);
        }
        label {
          display: block;
          cursor: pointer;
          border-bottom: 1px solid $clr-bg-secondary;
          text-transform: none;
          font-variant: normal;
          font-size: 1em;
          padding-left: 3em;
          &:hover {
            background: $clr-bg-secondary;
          }
          &:active {
            background: $clr-accent-secondary;
          }
        }
      }
    }
  }
}
</style>

<i18n>
{
  "en": {
    "placeholder": "filter or create new collection"
  },
  "de": {
    "placeholder": "Filtern oder neuen Ordner erstellen"
  }
}
</i18n>
