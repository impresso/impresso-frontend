<template>
  <div class="TextReusePassageItemLabel">
    <h3>
      <router-link
        v-if="item.article"
        :to="{
          name: 'issue-viewer',
          params: {
            issue_uid: item.issue.id,
          },
          query: {
            p: item.pageNumbers[0],
            articleId: item.article.id.match(/-([i0-9]+$)/)[1],
          },
        }"
      >
        {{ item.title }}
      </router-link>
    </h3>
    <router-link
      :to="{ name: 'newspaper', params: { newspaper_uid: item.newspaper.id } }"
      class="newspaper"
    >
      {{ item.newspaper.name || item.newspaper.id }}
    </router-link>
    <ItemSelector
      :uid="item.newspaper.id"
      :item="item.newspaper"
      type="newspaper"
      search-index="textReuse"
    />
    &nbsp;
    <span class="small-caps date">{{ $d(new Date(item.date), 'long') }}</span>
    <span class="small-caps date"> – {{ pages }}</span>
  </div>
</template>
<script>
import ItemSelector from '../ItemSelector.vue'

export default {
  name: 'TextReusePassageItemLabel',
  components: { ItemSelector },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },

  computed: {
    pages() {
      return this.$tc('pp', this.item.pageNumbers.length, {
        pages: this.item.pageNumbers.join(','),
      })
    },
  },
}
</script>
<style>
.TextReusePassageItemLabel .newspaper {
  font-weight: bold;
  font-size: inherit;
}
.TextReusePassageItemLabel h3 {
  font-size: inherit;
  margin-bottom: 0;
}

.bg-dark .TextReusePassageItemLabel,
.bg-dark .TextReusePassageItemLabel .newspaper,
.bg-dark .TextReusePassageItemLabel h3 a {
  color: #fff;
}
</style>
