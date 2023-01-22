<template>
  <div class="TextReusePassageItem m-3 pb-4 border-bottom">
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
      <p class="small my-2" v-html="textReuseClusterSummary"></p>
      <h3>
        <router-link
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
    click: {
      type: Function,
    },
  },
  computed: {
    pages() {
      return this.$tc('pp', this.item.pageNumbers.length, {
        pages: this.item.pageNumbers.join(','),
      })
    },
    textReuseClusterSummary() {
      const clusterSizeLabel = this.$tc(
        'numbers.clusterSize',
        this.item.textReuseCluster.clusterSize,
        {
          n: this.item.textReuseCluster.clusterSize,
        },
      )
      const lexicalOverlapLabel = this.$tc(
        'numbers.lexicalOverlap',
        this.item.textReuseCluster.lexicalOverlap,
        {
          n: Math.round(this.item.textReuseCluster.lexicalOverlap * 100) / 100,
        },
      )
      return this.$t('textReuseClusterSummary', {
        clusterSize: clusterSizeLabel,
        lexicalOverlap: lexicalOverlapLabel,
      })
    },
  },
}
</script>

<style lang="css">
.TextReusePassageItem {
  max-width: 350px;
}
.TextReusePassageItem h3 a {
  word-break: break-word;
}
.TextReusePassageItem .number {
  font-weight: bold;
}
</style>
<i18n>
{
  "en": {
    "textReuseClusterSummary": "Cluster size: {clusterSize} with {lexicalOverlap}"
  }
}
</i18n>
