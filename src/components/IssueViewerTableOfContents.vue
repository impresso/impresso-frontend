<template>
  <div class="issue-viewer-table-of-contents">
    <div v-for="(item, i) in items" :key="i"
      class="border-bottom"
      @click="$emit('article-selected', item)"
    >
      <table-of-contents-item
        :ref="`toc-article-${item.uid}`"
        :item="item"
        :headers="headers"
        :active="item.uid === selectedArticleId">
        <template v-slot:actions>
          <div class="border-top border-bottom py-1 my-2">
            <span class="small">{{$t('label_continue_reading')}}</span>
            <a class="small-caps" :class="{
              'font-weight-bold': item.uid === selectedArticleId
            }" @click="$emit('click-full-text', item.uid)">
              {{ $t('closeReadingView') }}
            </a>
          </div>
        </template>
      </table-of-contents-item>
    </div>
  </div>
</template>

<script>
import TableOfContentsItem from '@/components/modules/lists/TableOfContentsItem.vue'

export default {
  data: () => ({
    scrollTocToArticleTimer: 0,
  }),
  props: {
    headers: {
      type: Object,
      default: () => {},
    },
    selectedArticleId: String,
    items: {
      type: Array,
      default: () => [],
    }
  },
  components: {
    TableOfContentsItem,
  },
  methods: {
    /** @param {string} articleId */
    scrollTocToArticle(articleId) {
      const articleComponent = (this.$refs[`toc-article-${articleId}`] ?? [])[0]
      if (articleComponent == null) {
        console.warn('scrollTocToArticle: ',articleId, 'DOM not ready yet.')
        clearTimeout(this.scrollTocToArticleTimer)
        this.scrollTocToArticleTimer = setTimeout(() => this.scrollTocToArticle(articleId), 500)
        return;
      }
      const articleElement = articleComponent.$el
      const container = this.$el.parentNode.parentNode

      const relativeTop = articleElement.offsetTop - container.offsetTop
      container.scrollTo({ top: relativeTop - 1, behavior: 'smooth' })
    },
  },
  watch: {
    /** @param {string} id */
    selectedArticleId: {
      handler(id) {
        this.scrollTocToArticle(id);
      },
      immediate: true,
    }
  }
}
</script>
<i18n lang="json">
{
  "en": {
    "label_full_text": "full text",
    "label_continue_reading": "Continue reading:"
  }
}
</i18n>
<style lang="css" scoped>
</style>
