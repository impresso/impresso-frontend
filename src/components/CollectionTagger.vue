<template lang="html">
  <div v-if="isLoggedIn()" class="collection-tagger">
    <a v-on:click.prevent="toggle" href="#">Save</a>
    <div class="overlay" v-show="show">
      <div class="panel">
        <div class="header">
          <div class="titlebar">
            <h1>Add <strong>{{title}}</strong> to ...</h1>
            <div class="icons">
              <a v-on:click.prevent="toggle" href="#"><div class="close icon"></div></a>
            </div>
          </div>
          <div class="orderby">
            <label for="">Order by </label>
            <select v-model="collectionsSortOrder" class="form-control small">
              <option value="name">A-Z</option>
              <option value="-name">Z-A</option>
              <option value="created">Oldest</option>
              <option value="-created">Newest</option>
              <option value="-modified">Last Edit</option>
            </select>
          </div>
        </div>
        <div class="body">
          <ul class="list-unstyled">
            <li v-for="collection in collections" class="form-check">
              <input
              class="form-check-input"
              type="checkbox"
              v-bind:checked="isActive(collection)"
              v-on:click="toggleActive(collection)"
              v-bind:id="collection.uid">
              <label class="form-check-label title" v-bind:for="collection.uid">
                {{collection.name}}
              </label>
              <div v-if="collection.description" class="description">{{collection.description}}</div>
              <div class="collection-meta">
                <span v-if="collection.countIssues > 0">{{collection.countIssues}} issues</span>
                <span v-if="collection.countArticles > 0">{{collection.countArticles}} articles</span>
                <span v-if="collection.countPages > 0">{{collection.countPages}} issues</span>
                <span v-if="collection.countEntities > 0">{{collection.countEntities}} issues</span>
              </div>
            </li>
          </ul>
          <hr>
        </div>
        <div class="footer">
          <router-link class="link" v-bind:to="{ name: 'collection'}">Manage collections</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Issue from '@/models/Issue';
import Article from '@/models/Article';

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
        console.log(this.item);
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
    title: {
      get() {
        if (this.item instanceof Issue) {
          return `${this.item.newspaper.name} (${this.$d(this.item.date, 'short')})`;
        }
        if (this.item instanceof Article) {
          return `${this.item.title}`;
        }

        return 'Item';
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
  },
};
</script>

<style scoped lang="less">
@import "./../assets/less/style.less";

.collection-tagger {
    display: inline-block;
    .overlay {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.2);
        z-index: 10001;
        .panel {
            width: 400px;
            position: absolute;
            margin-left: auto;
            margin-right: auto;
            left: 0;
            right: 0;
            height: 50%;
            top: 25%;
            overflow:hidden;
            background: white;
            border: 2px solid black;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            .header {
              padding: 1rem;
              border-bottom: 1px solid @clr-black;
              .titlebar {
                display: flex;

                h1 {
                  flex: 1;
                  .text-serif;
                  font-size: 1rem;
                  line-height: 1.4;
                }
                .icons {
                  margin-right: 1rem;
                }
              }
              .orderby {

              }
            }
            .body {
                overflow-y: auto;
                height: calc(100% - 40px );
                ul > li:first-child {
                  border-top: 1px solid @clr-grey-200;
                }
                ul > li {
                  border-bottom: 1px solid @clr-grey-200;
                  padding: 0.5rem 4rem;
                  background: white;
                  }
                  :hover {
                    background: @clr-grey-100;
                  }
                  input[type=checkbox] {
                    width:100%;
                    height: 100%;
                    opacity:0;
                    cursor: pointer;
                  }
                  input[type=checkbox]:checked + label:before {
                    content:"";
                    .check.icon;
                    margin-left: -2.5rem;
                  }
                  input[type=checkbox]:checked:hover + label:after {
                  }
                  .form-check-label {
                      font-size: 12px;
                      font-weight: bold;
                      color: @clr-black;
                  }
                  .description {
                    font-size: 12px;
                    color: @clr-grey-800;
                  }
                  .collection-meta {
                    padding-top: 0.4rem;
                    // font-size: 10px;
                    // text-transform: uppercase;
                    letter-spacing: 0.02rem;
                    color: @clr-grey-600;
                    span:not(:last-child):after {
                      content: ' | ';
                      color: @clr-grey-400;
                    }
                  }

            }
            .footer {
              padding: 1rem;
              border-top: 1px solid @clr-black;
            }
        }
    }
}
</style>
