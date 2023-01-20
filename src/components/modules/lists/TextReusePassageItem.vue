<template>
  <div class="TextReusePassageItem m-3 pb-3 border-bottom">
    <div>
      <router-link
        :to="{ name: 'newspaper', params: { newspaper_uid: item.newspaper.id } }"
        class="article-newspaper"
      >
        {{ item.newspaper.name || item.newspaper.id }}
      </router-link>
      <ItemSelector :uid="item.newspaper.id" :item="item.newspaper" type="newspaper" /> &nbsp;
      <span class="small-caps date">{{ $d(new Date(item.date), 'long') }}</span>
      <span class="small-caps date"> – {{ pages }}</span>
      <h3>
        <router-link
          :to="{
            name: 'article',
            params: {
              issue_uid: item.issue.id,
              page_uid: item.issue.id + '-p' + String(item.pageNumbers[0]).padStart(4, '0'),
              article_uid: item.article.id,
            },
          }"
        >
          {{ item.title }}
        </router-link>
      </h3>
    </div>
    <div class="border shadow-sm p-1">
      <Ellipsis v-bind:max-height="200" v-bind:initialHeight="80" @click.prevent.stop>
        <p class="text-sample p-2">
          <span>{{ item.content }}</span>
        </p>
      </Ellipsis>
    </div>
  </div>
</template>

<script>
import Ellipsis from '../Ellipsis'
import ItemSelector from '../ItemSelector'
export default {
  components: {
    // ClusterDetailsPanel,
    Ellipsis,
    ItemSelector,
  },
  props: {
    selected: Boolean,
    isObservable: Boolean,
    active: Boolean,
    showLink: Boolean,
    item: {
      type: Object,
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

<style lang="css">
.TextReusePassageItem {
  max-width: 350px;
}
</style>
