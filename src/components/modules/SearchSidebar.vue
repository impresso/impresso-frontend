<template lang="html">
  <i-layout-section :width="width">
    <!--  header -->
    <div slot="header" class="border-bottom bg-light">
      <search-tabs/>
      <div class="py-3 px-3">
        <search-pills
          :filters="filters"
          @changed="handleFiltersChanged"
        />
        <span v-if="filtersRemoved.length">
          <em class="small" v-html="$tc('numbers.filtersRemoved', filtersRemoved.length, {
            n: filtersRemoved.length,
          })"/>
          &nbsp;
          <info-button :name="infoButtonName" />
        </span>
        <slot name="header">
          <!-- extra header -->
        </slot>
      </div>
    </div>
    <!-- body (aka) facets -->
    <div class="pt-3 pb-5">
      <slot>
        <!-- slot here for extra facets -->
      </slot>

      <search-facets
        :store="store"
        :facets="facets"
        :filters="filters"
        @changed="handleFiltersChanged"/>
        <!-- @submit-facet="onAddFilter"
        @update-filter="onFilterUpdated"
        @reset-filter="onFilterReset"/> -->

        <div :class="{ active: filters.length }" class="resetter position-absolute">
          <b-button class="mb-2"
            variant="outline-danger"
            size="sm" @click="reset">{{ $t('action.reset') }}</b-button>
        </div>
    </div>
  </i-layout-section>
</template>

<script>
import SearchPills from '@/components/SearchPills';
import SearchTabs from '@/components/modules/SearchTabs';
import InfoButton from '@/components/base/InfoButton';
import SearchFacets from '@/components/SearchFacets';

export default {
  props: {
    store: {
      type: String,
    },
    width: {
      type: String,
      default: '400px',
    },
    excludedTypes: {
      type: Array,
      default: () => [],
    },
    filters: {
      /** @type {import('vue').PropType<import('../../models/models').Filter[]>} */
      type: Array,
      default: () => [],
    },
    facets: {
      /** @type {import('vue').PropType<import('../../models/models').Facet[]>} */
      type: Array,
      default: () => [],
    },
    filtersRemoved: {
      /** @type {import('vue').PropType<import('../../models/models').Filter[]>} */
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleFiltersChanged(filters) {
      // propagate filters changed
      this.$emit('changed', filters);
    },
    reset() {
      this.$emit('changed', []);
    },
  },
  computed: {
    infoButtonName() {
      return ['how-', this.store, '-work-with-search-filters'].join('');
    },
  },
  components: {
    SearchPills,
    InfoButton,
    SearchTabs,
    SearchFacets,
  },
};
</script>

<style lang="scss" scoped>
.resetter{
  bottom: -7rem;
  width: 100%;
  height: 6rem;
  padding-top: 1rem;
  text-align: center;
  background: rgb(248,249,250);
  background: radial-gradient(31% 60% at center, #ff63475e, rgba(248, 249, 250, 0));
  background-repeat: no-repeat;
  background-position-y: 7rem;
  pointer-events: none;
  transition: transform .6s cubic-bezier(.8,-.5,.2,1.4);

  &.active {
    transform: translateY(-5rem);
  }

  > .btn {
    background: white;
    pointer-events: auto;
    &:hover{
      background: tomato;
    }
  }
}

</style>
