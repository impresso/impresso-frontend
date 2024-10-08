<template>
  <b-row v-if="hasRecommendations">
    <b-col>
      <!-- topics -->
      <div>
        <h3 class="m-0 tb-title small-caps font-weight-bold pb-2">{{ $t('label.topics') }}</h3>
        <div v-for="topic in recommendedTopics" :key="topic.id">
          <item-label type="topic" :item="topic.item"/>
          <item-selector
            :uid="topic.id"
            :item="topic.item"
            :default-click-action-disabled="true"
            type="topic"
            @click="handleItemClicked" />
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import ItemLabel from '@/components/modules/lists/ItemLabel.vue'
import ItemSelector from '@/components/modules/ItemSelector.vue'
import { mapStores } from 'pinia'
import { useMonitorStore } from '@/stores/monitor'

export default {
  components: {
    ItemLabel,
    ItemSelector
  },
  props: {
    recommendations: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapStores(useMonitorStore),
    /** @returns {boolean} */
    hasRecommendations() {
      return Object.keys(this.recommendations).length > 0
    },
    /** @returns {{ name: string, score: number, id: string, item: any }[]} */
    recommendedTopics() {
      const topicWeights = this.recommendations?.topic_weights ?? []
      return topicWeights.map(([id, name, score]) => {
        const languageCode = id.replace(/.*_(.+)$/, '$1')
        return {
          name,
          score,
          id,
          item: {
            language: languageCode,
            htmlExcerpt: `${name} (${this.$n(score, { maximumFractionDigits: '2' })})`
          }
        }
      })
    }
  },
  methods: {
    /**
     * Overriding default item click handler to show monitor
     * without filters editing buttons.
     * @param {any} params
     */
    handleItemClicked({ params }) {
      this.monitorStore.activate({
        ...params,
        filters: [],
        disableFilterModification: true
      })
    }
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "label": {
      "topics": "Topics"
    }
  }
}
</i18n>
