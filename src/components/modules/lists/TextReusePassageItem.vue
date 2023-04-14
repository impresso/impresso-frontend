<template>
  <!-- on hover, show the buttons -->
  <div class="TextReusePassageItem">
    <div>
      <TextReusePassageItemLabel :item="item" class="border-left pl-2 my-2 small border-tertiary" />
    </div>
    <!-- {{ item.collections }} -->
    <div class="rounded border border-tertiary bg-white shadow-sm p-1">
      <Ellipsis
        v-bind:max-height="300"
        v-bind:initialHeight="200"
        :additional-height="0"
        @click.prevent.stop
      >
        <p class="text-sample p-2">
          <span>{{ item.content }}</span>
        </p>
      </Ellipsis>
    </div>
    <div class="small text-muted mb-2" v-html="textReuseClusterSummary"></div>

    <b-button
      variant="outline-secondary"
      size="sm"
      class="TextReusePassageItem_compareBtn float-left rounded shadow-sm"
      @click="handleClusterClick"
    >
      {{ $t('seeTextReuseCluster') }}
    </b-button>
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
  methods: {
    handleClusterClick() {
      // <ItemSelector
      //     :uid="item.textReuseCluster.id"
      //     :item="item.textReuseCluster"
      //     type="textReuseCluster"
      //     context="textReuse"
      //   >
      //     {{ $t('seeTextReuseCluster') }}
      //   </ItemSelector>
      this.$store.dispatch('selectionMonitor/show', {
        type: 'textReuseCluster',
        item: this.item.textReuseCluster,
        context: 'textReuse',
        scope: 'comparePassages',
        applyCurrentSearchFilters: false,
        displayTimeline: false,
        displayActionButtons: false,
      })
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
/* .TextReusePassageItem_compareBtn {
  transition: opacity 0.2s ease-in-out;
  opacity: 0.9;
}
.TextReusePassageItem:hover .TextReusePassageItem_compareBtn {
  opacity: 1;
} */
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
    "seeTextReuseCluster": "compare with passages in cluster",
    "textReuseClusterSummary": "Cluster size: {clusterSize} with {lexicalOverlap} over {timespan}. Content length: {size} tokens."
  }
}
</i18n>
