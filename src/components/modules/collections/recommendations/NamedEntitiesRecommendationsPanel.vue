<template>
  <b-row v-if="hasRecommendations">
    <b-col>
      <!-- persons -->
      <div>
        <h3 class="m-0 tb-title small-caps font-weight-bold pb-2">{{ $t('label.persons') }}</h3>
        <div v-for="person in recommendedPersons" :key="person.id">
          <item-label type="person" :item="person.item"/>
          <item-selector
            :uid="person.id"
            :item="person.item"
            :default-click-action-disabled="true"
            type="person"
            @click="handleItemClicked" />
        </div>
      </div>

      <!-- locations -->
      <div>
        <h3 class="m-0 tb-title small-caps font-weight-bold pb-2 pt-2">{{ $t('label.locations') }}</h3>
        <div v-for="location in recommendedLocations" :key="location.id">
          <item-label type="location" :item="location.item"/>
          <item-selector
            :uid="location.id"
            :item="location.item"
            :default-click-action-disabled="true"
            type="location"
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
    recommendedPersons() {
      const persCounts = this.recommendations?.pers_counts ?? []
      return persCounts.map(([id, name, score]) => ({
        name,
        score,
        id,
        item: {
          name: `${name} (${this.$n(score, { maximumFractionDigits: '2' })})`
        }
      }))
    },
    /** @returns {{ name: string, score: number, id: string, item: any }[]} */
    recommendedLocations() {
      const persCounts = this.recommendations?.loc_counts ?? []
      return persCounts.map(([id, name, score]) => ({
        name,
        score,
        id,
        item: {
          name: `${name} (${this.$n(score, { maximumFractionDigits: '2' })})`
        }
      }))
    },
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
      "persons": "Persons",
      "locations": "Locations"
    }
  }
}
</i18n>
