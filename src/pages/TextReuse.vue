<template>
  <i-layout>
    <i-layout-section width="400px">
      <b-tabs pills class="mx-2 pt-2">
        <template v-slot:tabs-end>
          <b-nav-item class="active" active-class="none">
            <span
              v-html="
                $tc('searchTextReuseLabel', 10000, {
                  n: $n(10000),
                })
              "
            />
            <span v-if="isLoading" class=""> &mdash; {{ $t('actions.loading') }}</span>
          </b-nav-item>
        </template>
      </b-tabs>
      <div class="p-3 border-bottom bg-light">
        <search-pills :filters="filters" @changed="handleFiltersChanged" />
        <search-input @submit="handleSearchInputSubmit" placeholder="..."></search-input>
      </div>
    </i-layout-section>
    <router-view></router-view>
  </i-layout>
</template>
<script>
import SearchPills from '@/components/SearchPills'
import SearchInput from '@/components/modules/SearchInput'
import { searchQueryGetter } from '@/logic/queryParams'
import { serializeFilters, optimizeFilters } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'

/**
 * @typedef {import('../models').Filter} Filter
 * @typedef {import('../models').SearchQuery} SearchQuery
 */

export default {
  components: {
    SearchPills,
    SearchInput,
  },
  data: () => ({
    isLoading: false,
  }),
  computed: {
    searchQuery: {
      ...searchQueryGetter(),
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return this.searchQuery.filters
    },
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      // eslint-disable-next-line
      console.debug('[TextReuse] handleFiltersChanged', filters)
      this.$navigation.updateQueryParameters({
        [CommonQueryParameters.SearchFilters]: serializeFilters(optimizeFilters(filters)),
      })
    },
    handleSearchInputSubmit(filters) {
      // eslint-disable-next-line
      console.debug('[TextReuse] handleSearchInputSubmit', filters)
    },
    focusHandler(value) {
      this.hasFocus = !!value
    },
  },
  mounted() {
    // eslint-disable-next-line
    console.debug('[TextReuse] @mounted')
  },
}
</script>

<i18n>
  {
    "en": {
      "searchTextReuseLabel": "search text reuse passages"
    }
  }
  </i18n>
