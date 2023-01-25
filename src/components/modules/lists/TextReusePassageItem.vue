<template>
  <div class="TextReusePassageItem">
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
      <p class="small my-2">
        <span v-html="textReuseClusterSummary"></span>
        <br />
        <button class="btn btn-link small btn-sm p-0" @click="() => this.$emit('click', item)">
          <u>{{ $t('seeTextReuseCluster', { textReuseCluster: item.textReuseCluster.id }) }}</u>
        </button>
      </p>
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
      <Ellipsis
        v-bind:max-height="200"
        v-bind:initialHeight="80"
        :additional-height="0"
        @click.prevent.stop
      >
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
          n: this.$n(this.item.textReuseCluster.clusterSize),
        },
      )
      const lexicalOverlapLabel = this.$tc(
        'numbers.lexicalOverlap',
        this.item.textReuseCluster.lexicalOverlap,
        {
          n: this.$n(Math.round(this.item.textReuseCluster.lexicalOverlap * 100) / 100),
        },
      )
      const sizeLabel = this.$tc('numbers.resultsAbsolute', parseInt(this.item.size), {
        n: this.$n(this.item.size),
      })

      return this.$t('textReuseClusterSummary', {
        clusterSize: clusterSizeLabel,
        lexicalOverlap: lexicalOverlapLabel,
        size: sizeLabel,
        timespan: this.$tc('numbers.days', this.item.textReuseCluster.timeDifferenceDay, {
          n: this.item.textReuseCluster.timeDifferenceDay,
        }),
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
    "numbers": {
      "days": "<span class='number'>{n}</span> day|<span class='number'>{n}</span> days"
    },
    "seeTextReuseCluster": "see all passages in this cluster",
    "textReuseClusterSummary": "Cluster size: {clusterSize} with {lexicalOverlap} over {timespan}. Content length: {size} tokens."
  }
}
</i18n>
