<template lang="html">
  <div id="IssueViewerText" class="container-fluid py-3">
    <i-layout>
      <i-layout-section>
        <h3>{{article.title}}</h3>
        <div>
          <router-link :to="{ name: 'newspaper', params: {newspaper_uid: article.newspaper.uid} }">
            {{ article.newspaper.name}}
          </router-link> &mdash; {{ articlePages }}
        </div>
        <div class="my-2" />
        <collection-add-to :item="article" :text="$t('add_to_collection')" />
        <b-badge
          v-for="(collection, i) in article.collections"
          v-bind:key="i"
          variant="info"
          class="mt-1 mr-1">
          <router-link
            class="text-white"
            v-bind:to="{name: 'collection', params: {collection_uid: collection.uid}}">
            {{ collection.name }}
          </router-link>
          <a class="dripicons dripicons-cross" v-on:click="onRemoveCollection(collection, article)" />
        </b-badge>
        <div class="my-3">
          <span class="label small-caps">{{ $t("topics")}}</span>:
          <span v-for="(rel, i) in topics" v-bind:key="i">
            <router-link :to="{ name: 'topic', params: { 'topic_uid': rel.topic.uid }}">
              {{ rel.topic.getHtmlExcerpt() }} ({{ $n(rel.relevance * 100) }} %)
            </router-link> &mdash;
          </span>
        </div>
        <div v-if="hasValidRegions === false">
          <p>{{article.excerpt}}</p>
        </div>
        <div
          v-else
          class="row mt-3 mb-3"
          v-for="(region, i) in article.regions"
          v-bind:key="i">
          <div class="col col-sm-7">
            <div class='region p-2'>
              <p v-for="contents in region.g" >
                <span v-html="contents"></span>
              </p>
            </div>
          </div>
          <div class="col">
            <img v-bind:src="region.iiifFragment" width="100%" />
          </div>
        </div>
      </i-layout-section>
      <!-- <i-layout-section width="200px" class="text-right">
        <h5>{{article.title}}</h5>
        <b-button-group>
          <b-button size="sm" variant="outline-primary">Add Tag ...</b-button>
        </b-button-group>
        <hr>
        <b-dropdown size="sm" variant="outline-primary" text="Add to Collection ...">
          <collection-add-to style="margin: -0.5em 0 -0.5em 0" />
        </b-dropdown>
        <br>
        <span class="badge badge-secondary">Novels</span>
        <span class="badge badge-secondary">Poems</span>
        <hr>
        <b-button size="sm" variant="outline-primary">Export Citations ...</b-button><br>
        <b-button size="sm" variant="outline-primary">Download as ...</b-button>
        <hr>
        <base-title-bar>Entities in Article</base-title-bar>
        <br>
        <label class="mr-1" for="eorderby">Order by</label>
        <b-dropdown id="eorderby" variant="outline-primary" size="sm" text="relevance" class="">
          <b-dropdown-item>First Action</b-dropdown-item>
        </b-dropdown>
      </i-layout-section> -->
    </i-layout>
  </div>
</template>

<script>
import Article from '@/models/Article';
import BaseTitleBar from './../base/BaseTitleBar';
import CollectionAddTo from './CollectionAddTo';
import Ellipsis from './Ellipsis';

export default {
  data() {
    return {
      article: new Article(),
    };
  },
  computed: {
    articlePages() {
      if (!this.article.pages || !this.article.pages.length) {
        return this.$t('no_page_info');
      }
      if (this.article.pages.length === 1) {
        return this.$t('page', { num: this.article.pages[0].num });
      }
      return this.$t('pages', { nums: this.article.pages.map(d => d.num).join(', ') });
    },
    topics() {
      return this.article.topics.filter(rel => rel.topic);
    },
    hasValidRegions() {
      return !!this.article.regions.filter(region => region.g.length).length;
    },
  },
  props: ['article_uid'],
  components: {
    BaseTitleBar,
    CollectionAddTo,
    Ellipsis,
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
      async handler(articleUid) {
        this.article = await this.$store.dispatch('articles/LOAD_ARTICLE', articleUid);
      },
    },
  },
};
</script>

<style lang="less">
#IssueViewerText{
  overflow: none;
  height: 100%;

  span.location{
    border-bottom: 1px solid cyan;
  }

  .region{
    padding: 0.125rem 0.25rem;
    background: white;

    p {
      margin-bottom: 0;
    }
  }
}
</style>

<i18n>
{
  "en": {
    "page": "pag. {num}",
    "pages": "pp. {nums}",
    "add_to_collection": "Add to Collection ..."
  }
}
</i18n>
