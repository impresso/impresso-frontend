<template lang="html">
  <i-layout class="collection-list">
    <i-layout-section>
      <div slot="header" class="header bg-light p-2 border-bottom">
        <div class="input-group input-group-sm">
        <input type="text" name="" value="" class="form-control"
          v-bind:placeholder="$t('placeholder')"
          v-on:input="onInput"
          v-on:keyup.enter="addCollection(inputString.trim())"
          v-model="inputString"
          />
          <div class="input-group-append">
            <b-button variant="success"
              v-bind:disabled="isDisabled == 0"
              v-on:click="addCollection(inputString.trim())"
              >
              {{$t('create_new')}}
            </b-button>
          </div>
        </div>
      </div>
      <b-container fluid class="inputList p-0">
        <ul>
          <li v-for="collection in filteredCollections">
            <label
              class="m-0 px-3 py-2 border-bottom"
              v-on:click="select(collection, $event)"
              v-bind:class="{ 'bg-accent': collection.uid === $route.params.collection_uid }"
              for="collection.uid">
              <div class="clearfix">
                <div class="float-left">
                  {{collection.name}}
                </div>
                <div class="float-right">
                  {{collection.countEntities}} {{$t('items')}}
                </div>
              </div>
              <div class="clearfix">
                <div class="description float-left">
                  {{collection.description}}
                </div>
                <div class="float-right text-muted">
                  {{$t('created')}} {{$d(collection.createdDate, 'compact')}}
                </div>
              </div>
            </label>
          </li>
        </ul>
      </b-container>
      <div slot="footer" class="bg-light p-3 border-top">
        <label class="mr-1">{{$t("label_order")}}</label>
        <i-dropdown v-model="collectionsSortOrder" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>

      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
export default {
  data: () => ({
    show: false,
    isDisabled: false,
    inputString: '',
  }),
  computed: {
    orderByOptions: {
      get() {
        return [
          {
            value: 'name',
            text: `${this.$t('a-z')}`,
          },
          {
            value: '-name',
            text: `${this.$t('z-a')}`,
          },
          {
            value: 'created',
            text: `${this.$t('oldest')}`,
          },
          {
            value: '-created',
            text: `${this.$t('newest')}`,
          },
          {
            value: '-modified',
            text: `${this.$t('last-edited')}`,
          },
        ];
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
        // console.log('set', collectionsSortOrder);
      },
    },
    filteredCollections() {
      return this.collections.filter((collection) => {
        const searchRegex = new RegExp(this.inputString, 'i');
        return searchRegex.test(collection.name) ||
          searchRegex.test(collection.description);
      });
    },
    collections: {
      get() {
        return this.$store.getters['collections/collections'];
      },
    },
  },
  methods: {
    fetch() {
      return this.$store.dispatch('collections/LOAD_COLLECTIONS');
    },
    select(collection) {
      // this.editMode = false;

      this.$router.push({
        name: 'collection',
        params: {
          collection_uid: collection.uid !== '' ? collection.uid : undefined,
        },
      });

      this.$store.dispatch('collections/LOAD_COLLECTION', collection).then((res) => {
        this.$emit('input', res);
      });
    },
    onInput() {
      const len = this.inputString.trim().length;
      this.isDisabled = (len >= 3 && len <= 50);
    },
    addCollection(collectionName) {
      this.inputString = '';
      this.onInput();
      this.$store.dispatch('collections/ADD_COLLECTION', {
        name: collectionName,
      }).then((res) => {
        // console.log(res);
        this.fetch();
        this.select(res);
      });
    },
    toggle() {
      this.show = !this.show;
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
  },
  mounted() {
    this.fetch().then(() => {
      const collection = {
        uid: this.$route.params.collection_uid,
      };
      this.$store.dispatch('collections/LOAD_COLLECTION', collection).then((res) => {
        this.$emit('input', res);
      });

      // this.select();
      // this.$emit('input', res);
    });
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.collection-list {
  input {
    font-style: italic;
    &:focus {
    }
  }
  .inputList {
    height: 100%;
    overflow: scroll;
    ul {
      // overflow-y: auto;
      list-style: none;
      padding: 0;
      // margin-bottom: -1px;
      li {
        padding: 0;

        label {
          display: block;
          cursor: pointer;

          &.loading {
            background: $clr-accent-secondary;
          }
          &:active {
            background: $clr-accent-secondary;
          }
          span, div {
            pointer-events: none;
            cursor: pointer;
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
    "placeholder": "Filter collections or create new",
    "label_order": "Order By",
    "create_new": "Create Collection",
    "created": "Created:",
    "last_edited": "Last edited",
    "items": "items"
  },
  "de": {
    "placeholder": "Filtern oder neue Sammlung erstellen",
    "label_order": "Order By",
    "create_new": "Sammlung erstellen",
    "created": "Erstellt:",
    "last_edited": "Zuletzt bearbeitet",
    "items": " Artikel"
  }
}
</i18n>
