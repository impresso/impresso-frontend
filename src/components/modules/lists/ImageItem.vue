<template lang="html">
  <div class="image-item p-1" @click="gotoPage">
    <b-img-lazy v-if="hasValidSrc"
      :fluid="fluid"
      :fluid-grow="fluidGrow"
      :height="height"
      :center="center"
      class="image"
      :src="src"
    />
    <div v-else>{{ $t('iiif.missing') }}</div>
    <!-- v-if="showMeta" -->
    <div v-if="showMeta">
      <p v-if="hasTitle" class="item-title p-2 m-0">{{ item.title }}</p>
      <div class="p-2 articles-meta">
        <router-link :to="{ name: 'newspaper', params: { newspaper_uid: item.newspaper.uid }}" class="article-newspaper">
          {{ item.newspaper.name}}
        </router-link>
        <item-selector :uid="item.newspaper.uid" :item="item.newspaper" type="newspaper"/> &nbsp;
        <span class="date">{{ $d(item.date, "long") }}</span>
        <span> – {{ pages }}</span>
      </div>
    </div>
    <figcaption class="py-2" v-else-if="hasTitle">{{ item.title }}</figcaption>
  </div>
</template>

<script>
import ItemSelector from '@/components/modules/ItemSelector';

export default {
  props: {
    height: Number,
    center: Boolean,
    fluid: Boolean,
    fluidGrow: Boolean,
    item: Object,
    showMeta: Boolean,
    showArticle: Boolean,
  },
  computed: {
    pages() {
      return this.$tc('pp', this.item.nbPages, {
        pages: this.item.pages.map(d => d.num).join(','),
      });
    },
    hasTitle() {
      return this.item.title && this.item.title.length;
    },
    hasValidSrc() {
      return Array.isArray(this.item.regions) && this.item.regions.length;
    },
    src() {
      return this.item.regions[0].iiifFragment;
    },
  },
  methods: {
    gotoPage() {
      const params = {
        issue_uid: this.item.issue?.uid || this.item.uid.match(/(^.+)-i/)[1],
        page_uid: this.item.pages[0]?.uid,
      };
      console.info('gotoPage', params);
      if (this.item.article) {
        this.$router.push({
          name: 'article',
          params: {
            ...params,
            article_uid: this.item.article.uid,
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
  components: {
    ItemSelector,
  },
};
</script>

<style lang="scss">
.image-item {
  min-height: 200px;
  .article-newspaper {
    font-weight: bold;
  }
  .date {
    text-transform: lowercase;
    font-variant: small-caps;
  }
  .articles-meta{
    font-size: 14px;
  }
  .item-title{
    background: #eff0f0;
  }
  figcaption {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 300px;
  }
}
</style>
