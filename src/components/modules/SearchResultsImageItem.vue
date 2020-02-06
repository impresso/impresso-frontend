<template lang="html">
  <div class="tile my-3 border">
    <div
      v-if="searchResult.regions && searchResult.regions[0]"
      class="thumbnail bg-secondary clearfix"
      :style="`background-image: url(${searchResult.regions[0].iiifFragment})`">
      <div v-if="isLoggedIn && checkbox" class="float-right pt-1 pl-1">
        <b-checkbox
          class="m-0 select-item"
          v-bind:checked="checked"
          v-on:change="$emit('toggleSelected', searchResult)" />
      </div>
      <b-button
        variant="outline-primary"
        v-on:click="$emit('click:search', searchResult)"
        v-b-tooltip.hover :title="$t('actions.find_similar_images')"
        class="m-1 bg-light buttonFindSimilar pt-2" size="sm">
        <span class="dripicons-camera"></span>
      </b-button>
    </div>
    <div
      v-else
      class="thumbnail bg-dark clearfix">
      <p class="text-center small-caps text-light pt-4">{{ $t('iiif.missing') }}</p>
    </div>
    <router-link
      class="titleblock article-meta p-2 border-top"
      :to="{ name: 'article', params: routerLinkParams }">
      <article-item :item="searchResult" show-meta />
    </router-link>
  </div>
</template>

<script>
import 'vue-awesome/icons/search';
import ArticleItem from './lists/ArticleItem';

export default {
  components: {
    ArticleItem,
  },
  props: ['searchResult', 'checkbox', 'checked'],
  computed: {
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
    routerLinkParams() {
      const params = {
        article_uid: this.searchResult.uid,
        page_uid: this.searchResult.pages[0].uid,
      };
      if (this.searchResult.issue) {
        params.issue_uid = this.searchResult.issue.uid;
      } else {
        params.issue_uid = this.searchResult.uid.match(/(^.+)-i/)[1];
      }
      return params;
    },
  },
  methods: {
    viewArticle({ params }) {
      if (this.searchResult.article) {
        this.$router.push({
          name: 'article',
          params: {
            ...params,
            article_uid: this.searchResult.article.uid,
          },
        });
      } else {
        this.$router.push({
          name: 'article',
          params,
        });
      }
    },
  },
};
</script>
