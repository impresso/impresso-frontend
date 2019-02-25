<template lang="html">
  <div id="IssueViewerText" class="container-fluid py-3">
    <i-layout>
      <i-layout-section>
        <div
          class="row mb-3"
          v-for="(region, i) in article.regions"
          v-bind:key="i">
          <div class="col col-sm-8">
            <p v-html="region.g.join('<br>')" />
          </div>
          <div class="col">
            <img v-bind:src="region.iiifFragment" width="100%" />
          </div>
        </div>
      </i-layout-section>
      <i-layout-section width="200px" class="text-right">
        <h5>{{article.title}}</h5>
        <b-button-group>
          <b-button size="sm" disabled variant="outline-primary">Add Tag ...</b-button>
        </b-button-group>
        <hr>
        <b-badge
          v-for="(collection, i) in article.collections"
          v-bind:key="i"
          variant="info"
          class="mr-1">
          <router-link
            class="text-white"
            v-bind:to="{name: 'collection', params: {collection_uid: collection.uid}}">
            {{ collection.name }}
          </router-link>
          <a class="dripicons dripicons-cross" v-on:click="onRemoveCollection(collection, article)" />
        </b-badge>
        <div class="my-2" />
        <b-dropdown size="sm" variant="outline-primary" text="Add to Collection ...">
          <collection-add-to :item="article" />
        </b-dropdown>
        <br>
        <hr>
        <b-button size="sm" disabled variant="outline-primary">Export Citations ...</b-button><br>
        <div class="my-2" />
        <b-button size="sm" disabled variant="outline-primary">Download as ...</b-button>
        <hr>
        <base-title-bar>Entities in Article</base-title-bar>
        <label class="mr-1" for="eorderby">Order by</label>
        <b-dropdown id="eorderby" disabled variant="outline-primary" size="sm" text="relevance" class="">
          <b-dropdown-item>First Action</b-dropdown-item>
        </b-dropdown>
      </i-layout-section>
    </i-layout>
  </div>
</template>

<script>
import * as services from '@/services';
import Article from '@/models/Article';
import BaseTitleBar from './../base/BaseTitleBar';
import CollectionAddTo from './CollectionAddTo';

export default {
  data() {
    return {
      article: new Article(),
    };
  },
  props: ['article_uid'],
  components: {
    BaseTitleBar,
    CollectionAddTo,
  },
  methods: {
    onRemoveCollection(collection, item) {
      const idx = item.collections.findIndex(c => (c.uid === collection.uid));
      if (idx !== -1) {
        this.$store.dispatch('collections/REMOVE_COLLECTION_ITEM', {
          collection,
          item,
        }).then(() => {
          item.collections.splice(idx, 1);
          this.$forceUpdate();
        });
      }
    },
  },
  watch: {
    article_uid: {
      immediate: true,
      handler(val) {
        this.article = new Article();
        services.articles.get(val).then((res) => {
          this.article = new Article({
            ...res,
            regions: res.regions.map(region => ({
              ...region,
              iiifFragment: region.iiif_fragment,
            })),
          });
        });
      },
    },
  },
};
</script>

<style scoped lang="less">
#IssueViewerText{
  overflow: none;
  height: 100%;
}
.article {
    display: grid;
    grid-template-columns: 1fr 220px;
    grid-template-rows: auto;
    grid-template-areas: 'regions controls';
    column-gap: 1rem;

    .regions {
      grid-area: regions;
    }

    .controls{
      grid-area: controls;
    }
}
.region {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-template-areas: 'context richtext';
    column-gap: 2em;

    .context{
      grid-area: context;
    }

    .richtext {
      grid-area: richtext;
    }

}
</style>
