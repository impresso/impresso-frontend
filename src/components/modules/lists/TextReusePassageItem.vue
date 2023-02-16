<template>
  <div class="TextReusePassageItem">
    <div>
      <p class="small my-2">
        <span v-html="textReuseClusterSummary"></span>
        <br />
        <button class="btn btn-link small btn-sm p-0">
          <ItemSelector
            :uid="item.textReuseCluster.id"
            :item="item.textReuseCluster"
            type="textReuseCluster"
            context="textReuse"
          >
            {{ $t('seeTextReuseCluster') }}
          </ItemSelector>
        </button>
      </p>
      <span class="small-caps">{{ $t('fromArticle') }}</span>
      <TextReusePassageItemLabel :item="item" class="border-left pl-2 my-2 small border-tertiary" />
    </div>
    <!-- {{ item.collections }} -->
    <div class="rounded border border-tertiary bg-white shadow-sm p-1">
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
import TextReusePassageItemLabel from './TextReusePassageItemLabel'

export default {
  components: {
    // ClusterDetailsPanel,
    TextReusePassageItemLabel,
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
    "fromArticle": "From article",
    "seeTextReuseCluster": "see all passages in this cluster",
    "textReuseClusterSummary": "Cluster size: {clusterSize} with {lexicalOverlap} over {timespan}. Content length: {size} tokens."
  }
}
</i18n>
