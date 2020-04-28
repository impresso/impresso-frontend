<template>
  <b-row v-if="hasRecommendations">
    <b-col>
      <!-- persons -->
      <div>
        <h3 class="m-0 tb-title small-caps font-weight-bold pb-2">Persons</h3>
        <div v-for="person in recommendedPersons" :key="person.id">
          <item-label type="person" :item="person.item"/>
          <item-selector :uid="person.id" :item="person.item" type="person"/>
        </div>
      </div>

      <!-- locations -->
      <div>
        <h3>Locations</h3>
        <ul>
          <li v-for="location in recommendedLocations" :key="location.name">
            {{ location.name }} ({{ location.score }})
          </li>
        </ul>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import ItemLabel from '@/components/modules/lists/ItemLabel'
import ItemSelector from '@/components/modules/ItemSelector'

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
    /** @returns {{ name: string, score: number, id: string }[]} */
    recommendedLocations() {
      const persCounts = this.recommendations?.loc_counts ?? []
      return persCounts.map(([id, name, score]) => ({ name, score, id }))
    },
  }
}
</script>
