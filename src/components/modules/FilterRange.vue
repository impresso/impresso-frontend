<template>
  <div class="filter-range" data-testid="filter-range">
    <base-title-bar>
      {{ $t(`label.${facet.type}.filterTitle`) }}
      <info-button class="ml-1" :target="facet.type" name="filter-range" />

      <template v-slot:options>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="handleResetFilters"
          v-if="value.length === 2"
        >
          {{ $t('actions.reset') }}
        </b-button>
      </template>
    </base-title-bar>
    <histogram-slider
      class="histo-slider"
      v-model="sliderValue"
      :buckets="sliderBuckets"
      :only-range-labels="true"
      :scale-type="'symlog'"
      :sliderValue="value"
      @change="changeValue"
    />

    <div class="p-2" v-if="valuesHaveChanged">
      <b-row no-gutters>
        <b-col class="pr-1">
          <b-button size="sm" block variant="outline-primary" @click="resetValues">
            {{ $t('actions.dismiss') }}
          </b-button>
        </b-col>
        <b-col class="pl-1">
          <b-button size="sm" block variant="outline-primary" @click="applyValues">
            {{ $t('actions.apply') }}
          </b-button>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script lang="ts">
import BaseTitleBar from '@/components/base/BaseTitleBar.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import HistogramSlider from '@/components/modules/vis/HistogramSlider.vue'
import { Facet, Filter } from '@/models'
import { PropType } from 'vue'

export interface IData {
  value: number[]
}

export default {
  data: () =>
    ({
      value: []
    }) satisfies IData,
  props: {
    facet: {
      type: Object as PropType<Facet>,
      required: true
    },
    facetFilters: {
      type: Array as PropType<Filter[]>,
      required: true
    }
  },
  emits: ['changed'],
  computed: {
    /** @returns {import('@/models').Bucket[]} */
    sliderBuckets() {
      return this.facet.buckets
    },
    /** @returns {boolean} */
    valuesHaveChanged() {
      return (
        this.value.length === 2 && JSON.stringify(this.value) !== JSON.stringify(this.filterValue)
      )
    },
    sliderValue: {
      /** @returns {number[]} */
      get() {
        if (this.value.length === 2) return this.value
        return this.filterValue
      },
      /** @param val {number[]} */
      set(val) {
        this.value = val
      }
    },
    /** @returns {number[]} */
    filterValue() {
      if (this.facetFilters.length === 0) return []
      const firstFilter = this.facetFilters[0]
      if (typeof firstFilter.q === 'undefined') return []
      if (!Array.isArray(firstFilter.q)) return [parseInt(firstFilter.q, 10)]
      else return firstFilter.q.map(v => parseInt(v, 10))
    }
  },
  methods: {
    changeValue(val) {
      this.value = val
    },
    resetValues() {
      this.value = []
    },
    applyValues() {
      if (this.value.length !== 2) return this.$emit('changed', [])
      const filter = {
        type: this.facet.type,
        q: this.value.map(v => v.toString())
      }
      this.$emit('changed', [filter])
    },
    handleResetFilters() {
      this.value = []
      this.applyValues()
    }
  },
  components: {
    HistogramSlider,
    BaseTitleBar,
    InfoButton
  }
}
</script>
