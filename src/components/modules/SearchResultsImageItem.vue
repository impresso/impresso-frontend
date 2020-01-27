<template lang="html">
  <div class="tile my-3 border">
    <div
      v-if="searchResult.regions && searchResult.regions[0]"
      class="thumbnail bg-light clearfix"
      :style="`background-image: url(${searchResult.regions[0].iiifFragment})`">
      <div v-if="isLoggedIn && checkbox" class="float-right pt-1 pl-1">
        <b-checkbox
          class="m-0 select-item"
          v-bind:checked="checked"
          v-on:change="$emit('toggleSelected', searchResult)" />
      </div>
      <b-button variant="secondary" v-on:click="$emit('click:search', searchResult)" class="buttonFindSimilar" size="">
        <icon name="search" />
      </b-button>
    </div>
    <div
      v-else
      class="thumbnail bg-dark clearfix">
      <p class="text-center small-caps text-light pt-4">{{ $t('iiif.missing') }}</p>
    </div>

    <article-item :item="searchResult" show-href show-meta v-on:click:title="viewArticle" class="p-2"/>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/search';
import ArticleItem from './lists/ArticleItem';

export default {
  components: {
    Icon,
    ArticleItem,
  },
  props: ['searchResult', 'checkbox', 'checked'],
  computed: {
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
    title() {
      return this.$helpers.excerpt(this.searchResult.title) || this.$t('result.label.image.untitled');
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

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.tile {
  div.overlay-region{
    background: $clr-accent-secondary;
    opacity: 0.25;
  }
  &:hover {
    transition: 0.2s;
    border-color: black !important;
  }
  .titleblock {
    display:block;
    &:hover {
      text-decoration: none;
      border-color: black !important;
    }
  }
  .thumbnail {
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      height: 20em;
      height: 30vh;
      position: relative;
      input[type="checkbox"] {
          width: 0;
      }
      .buttonFindSimilar{
        position: absolute;
        bottom:0;
        right:0;
      }
  }
  h2 {
    font-size: 1em;
    font-weight: 500;
  }
  overflow: hidden;
}

</style>
