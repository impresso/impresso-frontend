<template>
  <div class="ClusterItem">
    <span class="d-flex align-self-stretch flex-shrink-0 selection-indicator" />
    <TextReusePassageItemLabel :item="textReusePassageItem" class="border-left pl-2 my-2 small border-tertiary" />

    <div class="rounded border border-tertiary bg-white shadow-sm p-1">
      <Ellipsis v-bind:max-height="300" v-bind:initialHeight="200" :additional-height="50" @click.prevent.stop>
        <p class="text-sample p-2">
          <span>{{ item.textSampleContent }}</span>
        </p>
      </Ellipsis>
    </div>
    <div class="small text-muted mb-2" v-html="textReuseClusterSummary"></div>

    <b-button variant="outline-secondary" size="sm" class="TextReusePassageItem_compareBtn float-left rounded shadow-sm"
      @click="handleClusterClick">
      {{ $t('seeTextReuseCluster') }}
    </b-button>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'

import TextReusePassageItemLabel from './TextReusePassageItemLabel.vue'
import Ellipsis from '../Ellipsis.vue'

export default {
  name: 'ClusterItem',
  components: {
    TextReusePassageItemLabel,
    Ellipsis,
  },
  props: {
    selected: Boolean,
    isObservable: Boolean,
    active: Boolean,
    showLink: Boolean,
    item: {
      // must be an instance of TextReuseCluster
      type: Object,
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
      this.selectionMonitorStore.show({
        type: 'textReusePassage',
        item: this.textReusePassageItem,
        context: 'textReuse',
        scope: 'comparePassages',
        applyCurrentSearchFilters: false,
        displayTimeline: false,
        displayActionButtons: false,
        displayCurrentSearchFilters: false,
      })
    },
  },
  computed: {
    ...mapStores(useSelectionMonitorStore),
    textReusePassageItem() {
      return {
        id: this.item.textSampleArticle.id,
        title: this.item.textSampleTitle,
        newspaper: {
          id: this.item.textSampleArticle.id.split('-')[0],
        },
        date: this.item.textSampleDate,
        pageNumbers: [1],
        issue: {
          id: this.item.textSampleArticle.id.split('-i')[0],
        },
        article: {
          id: this.item.textSampleArticle.id,
        },
        content: this.item.textSampleContent,
        textReuseCluster: {
          id: this.item.id,
          clusterSize: this.item.clusterSize,
          lexicalOverlap: this.item.lexicalOverlap,
          timeDifferenceDay: this.item.timeDifferenceDay,
          article: {
            id: this.item.textSampleArticle.id,
          },
        },
      }
    },
    textReuseClusterSummary() {
      const clusterSizeLabel = this.$tc('numbers.clusterSize', this.item.clusterSize, {
        n: this.$n(this.item.clusterSize),
      })
      const lexicalOverlapLabel = this.$tc('numbers.lexicalOverlap', this.item.lexicalOverlap, {
        n: this.$n(Math.round(this.item.lexicalOverlap * 100) / 100),
      })

      return this.$t('textReuseClusterSummary', {
        clusterSize: clusterSizeLabel,
        lexicalOverlap: lexicalOverlapLabel,
        timespan: this.$tc('numbers.days', this.item.timeDifferenceDay, {
          n: this.item.timeDifferenceDay,
        }),
      })
    },
  },
}
</script>

<style lang="css">
.ClusterItem .selection-indicator {
  width: 0.25em;
}

.ClusterItem {
  max-width: 350px;
}

.ClusterItem .number {
  font-weight: bold;
}
</style>

<i18n lang="json">{
  "en": {
    "numbers": {
      "days": "<span class='number'>{n}</span> day|<span class='number'>{n}</span> days"
    },
    "fromArticle": "From article",
    "seeTextReuseCluster": "Compare passages in cluster",
    "textReuseClusterSummary": "Cluster size: {clusterSize} with {lexicalOverlap} over {timespan}."
  }
}</i18n>
