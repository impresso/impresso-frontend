<template lang="html">
  <div>
    <b-nav tabs class="tabbed-nav pl-2 pt-1 align-items-end">
      <b-nav-item class="small-caps" :active="true">
  {{$t('searchClustersLabel')}}
      </b-nav-item>
    </b-nav>

    <div class="pt-2">
      <h6 class="label">{{$t('searchInPatternsLabel')}}</h6>
      <search-input class="pt-2"
        @submit="onSubmitted"
        :initial="value"
        :placeholder="$t('placeholder')"/>
    </div>

    <div class="pt-2">
      <i-dropdown v-model="orderByModel"
      :options="orderByOptions"
      size="sm"
      variant="outline-primary" />
    </div>
  </div>
</template>

<script>
import SearchInput from '@/components/modules/SearchInput'

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
    }
  },
  components: {
    SearchInput,
  },
  methods: {
    onSubmitted({ q }) {
      this.$emit('submit', q)
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
    "searchClustersLabel": "search clusters",
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