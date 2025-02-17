<template>
  <i-layout-section :width="width">
    <!--  header -->
    <template v-slot:header>
      <div class="border-bottom bg-light">
        <slot name="tabs">
          <search-tabs />
        </slot>
        <div class="my-3 mx-3" :class="{ focus: hasFocus }">
          <search-pills :filters="filters" @changed="handleFiltersChanged" />
          <span v-if="filters.length && ignoredFilters.length">
            <i
              class="small"
              v-html="
                $tc('numbers.ignoredFilters', ignoredFilters.length, {
                  n: ignoredFilters.length
                })
              "
            />

            <info-button :name="infoButtonName" />
          </span>
          <slot name="header" :focusHandler="focusHandler">
            <!-- extra header -->
          </slot>
        </div>
      </div>
    </template>
    <!-- body (aka) facets -->
    <div class="pt-3 pb-5">
      <slot>
        <!-- slot here for extra facets -->
      </slot>
      <search-facets
        :facets="facets"
        :filters="filters"
        :start-year="startYear"
        :end-year="endYear"
        @changed="handleFiltersChanged"
      />
    </div>
  </i-layout-section>
</template>

<script>
import SearchPills from '@/components/SearchPills.vue'
import SearchTabs from '@/components/modules/SearchTabs.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import SearchFacets from '@/components/SearchFacets.vue'

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').Facet} Facet
 */

export default {
  data: () => ({
    hasFocus: false
  }),
  props: {
    /* Used for helper button */
    contextTag: {
      type: String
    },
    width: {
      type: String,
      default: '400px'
    },
    /** @type {import('vue').PropOptions<Filter[]>} */
    filters: {
      type: Array,
      default: () => []
    },
    /** @type {import('vue').PropOptions<Facet[]>} */
    facets: {
      type: Array,
      default: () => []
    },
    /** @type {import('vue').PropOptions<Filter[]>} */
    ignoredFilters: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      // propagate filters changed
      this.$emit('changed', filters)
    },
    focusHandler(value) {
      this.hasFocus = !!value
    }
  },
  computed: {
    /** @return {boolean} */
    /** @return {string} */
    infoButtonName() {
      if (this.contextTag === 'search-images') {
        return 'why-does-the-image-search-have-limited-filters'
      }
      return `how-${this.contextTag}-work-with-search-filters`
    },
    startYear() {
      return window.impressoDocumentsYearSpan.firstYear
    },
    endYear() {
      return window.impressoDocumentsYearSpan.lastYear
    }
  },
  components: {
    SearchPills,
    InfoButton,
    SearchTabs,
    SearchFacets
  }
}
</script>
<style lang="scss">
@import '@/styles/variables.sass';
.search-box {
  border: 1px solid #777;
}
.search-box.focus {
  box-shadow: 0 0 0 0.2rem rgba(17, 17, 17, 0.5);
  border-color: black;
  border-radius: 2px;
}
.bg-dark {
  .search-box.focus {
    box-shadow: 0 0 0 0.2rem rgba(17, 17, 17, 0.5);
    border-color: white;
  }
}
</style>
