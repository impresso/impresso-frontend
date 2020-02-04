<template>
  <div class="d-flex flex-column">
    <!-- image and text -->
    <div class="d-flex flex-row">
      <div class="image">
        [image {{passage.pageRegions}}]
      </div>
      <div class="content">
        {{passage.content}}
      </div>
    </div>
    <!-- title and meta -->
    <div class="d-flex flex-column">
      <h2>
        <router-link
          :to="{name: 'article', params: articleParams}">
          {{ passage.title }}
        </router-link>
      </h2>
      <!-- TODO: extract this and same code in ArticleItem into a separate component -->
      <div class="article-meta">
        <router-link :to="{ name: 'newspaper', params: { newspaper_uid: passage.newspaper.uid }}" class="article-newspaper">
          {{ passage.newspaper.name }}
        </router-link>
        <item-selector :uid="passage.newspaper.uid" :item="passage.newspaper" type="newspaper"/> &nbsp;
        <span class="date">{{ $d(new Date(passage.date), "long") }}</span>
        <span>{{ pages }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import ItemSelector from '../ItemSelector';
import { getArticleParameters } from '@/logic/ids'

export default {
  props: {
    passage: {
      type: Object,
      required: true
    }
  },
  components: {
    ItemSelector
  },
  computed: {
    articleParams() {
      const { articleId, pageNumbers } = this.passage
      const firstPageNumber = pageNumbers[0]
      return getArticleParameters(articleId, firstPageNumber)
    },
    pages() {
      return this.$tc(
        'pp',
        this.passage.pageNumbers.length,
        { pages: this.passage.pageNumbers.join(',') }
      );
    }
  }
}
</script>

<style lang="scss" scoped>
  .content {
    flex-basis: 60%;
  }
  .image {
    flex-basis: 40%;
  }
</style>