<template lang="html">
  <div>
    <div class="mt-2" v-if="filters.length > 0">
      <search-pills :filters="filters"
        :enableAddFilter=true
        :includedFilterTypes="supportedFilterTypes"
        @changed="handleFiltersChanged" />
    </div>

    <search-input class="mt-3"
        @submit="onSubmitted"
        :initial="value"
        :placeholder="$t('placeholder')"/>

    <div class="mt-3">
      <label class="mr-2">{{$t('sortBy')}}</label>
      <i-dropdown v-model="orderByModel"
      :options="orderByOptions"
      size="sm"
      variant="outline-primary" />
    </div>
  </div>
</template>

<script>
import SearchInput from '@/components/modules/SearchInput'
import SearchPills from '@/components//SearchPills';

const SortingMethod = {
  PassagesCount: 'passages-count'
}

export default {
  data: () => ({
  }),
  props: {
    value: String,
    orderBy: {
      type: String,
    },
    filters: {
      type: Array,
      default: () => []
    },
    supportedFilterTypes: {
      type: Array,
      default: () => []
    }
  },
  components: {
    SearchInput,
    SearchPills
  },
  methods: {
    onSubmitted({ q }) {
      this.$emit('submit', q)
    },
    handleFiltersChanged(filters) {
      this.$emit('filtersChanged', filters)
    }
  },
  computed: {
    orderByModel: {
      get() {
        return this.orderBy || '';
      },
      set(val) {
        this.$emit('orderByChanged', val === '' ? undefined : val)
      },
    },
    orderByOptions() {
      return [
        {
          value: '',
          text: this.$t('sort.default'),
          disabled: false,
        },
        {
          value: `-${SortingMethod.PassagesCount}`,
          text: `${this.$t('sort.passagesCount')} ${this.$t('sort.desc')}`,
          disabled: false,
        },
        {
          value: SortingMethod.PassagesCount,
          text: `${this.$t('sort.passagesCount')} ${this.$t('sort.asc')}`,
          disabled: false,
        }
      ];
    }
  }
};
</script>

<style lang="scss" scoped>
  @import "impresso-theme/src/scss/variables.sass";
  .label {
    font-family: $font-family-sans-serif;
    font-variant: all-small-caps;
  }
</style>

<i18n>
{
  "en": {
    "searchInPatternsLabel": "search in text reuse patterns",
    "placeholder": "search in text reuse patterns ...",
    "sort": {
      "default": "Default",
      "passagesCount": "Number of passages",
      "asc": "↑",
      "desc": "↓"
    }
  }
}
</i18n>
